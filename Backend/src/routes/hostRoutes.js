const express = require('express');
const router = express.Router();
const { 
  createHost, 
  getAllHosts, 
  getHostById, 
  updateHost, 
  deleteHost 
} = require('../controllers/hostController');

router.post('/', createHost);
router.get('/', getAllHosts);
router.get('/:id', getHostById);
router.put('/:id', updateHost);
router.delete('/:id', deleteHost);

module.exports = router;
