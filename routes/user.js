var express = require('express');
const { User } = require('../models');
var router = express.Router();
const bcrypt = require('bcrypt');

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
    const fullUserWithoutPassword = await User.findOne({
      where: { id: req.user.id },
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
