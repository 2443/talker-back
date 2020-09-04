var express = require('express');
const { User } = require('../models');
var router = express.Router();

/* GET users listing. */
router.post('/', async (req, res, next) => {
  const user = User.create({ ...req.body });

  return res.json(user.toJson());
});

module.exports = router;
