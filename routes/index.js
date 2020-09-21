const express = require('express');
const passport = require('passport');
const { User, Room } = require('../models');
const router = express.Router();
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});
const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: 'talker',
    key(req, file, cb) {
      cb(null, `original/${Date.now()}_${path.basename(file.originalname)}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const volatility = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: 'talker',
    key(req, file, cb) {
      cb(null, `volatility/${Date.now()}_${path.basename(file.originalname)}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

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

router.post('/user/image', upload.array('image'), async (req, res, next) => {
  res.json(req.files.map((v) => v.location.replace(/\/original\//, '/thumb/'))[0]);
});

router.post('/room/image', upload.array('image'), async (req, res, next) => {
  res.json(req.files.map((v) => v.location.replace(/\/original\//, '/thumb/'))[0]);
});

router.post('/chat/image', volatility.array('image'), async (req, res, next) => {
  res.json(req.files.map((v) => v.location));
});

router.get('/chat/user/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const fullUserWithoutPassword = await User.findOne({
      where: { id },
      attributes: {
        exclude: ['password'],
      },
    });

    return res.status(200).json(fullUserWithoutPassword);

    // return res.json(user.toJson());
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
