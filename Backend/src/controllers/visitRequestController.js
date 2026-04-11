const pool = require('../config/db');

const createVisitRequest = async (req, res) => {
  try {
    const { visitor_id, host_id, visit_date, purpose } = req.body;

    if (!visitor_id || !host_id || !visit_date || !purpose) {
      return res.status(400).json({
        message: 'visitor_id, host_id, visit_date, and purpose are required'
      });
    }

    const visitorQuery = 'SELECT visitor_id FROM visitor WHERE visitor_id = ?';
    const [visitorResult] = await pool.query(visitorQuery, [visitor_id]);
    
    if (visitorResult.length === 0) {
      return res.status(404).json({
        message: 'Visitor not found'
      });
    }

    const hostQuery = 'SELECT host_id FROM host WHERE host_id = ?';
    const [hostResult] = await pool.query(hostQuery, [host_id]);
    
    if (hostResult.length === 0) {
      return res.status(404).json({
        message: 'Host not found'
      });
    }

    const query = `
      INSERT INTO visit_request (visitor_id, host_id, visit_date, purpose)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      visitor_id,
      host_id,
      visit_date,
      purpose
    ]);

    return res.status(201).json({
      message: 'Visit request created successfully',
      requestId: result.insertId
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error creating visit request',
      error: error.message
    });
  }
};

const getAllVisitRequests = async (req, res) => {
  try {
    const { status, visitor_id, host_id } = req.query;
    
    let query = `
      SELECT 
        vr.request_id,
        vr.visitor_id,
        vr.host_id,
        vr.visit_date,
        vr.purpose,
        vr.approval_status,
        vr.requested_at,
        vr.approved_by_admin_id,
        vr.approval_time,
        vr.rejection_reason,
        v.full_name AS visitor_name,
        v.phone_no AS visitor_phone,
        h.full_name AS host_name,
        h.department AS host_department,
        h.host_type AS host_type,
        a.full_name AS approved_by_name
      FROM visit_request vr
      JOIN visitor v ON vr.visitor_id = v.visitor_id
      JOIN host h ON vr.host_id = h.host_id
      LEFT JOIN admin a ON vr.approved_by_admin_id = a.admin_id
    `;
    
    let params = [];
    let whereConditions = [];

    if (status) {
      whereConditions.push('vr.approval_status = ?');
      params.push(status);
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
    const [requests] = await pool.query(query, params);
    
    return res.status(200).json({
      message: 'Visit requests retrieved successfully',
      data: requests
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving visit requests',
      error: error.message
    });
  }
};

const getVisitRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid request ID is required'
      });
    }

    const query = `
      SELECT 
        vr.request_id,
        vr.visitor_id,
        vr.host_id,
        vr.visit_date,
        vr.purpose,
        vr.approval_status,
        vr.requested_at,
        vr.approved_by_admin_id,
        vr.approval_time,
        vr.rejection_reason,
        v.full_name AS visitor_name,
        v.phone_no AS visitor_phone,
        v.email AS visitor_email,
        h.full_name AS host_name,
        h.department AS host_department,
        h.phone_no AS host_phone,
        h.email AS host_email,
        h.host_type AS host_type,
        h.roll_number,
        a.full_name AS approved_by_name,
        a.role AS approved_by_role
      FROM visit_request vr
      JOIN visitor v ON vr.visitor_id = v.visitor_id
      JOIN host h ON vr.host_id = h.host_id
      LEFT JOIN admin a ON vr.approved_by_admin_id = a.admin_id
      WHERE vr.request_id = ?
    `;
    
    const [requests] = await pool.query(query, [id]);
    
    if (requests.length === 0) {
      return res.status(404).json({
        message: 'Visit request not found'
      });
    }

    return res.status(200).json({
      message: 'Visit request retrieved successfully',
      data: requests[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving visit request',
      error: error.message
    });
  }
};

const approveVisitRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid request ID is required'
      });
    }

    if (!admin_id || isNaN(admin_id)) {
      return res.status(400).json({
        message: 'Valid admin ID is required'
      });
    }

    const adminQuery = 'SELECT admin_id FROM admin WHERE admin_id = ?';
    const [adminResult] = await pool.query(adminQuery, [admin_id]);
    
    if (adminResult.length === 0) {
      return res.status(404).json({
        message: 'Admin not found'
      });
    }

    const checkQuery = 'SELECT approval_status FROM visit_request WHERE request_id = ?';
    const [checkResult] = await pool.query(checkQuery, [id]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({
        message: 'Visit request not found'
      });
    }

    if (checkResult[0].approval_status !== 'Pending') {
      return res.status(400).json({
        message: 'Only pending requests can be approved'
      });
    }

    const updateQuery = `
      UPDATE visit_request 
      SET approval_status = 'Approved',
          approved_by_admin_id = ?,
          approval_time = NOW()
      WHERE request_id = ?
    `;

    const [result] = await pool.query(updateQuery, [admin_id, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Visit request not found'
      });
    }

    return res.status(200).json({
      message: 'Visit request approved successfully'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error approving visit request',
      error: error.message
    });
  }
};

const rejectVisitRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_id, rejection_reason } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid request ID is required'
      });
    }

    if (!admin_id || isNaN(admin_id)) {
      return res.status(400).json({
        message: 'Valid admin ID is required'
      });
    }

    if (!rejection_reason || rejection_reason.trim() === '') {
      return res.status(400).json({
        message: 'Rejection reason is required'
      });
    }

    const adminQuery = 'SELECT admin_id FROM admin WHERE admin_id = ?';
    const [adminResult] = await pool.query(adminQuery, [admin_id]);
    
    if (adminResult.length === 0) {
      return res.status(404).json({
        message: 'Admin not found'
      });
    }

    const checkQuery = 'SELECT approval_status FROM visit_request WHERE request_id = ?';
    const [checkResult] = await pool.query(checkQuery, [id]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({
        message: 'Visit request not found'
      });
    }

    if (checkResult[0].approval_status !== 'Pending') {
      return res.status(400).json({
        message: 'Only pending requests can be rejected'
      });
    }

    const updateQuery = `
      UPDATE visit_request 
      SET approval_status = 'Rejected',
          approved_by_admin_id = ?,
          approval_time = NOW(),
          rejection_reason = ?
      WHERE request_id = ?
    `;

    const [result] = await pool.query(updateQuery, [admin_id, rejection_reason.trim(), id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Visit request not found'
      });
    }

    return res.status(200).json({
      message: 'Visit request rejected successfully'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error rejecting visit request',
      error: error.message
    });
  }
};

const updateVisitRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { visit_date, purpose } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid request ID is required'
      });
    }

    if (!visit_date || !purpose) {
      return res.status(400).json({
        message: 'visit_date and purpose are required'
      });
    }

    const checkQuery = 'SELECT approval_status FROM visit_request WHERE request_id = ?';
    const [checkResult] = await pool.query(checkQuery, [id]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({
        message: 'Visit request not found'
      });
    }

    if (checkResult[0].approval_status !== 'Pending') {
      return res.status(400).json({
        message: 'Only pending requests can be updated'
      });
    }

    const updateQuery = `
      UPDATE visit_request 
      SET visit_date = ?, purpose = ?
      WHERE request_id = ?
    `;

    const [result] = await pool.query(updateQuery, [visit_date, purpose, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Visit request not found'
      });
    }

    return res.status(200).json({
      message: 'Visit request updated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating visit request',
      error: error.message
    });
  }
};

const deleteVisitRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid request ID is required'
      });
    }

    const checkQuery = 'SELECT approval_status FROM visit_request WHERE request_id = ?';
    const [checkResult] = await pool.query(checkQuery, [id]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({
        message: 'Visit request not found'
      });
    }

    if (checkResult[0].approval_status !== 'Pending') {
      return res.status(400).json({
        message: 'Only pending requests can be deleted'
      });
    }

    const query = 'DELETE FROM visit_request WHERE request_id = ?';
    const [result] = await pool.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Visit request not found'
      });
    }

    return res.status(200).json({
      message: 'Visit request deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting visit request',
      error: error.message
    });
  }
};

module.exports = {
  createVisitRequest,
  getAllVisitRequests,
  getVisitRequestById,
  approveVisitRequest,
  rejectVisitRequest,
  updateVisitRequest,
  deleteVisitRequest
};
