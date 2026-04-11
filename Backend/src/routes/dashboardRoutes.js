const express = require('express');
const router = express.Router();
const { 
  getDashboardStats,
  getRecentActivity,
  getVisitStatsByDate,
  getTopHosts,
  getTopVisitors,
  getAverageVisitDuration
} = require('../controllers/dashboardController');

router.get('/stats', getDashboardStats);
router.get('/recent-activity', getRecentActivity);
router.get('/visit-stats-by-date', getVisitStatsByDate);
router.get('/top-hosts', getTopHosts);
router.get('/top-visitors', getTopVisitors);
router.get('/average-visit-duration', getAverageVisitDuration);

module.exports = router;
