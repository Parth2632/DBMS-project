const express = require('express');
const router = express.Router();
const { 
  createVisitRequest,
  getAllVisitRequests,
  getVisitRequestById,
  approveVisitRequest,
  rejectVisitRequest,
  updateVisitRequest,
  deleteVisitRequest
} = require('../controllers/visitRequestController');

router.post('/', createVisitRequest);
router.get('/', getAllVisitRequests);
router.get('/:id', getVisitRequestById);
router.put('/:id', updateVisitRequest);
router.delete('/:id', deleteVisitRequest);
router.patch('/:id/approve', approveVisitRequest);
router.patch('/:id/reject', rejectVisitRequest);

module.exports = router;
