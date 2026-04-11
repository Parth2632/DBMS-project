const pool = require('../config/db');

const createVisitor = async (req, res) => {
  try {
    const { full_name, phone_no, email, id_proof_type, id_proof_number } = req.body;

    if (!full_name || !phone_no || !id_proof_type || !id_proof_number) {
      return res.status(400).json({
        message: 'full_name, phone_no, id_proof_type, and id_proof_number are required'
      });
    }

    const query = `
      INSERT INTO visitor (full_name, phone_no, email, id_proof_type, id_proof_number)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      full_name,
      phone_no,
      email || null,
      id_proof_type,
      id_proof_number
    ]);

    return res.status(201).json({
      message: 'Visitor created successfully',
      visitorId: result.insertId
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Visitor with same email or ID proof number already exists'
      });
    }

    return res.status(500).json({
      message: 'Error creating visitor',
      error: error.message
    });
  }
};

const getAllVisitors = async (req, res) => {
  try {
    const query = 'SELECT visitor_id, full_name, phone_no, email, id_proof_type FROM visitor ORDER BY visitor_id DESC';
    const [visitors] = await pool.query(query);
    
    return res.status(200).json({
      message: 'Visitors retrieved successfully',
      data: visitors
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving visitors',
      error: error.message
    });
  }
};

const getVisitorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid visitor ID is required'
      });
    }

    const query = 'SELECT visitor_id, full_name, phone_no, email, id_proof_type FROM visitor WHERE visitor_id = ?';
    const [visitors] = await pool.query(query, [id]);
    
    if (visitors.length === 0) {
      return res.status(404).json({
        message: 'Visitor not found'
      });
    }

    return res.status(200).json({
      message: 'Visitor retrieved successfully',
      data: visitors[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving visitor',
      error: error.message
    });
  }
};

const updateVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone_no, email, id_proof_type, id_proof_number } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid visitor ID is required'
      });
    }

    if (!full_name || !phone_no || !id_proof_type || !id_proof_number) {
      return res.status(400).json({
        message: 'full_name, phone_no, id_proof_type, and id_proof_number are required'
      });
    }

    const query = `
      UPDATE visitor 
      SET full_name = ?, phone_no = ?, email = ?, id_proof_type = ?, id_proof_number = ?
      WHERE visitor_id = ?
    `;

    const [result] = await pool.query(query, [
      full_name,
      phone_no,
      email || null,
      id_proof_type,
      id_proof_number,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Visitor not found'
      });
    }

    return res.status(200).json({
      message: 'Visitor updated successfully'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Visitor with same email or ID proof number already exists'
      });
    }

    return res.status(500).json({
      message: 'Error updating visitor',
      error: error.message
    });
  }
};

const deleteVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: 'Valid visitor ID is required'
      });
    }

    const query = 'DELETE FROM visitor WHERE visitor_id = ?';
    const [result] = await pool.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Visitor not found'
      });
    }

    return res.status(200).json({
      message: 'Visitor deleted successfully'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: 'Cannot delete visitor: referenced in visit requests'
      });
    }

    return res.status(500).json({
      message: 'Error deleting visitor',
      error: error.message
    });
  }
};

module.exports = {
  createVisitor,
  getAllVisitors,
  getVisitorById,
  updateVisitor,
  deleteVisitor
};