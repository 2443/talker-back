var express = require('express');
const { User, Friend } = require('../models');
var router = express.Router();
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

router.post('/', async (req, res, next) => {
  try {
    const { email, nickname, password } = req.body;

    const exUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (exUser) {
      return res.status(404).send('이미 사용중인 아이디입니다.');
    }

    await User.create({
      email,
      nickname,
      password: await bcrypt.hash(password, 10),
    });

    return res.status(200).send('ok');
    // return res.json(user.toJson());
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    if (req.user) {
      const fullUserWithoutPassword = await User.findOne({
        where: { id: req.user.id },
        attributes: {
          exclude: ['password'],
        },
      });
      return res.status(200).json(fullUserWithoutPassword);
    }
    return res.status(200).json(null);

    // return res.json(user.toJson());
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const user = await User.findOne({
      where: { [Op.or]: [{ id: key }, { email: key }] },
      attributes: { exclude: ['password'] },
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 친구 요청
router.post('/friend/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await Friend.create({
      UserId: req.user.id,
      FriendId: id,
      state: 'send',
    });
    await Friend.create({
      UserId: id,
      FriendId: req.user.id,
      state: 'receive',
    });

    return res.status(200).json({ id });

    // return res.json(user.toJson());
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch('/friend/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    console.log(id, state);

    const where = {
      [Op.or]: [
        { UserId: req.user.id, FriendId: id },
        { UserId: id, FriendId: req.user.id },
      ],
    };

    if (state === 'accept') {
      await Friend.update(
        { state: 'friend' },
        {
          where,
        }
      );
    } else if (state === 'reject') {
      await Friend.destroy({
        where,
      });
    } else if (state === 'block') {
      await Friend.update(
        {
          state: 'block',
        },
        {
          where,
        }
      );
    }

    return res.status(200).json({ id, state });

    // return res.json(user.toJson());
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
