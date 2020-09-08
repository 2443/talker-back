var express = require('express');
const { User, Friend } = require('../models');
var router = express.Router();

/* GET users listing. */
router.get('/', async (req, res, next) => {
  const usersStates = {
    send: [],
    receive: [],
    friend: [],
    block: [],
  };
  try {
    const users = await Friend.findAll({
      where: { UserId: req.user.id },
      // order: [
      //   [User, 'nickname', 'DESC']
      // ],
      // where: { UserId: req.user.id },
      include: [{ model: User, attributes: { exclude: ['password', 'email'] } }],
    });

    const sortedUsers = users.sort((a, b) => {
      if (a.User.nickname < b.User.nickname) {
        return -1;
      }
      if (a.User.nickname > b.User.nickname) {
        return 1;
      }
    });

    sortedUsers.forEach((e) => {
      usersStates[e.state].push(e.User);
    });

    const mergedUsers = sortedUsers.map((e) => ({ ...e.User.dataValues, state: e.state }));

    return res.status(200).json(mergedUsers);
  } catch (error) {
    return res.status(200).json([]);
  }
});

module.exports = router;
