const pool = require('../config/db');

const createHost = async (req, res) => {
  try {
    const { full_name, department, phone_no, email, host_type, roll_number } = req.body;

    if (!full_name || !host_type) {
      return res.status(400).json({
        message: 'full_name and host_type are required'
      });
    }

    if (!['Student', 'Faculty', 'Staff'].includes(host_type)) {
      return res.status(400).json({
        message: 'host_type must be one of: Student, Faculty, Staff'
      });
    }

    if (host_type === 'Student' && !roll_number) {
      return res.status(400).json({
        message: 'roll_number is required for Student hosts'
      });
    }

    const query = `
      INSERT INTO host (full_name, department, phone_no, email, host_type, roll_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      full_name,
      department || null,
      phone_no || null,
      email || null,
      host_type,
      roll_number || null
    ]);

    return res.status(201).json({
      message: 'Host created successfully',
      hostId: result.insertId
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Host with same email or roll number already exists'
      });
    }

    return res.status(500).json({
      message: 'Error creating host',
      error: error.message
    });
  }
};

const getAllHosts = async (req, res) => {
  try {
    const { host_type } = req.query;
    let query = 'SELECT host_id, full_name, department, phone_no, email, host_type, roll_number FROM host';
    let params = [];

    if (host_type) {
      query += ' WHERE host_type = ?';
      params.push(host_type);
    }

    query += ' ORDER BY host_id DESC';
    const [hosts] = await pool.query(query, params);
    
    return res.status(200).json({
      message: 'Hosts retrieved successfully',
      data: hosts
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving hosts',
      error: error.message
    });
  }
};

const getHostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid host ID is required'
      });
    }

    const query = 'SELECT host_id, full_name, department, phone_no, email, host_type, roll_number FROM host WHERE host_id = ?';
    const [hosts] = await pool.query(query, [id]);
    
    if (hosts.length === 0) {
      return res.status(404).json({
        message: 'Host not found'
      });
    }

    return res.status(200).json({
      message: 'Host retrieved successfully',
      data: hosts[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving host',
      error: error.message
    });
  }
};

const updateHost = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, department, phone_no, email, host_type, roll_number } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid host ID is required'
      });
    }

    if (!full_name || !host_type) {
      return res.status(400).json({
        message: 'full_name and host_type are required'
      });
    }

    if (!['Student', 'Faculty', 'Staff'].includes(host_type)) {
      return res.status(400).json({
        message: 'host_type must be one of: Student, Faculty, Staff'
      });
    }

    if (host_type === 'Student' && !roll_number) {
      return res.status(400).json({
        message: 'roll_number is required for Student hosts'
      });
    }

    const query = `
      UPDATE host 
      SET full_name = ?, department = ?, phone_no = ?, email = ?, host_type = ?, roll_number = ?
      WHERE host_id = ?
    `;

    const [result] = await pool.query(query, [
      full_name,
      department || null,
      phone_no || null,
      email || null,
      host_type,
      roll_number || null,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Host not found'
      });
    }

    return res.status(200).json({
      message: 'Host updated successfully'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Host with same email or roll number already exists'
      });
    }

    return res.status(500).json({
      message: 'Error updating host',
      error: error.message
    });
  }
};

const deleteHost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid host ID is required'
      });
    }

    const query = 'DELETE FROM host WHERE host_id = ?';
    const [result] = await pool.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Host not found'
      });
    }

    return res.status(200).json({
      message: 'Host deleted successfully'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: 'Cannot delete host: referenced in visit requests'
      });
    }

    return res.status(500).json({
      message: 'Error deleting host',
      error: error.message
    });
  }
};

module.exports = {
  createHost,
  getAllHosts,
  getHostById,
  updateHost,
  deleteHost
};
