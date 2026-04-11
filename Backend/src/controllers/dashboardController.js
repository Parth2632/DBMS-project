const pool = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const queries = {
      totalVisitors: 'SELECT COUNT(*) as count FROM visitor',
      totalHosts: 'SELECT COUNT(*) as count FROM host',
      totalVisitRequests: 'SELECT COUNT(*) as count FROM visit_request',
      currentVisitors: `
        SELECT COUNT(*) as count 
        FROM entry_log 
        WHERE exit_time IS NULL
      `,
      pendingRequests: `
        SELECT COUNT(*) as count 
        FROM visit_request 
        WHERE approval_status = 'Pending'
      `,
      approvedRequests: `
        SELECT COUNT(*) as count 
        FROM visit_request 
        WHERE approval_status = 'Approved'
      `,
      rejectedRequests: `
        SELECT COUNT(*) as count 
        FROM visit_request 
        WHERE approval_status = 'Rejected'
      `,
      completedVisits: `
        SELECT COUNT(*) as count 
        FROM visit_request 
        WHERE approval_status = 'Completed'
      `,
      todayVisits: `
        SELECT COUNT(*) as count 
        FROM visit_request 
        WHERE DATE(visit_date) = CURDATE()
      `,
      todayCheckins: `
        SELECT COUNT(*) as count 
        FROM entry_log 
        WHERE DATE(entry_time) = CURDATE()
      `
    };

    const [
      totalVisitors,
      totalHosts,
      totalVisitRequests,
      currentVisitors,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      completedVisits,
      todayVisits,
      todayCheckins
    ] = await Promise.all([
      pool.query(queries.totalVisitors),
      pool.query(queries.totalHosts),
      pool.query(queries.totalVisitRequests),
      pool.query(queries.currentVisitors),
      pool.query(queries.pendingRequests),
      pool.query(queries.approvedRequests),
      pool.query(queries.rejectedRequests),
      pool.query(queries.completedVisits),
      pool.query(queries.todayVisits),
      pool.query(queries.todayCheckins)
    ]);

    const stats = {
      totalVisitors: totalVisitors[0][0].count,
      totalHosts: totalHosts[0][0].count,
      totalVisitRequests: totalVisitRequests[0][0].count,
      currentVisitors: currentVisitors[0][0].count,
      pendingRequests: pendingRequests[0][0].count,
      approvedRequests: approvedRequests[0][0].count,
      rejectedRequests: rejectedRequests[0][0].count,
      completedVisits: completedVisits[0][0].count,
      todayVisits: todayVisits[0][0].count,
      todayCheckins: todayCheckins[0][0].count
    };

    return res.status(200).json({
      message: 'Dashboard stats retrieved successfully',
      data: stats
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving dashboard stats',
      error: error.message
    });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const query = `
      SELECT 
        vr.request_id,
        vr.approval_status,
        vr.requested_at,
        vr.approval_time,
        v.full_name AS visitor_name,
        h.full_name AS host_name,
        el.entry_time,
        el.exit_time,
        CASE
          WHEN el.entry_time IS NOT NULL AND el.exit_time IS NULL THEN 'Checked In'
          WHEN el.entry_time IS NOT NULL AND el.exit_time IS NOT NULL THEN 'Checked Out'
          WHEN vr.approval_status = 'Pending' THEN 'Request Pending'
          WHEN vr.approval_status = 'Approved' THEN 'Request Approved'
          WHEN vr.approval_status = 'Rejected' THEN 'Request Rejected'
          ELSE 'Unknown'
        END AS activity_type
      FROM visit_request vr
      JOIN visitor v ON vr.visitor_id = v.visitor_id
      JOIN host h ON vr.host_id = h.host_id
      LEFT JOIN entry_log el ON vr.request_id = el.request_id
      ORDER BY 
        CASE
          WHEN el.exit_time IS NOT NULL THEN el.exit_time
          WHEN el.entry_time IS NOT NULL THEN el.entry_time
          WHEN vr.approval_time IS NOT NULL THEN vr.approval_time
          ELSE vr.requested_at
        END DESC
      LIMIT ?
    `;

    const [activity] = await pool.query(query, [parseInt(limit)]);

    return res.status(200).json({
      message: 'Recent activity retrieved successfully',
      data: activity
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving recent activity',
      error: error.message
    });
  }
};

const getVisitStatsByDate = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: 'start_date and end_date are required'
      });
    }

    const query = `
      SELECT 
        DATE(vr.visit_date) as visit_date,
        COUNT(*) as total_requests,
        SUM(CASE WHEN vr.approval_status = 'Approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN vr.approval_status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN vr.approval_status = 'Completed' THEN 1 ELSE 0 END) as completed,
        COUNT(DISTINCT CASE WHEN el.entry_time IS NOT NULL THEN vr.request_id END) as checked_in
      FROM visit_request vr
      LEFT JOIN entry_log el ON vr.request_id = el.request_id
      WHERE vr.visit_date BETWEEN ? AND ?
      GROUP BY DATE(vr.visit_date)
      ORDER BY vr.visit_date ASC
    `;

    const [stats] = await pool.query(query, [start_date, end_date]);

    return res.status(200).json({
      message: 'Visit stats by date retrieved successfully',
      data: stats
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving visit stats by date',
      error: error.message
    });
  }
};

const getTopHosts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const query = `
      SELECT 
        h.host_id,
        h.full_name,
        h.department,
        h.host_type,
        COUNT(vr.request_id) as total_requests,
        SUM(CASE WHEN vr.approval_status = 'Approved' THEN 1 ELSE 0 END) as approved_requests,
        SUM(CASE WHEN vr.approval_status = 'Completed' THEN 1 ELSE 0 END) as completed_requests
      FROM host h
      LEFT JOIN visit_request vr ON h.host_id = vr.host_id
      GROUP BY h.host_id, h.full_name, h.department, h.host_type
      ORDER BY total_requests DESC
      LIMIT ?
    `;

    const [hosts] = await pool.query(query, [parseInt(limit)]);

    return res.status(200).json({
      message: 'Top hosts retrieved successfully',
      data: hosts
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving top hosts',
      error: error.message
    });
  }
};

const getTopVisitors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const query = `
      SELECT 
        v.visitor_id,
        v.full_name,
        v.phone_no,
        COUNT(vr.request_id) as total_requests,
        SUM(CASE WHEN vr.approval_status = 'Approved' THEN 1 ELSE 0 END) as approved_requests,
        SUM(CASE WHEN vr.approval_status = 'Completed' THEN 1 ELSE 0 END) as completed_requests,
        MAX(vr.visit_date) as last_visit_date
      FROM visitor v
      LEFT JOIN visit_request vr ON v.visitor_id = vr.visitor_id
      GROUP BY v.visitor_id, v.full_name, v.phone_no
      HAVING total_requests > 0
      ORDER BY total_requests DESC
      LIMIT ?
    `;

    const [visitors] = await pool.query(query, [parseInt(limit)]);

    return res.status(200).json({
      message: 'Top visitors retrieved successfully',
      data: visitors
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving top visitors',
      error: error.message
    });
  }
};

const getAverageVisitDuration = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        AVG(TIMESTAMPDIFF(MINUTE, el.entry_time, el.exit_time)) as avg_duration_minutes,
        MIN(TIMESTAMPDIFF(MINUTE, el.entry_time, el.exit_time)) as min_duration_minutes,
        MAX(TIMESTAMPDIFF(MINUTE, el.entry_time, el.exit_time)) as max_duration_minutes,
        COUNT(*) as total_completed_visits
      FROM entry_log el
      JOIN visit_request vr ON el.request_id = vr.request_id
      WHERE el.exit_time IS NOT NULL
    `;
    
    let params = [];

    if (start_date && end_date) {
      query += ' AND vr.visit_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    const [stats] = await pool.query(query, params);

    return res.status(200).json({
      message: 'Average visit duration retrieved successfully',
      data: stats[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving average visit duration',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getVisitStatsByDate,
  getTopHosts,
  getTopVisitors,
  getAverageVisitDuration
};
