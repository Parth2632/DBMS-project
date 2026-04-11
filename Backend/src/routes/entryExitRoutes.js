const express = require('express');
const router = express.Router();
const { 
  checkInVisitor,
  checkOutVisitor,
  getCurrentVisitors,
  getVisitHistory,
  getEntryLogs
} = require('../controllers/entryExitController');

router.patch('/:id/checkin', checkInVisitor);
router.patch('/:id/checkout', checkOutVisitor);
router.get('/current-visitors', getCurrentVisitors);
router.get('/history', getVisitHistory);
router.get('/logs', getEntryLogs);

module.exports = router;
