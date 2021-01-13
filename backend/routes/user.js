const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const router = express.Router();

router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      })
      user.save()
        .then(result => {
          res.status(201)
            .json({
              massage: 'User created successfully!',
              result: result
            })
        })
        .catch(err => {
          res.status(500).json({
            message: 'Invalid authentication credentials!'
          })
        })
    })
});

router.post('/login', (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: 'Auth failed' })
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({ message: 'Auth failed' })
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
      );
      res.status(200)
        .json({
          token: token,
          expiresIn: 3600,
          userId: fetchedUser._id
        })
    })
    .catch(() => {
      return  res.status(401).json({
        message: 'Invalid authentication credentials!'
      })
    });
});

module.exports = router;
