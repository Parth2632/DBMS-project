const pool = require('../config/db');

const checkInVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid request ID is required'
      });
    }

    const checkQuery = `
      SELECT vr.approval_status, el.log_id
      FROM visit_request vr
      LEFT JOIN entry_log el ON vr.request_id = el.request_id
      WHERE vr.request_id = ?
    `;
    
    const [checkResult] = await pool.query(checkQuery, [id]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({
        message: 'Visit request not found'
      });
    }

    if (checkResult[0].approval_status !== 'Approved') {
      return res.status(400).json({
        message: 'Only approved requests can be checked in'
      });
    }

    if (checkResult[0].log_id !== null) {
      return res.status(400).json({
        message: 'Visitor already checked in'
      });
    }

    const insertQuery = `
      INSERT INTO entry_log (request_id, entry_time)
      VALUES (?, NOW())
    `;

    const [result] = await pool.query(insertQuery, [id]);

    return res.status(200).json({
      message: 'Visitor checked in successfully',
      logId: result.insertId
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error checking in visitor',
      error: error.message
    });
  }
};

const checkOutVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid request ID is required'
      });
    }

    const checkQuery = `
      SELECT el.log_id, el.entry_time, el.exit_time
      FROM entry_log el
      WHERE el.request_id = ?
    `;
    
    const [checkResult] = await pool.query(checkQuery, [id]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({
        message: 'Entry log not found - visitor not checked in'
      });
    }

    if (checkResult[0].exit_time !== null) {
      return res.status(400).json({
        message: 'Visitor already checked out'
      });
    }

    await pool.query('START TRANSACTION');

    try {
      const updateLogQuery = `
        UPDATE entry_log 
        SET exit_time = NOW()
        WHERE request_id = ?
      `;

      await pool.query(updateLogQuery, [id]);

      const updateRequestQuery = `
        UPDATE visit_request 
        SET approval_status = 'Completed'
        WHERE request_id = ?
      `;

      await pool.query(updateRequestQuery, [id]);

      await pool.query('COMMIT');

      return res.status(200).json({
        message: 'Visitor checked out successfully'
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Error checking out visitor',
      error: error.message
    });
  }
};

const getCurrentVisitors = async (req, res) => {
  try {
    const query = `
      SELECT 
        vr.request_id,
        v.full_name AS visitor_name,
        v.phone_no AS visitor_phone,
        v.id_proof_type,
        v.id_proof_number,
        h.full_name AS host_name,
        h.department AS host_department,
        h.phone_no AS host_phone,
        h.host_type AS host_type,
        vr.purpose,
        vr.visit_date,
        el.entry_time,
        TIMESTAMPDIFF(MINUTE, el.entry_time, NOW()) AS minutes_inside
      FROM entry_log el
      JOIN visit_request vr ON el.request_id = vr.request_id
      JOIN visitor v ON vr.visitor_id = v.visitor_id
      JOIN host h ON vr.host_id = h.host_id
      WHERE el.exit_time IS NULL
      ORDER BY el.entry_time DESC
    `;

    const [visitors] = await pool.query(query);

    return res.status(200).json({
      message: 'Current visitors retrieved successfully',
      data: visitors
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving current visitors',
      error: error.message
    });
  }
};

const getVisitHistory = async (req, res) => {
  try {
    const { start_date, end_date, visitor_id, host_id } = req.query;
    
    let query = `
      SELECT 
        vr.request_id,
        v.full_name AS visitor_name,
        v.phone_no AS visitor_phone,
        h.full_name AS host_name,
        h.department AS host_department,
        h.host_type AS host_type,
        vr.visit_date,
        vr.purpose,
        vr.approval_status,
        vr.requested_at,
        el.entry_time,
        el.exit_time,
        CASE 
          WHEN el.entry_time IS NOT NULL AND el.exit_time IS NOT NULL 
          THEN TIMESTAMPDIFF(MINUTE, el.entry_time, el.exit_time)
          WHEN el.entry_time IS NOT NULL AND el.exit_time IS NULL 
          THEN TIMESTAMPDIFF(MINUTE, el.entry_time, NOW())
          ELSE NULL
        END AS total_visit_minutes
      FROM visit_request vr
      JOIN visitor v ON vr.visitor_id = v.visitor_id
      JOIN host h ON vr.host_id = h.host_id
      LEFT JOIN entry_log el ON vr.request_id = el.request_id
    `;
    
    let params = [];
    let whereConditions = [];

    if (start_date) {
      whereConditions.push('vr.visit_date >= ?');
      params.push(start_date);
    }

    if (end_date) {
      whereConditions.push('vr.visit_date <= ?');
      params.push(end_date);
    }

    if (visitor_id) {
      whereConditions.push('vr.visitor_id = ?');
      params.push(visitor_id);
    }

    if (host_id) {
      whereConditions.push('vr.host_id = ?');
      params.push(host_id);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' ORDER BY vr.requested_at DESC';
    const [history] = await pool.query(query, params);

    return res.status(200).json({
      message: 'Visit history retrieved successfully',
      data: history
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving visit history',
      error: error.message
    });
  }
};

const getEntryLogs = async (req, res) => {
  try {
    const { date } = req.query;
    
    let query = `
      SELECT 
        el.log_id,
        el.request_id,
        el.entry_time,
        el.exit_time,
        v.full_name AS visitor_name,
        h.full_name AS host_name,
        vr.purpose,
        CASE 
          WHEN el.entry_time IS NOT NULL AND el.exit_time IS NOT NULL 
          THEN TIMESTAMPDIFF(MINUTE, el.entry_time, el.exit_time)
          WHEN el.entry_time IS NOT NULL AND el.exit_time IS NULL 
          THEN TIMESTAMPDIFF(MINUTE, el.entry_time, NOW())
          ELSE NULL
        END AS total_visit_minutes
      FROM entry_log el
      JOIN visit_request vr ON el.request_id = vr.request_id
      JOIN visitor v ON vr.visitor_id = v.visitor_id
      JOIN host h ON vr.host_id = h.host_id
    `;
    
    let params = [];

    if (date) {
      query += ' WHERE DATE(el.entry_time) = ?';
      params.push(date);
    }

    query += ' ORDER BY el.entry_time DESC';
    const [logs] = await pool.query(query, params);

    return res.status(200).json({
      message: 'Entry logs retrieved successfully',
      data: logs
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving entry logs',
      error: error.message
    });
  }
};

module.exports = {
  checkInVisitor,
  checkOutVisitor,
  getCurrentVisitors,
  getVisitHistory,
  getEntryLogs
};
