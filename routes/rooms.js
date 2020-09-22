var express = require('express');
const { Op } = require('sequelize');
const { User, Room } = require('../models');
var router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const id = req.user?.id;
    const user = await User.findOne({
      where: { id },
    });
    const rooms = await user.getRooms({
      include: [
        {
          model: User,
          as: 'Users',
          where: { [Op.not]: { id } },
          attributes: ['nickname', 'profileImage', 'id'],
        },
      ],
    });

    return res.status(200).json(rooms);
  } catch (error) {
    console.log(error);
    return res.status(403).send('error!');
  }
});

module.exports = router;
