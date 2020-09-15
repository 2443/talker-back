var express = require('express');
const { User, Room } = require('../models');
var router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const id = req.user?.id;
    const user = await User.findOne({
      where: { id },
      include: [{ model: Room, as: 'Rooms' }],
    });
    return res.status(200).json(user.Rooms);
  } catch (error) {
    console.log(error);
    return res.status(403).send('error!');
  }
});

module.exports = router;
