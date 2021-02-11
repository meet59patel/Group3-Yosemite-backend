const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// @get /
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Yosemite Server | 200 OK | @meet59patel',
  });
});

module.exports = router;
