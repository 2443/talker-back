const express = require('express');
const passport = require('passport');
const { User } = require('../models');
const router = express.Router();
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }

      const fullUserWithoutPassword = await User.findOne({
        where: { id: user.id },
        attributes: {
          exclude: ['password'],
        },
      });

      return res.status(200).json(fullUserWithoutPassword);
    });
  })(req, res, next);
});

module.exports = router;
