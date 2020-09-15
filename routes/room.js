var express = require('express');
const { User, Room } = require('../models');
var router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    console.log(req.body);
    const { roomTitle, roomUsers } = req.body;
    roomUsers.push(req.user.id);
    const room = await Room.create({ name: roomTitle });
    await room.addUsers(roomUsers);
    return res.status(200).json(room);
  } catch (error) {
    console.log(error);
    return res.status(403).send('error!');
  }
});

router.get('/:roomId', async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const id = parseInt(roomId, 10);
    console.log(id);
    const room = await Room.findOne({
      where: { id },
      include: [{ model: User, as: 'Users', attributes: { exclude: ['password', 'email'] } }],
    });

    return res.status(200).json(room);
  } catch (error) {
    console.log(error);
    return res.status(403).send('error!');
  }
});

module.exports = router;
