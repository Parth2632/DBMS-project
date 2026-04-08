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

module.exports = { createVisitor };