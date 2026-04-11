const express = require('express');
const router = express.Router();
const { 
  createVisitor, 
  getAllVisitors, 
  getVisitorById, 
  updateVisitor, 
  deleteVisitor 
} = require('../controllers/visitorController');

router.post('/', createVisitor);
router.get('/', getAllVisitors);
router.get('/:id', getVisitorById);
router.put('/:id', updateVisitor);
router.delete('/:id', deleteVisitor);

module.exports = router;