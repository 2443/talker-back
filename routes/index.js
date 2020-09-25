const express = require('express');
const passport = require('passport');
const { User, Room, Chat } = require('../models');
const router = express.Router();
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');

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

router.post('/', async (req, res, next) => {
  try {
    console.log(req.body);
    const roomQuery = { [Op.or]: req.body.roomsData.map(({ RoomId }) => ({ id: RoomId })) };

    const chatQuery = req.body.roomsData.map(({ RoomId, lastChatTime }) => {
      return {
        createdAt: { [Op.gt]: lastChatTime ? lastChatTime : new Date('2020-01-01') },
      };
    });

    const rooms = await Room.findAll({
      where: roomQuery,
      attributes: ['id'],
      include: {
        model: Chat,
        as: 'Chats',
        where: chatQuery,
      },
    });

    return res.status(200).json(rooms);
  } catch (error) {
    console.error(error);
    next(error);
  }
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
    const myId = req.user.id;

    const fullUserWithoutPassword = await User.findOne({
      where: { id },
      attributes: {
        exclude: ['password'],
      },
    });

    const oneOnOneTarget = [id, myId].sort().join('-');

    const room = await Room.findOne({
      where: { oneOnOneTarget },
      include: [
        {
          model: User,
          as: 'Users',
          where: { [Op.not]: { id: myId } },
          attributes: ['nickname', 'profileImage', 'id'],
        },
      ],
    });

    if (!room) {
      const createdRoom = await Room.create({
        name: 'OneOnOneRoom',
        UserId: myId,
        oneOnOneTarget,
        isOneOnOne: true,
      });
      await createdRoom.addUsers([myId, id]);

      const newRoom = await Room.findOne({
        where: { id: createdRoom.id },
        include: [
          {
            model: User,
            as: 'Users',
            where: { [Op.not]: { id: myId } },
            attributes: ['nickname', 'profileImage', 'id'],
          },
        ],
      });

      return res.status(200).json(newRoom);
    }

    return res.status(200).json(room);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
