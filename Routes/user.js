const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Models = require('../Models');

// Get all Users list
router.get('/', (req, res, next) => {
  Models.User.find({})
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// Get User with email
router.get('/:email', (req, res, next) => {
  const email = req.params.email;

  Models.User.findOne({ email: email })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// Create User
router.post('/', (req, res, next) => {
  const new_user = new Models.User({
    username: req.body.username,
    email: req.body.email,
    role: req.body.role,
  });
  new_user
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: 'New User created!',
        createdUser: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// Delete User
router.delete('/:email', async (req, res, next) => {
  try {
    Models.User.deleteOne({ email: req.params.email }).then((result) => {
      res.status(201).json({
        message: 'User Deleted!',
        deletedUser: result,
      });
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Update user
router.put('/:email', async (req, res, next) => {
  try {
    const updatedUser = new Models.User({
      username: req.body.username,
      email: req.body.email,
      role: req.body.role,
    });

    Models.User.updateOne({ email: req.params.email }, updatedUser).then(
      (result) => {
        res.status(201).json({
          message: 'User Updated!',
          updatedUser: result,
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
