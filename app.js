const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const hpp = require('hpp');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
// const MySQLStore = require('express-mysql-session')(session);

const db = require('./models');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const userRouter = require('./routes/user');
const roomRouter = require('./routes/room');
const roomsRouter = require('./routes/rooms');

dotenv.config();

const app = express();
app.io = require('socket.io')();
const passportConfig = require('./passport');

// const sessionStore = new MySQLStore({
//   host: '127.0.0.1',
//   port: 3306,
//   user: 'root',
//   password: process.env.DB_PASSWORD,
//   database: 'talker',
// });

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
      domain: process.env.NODE_ENV === 'production' && '.jimmy.kr',
    },
  })
);
passportConfig();
app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: 'http://jimmy.kr',
      credentials: true,
    })
  );
} else {
  app.use(morgan('dev'));
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
}

db.sequelize
  .sync()
  .then(() => {
    console.log('db 연결 성공');
  })
  .catch(console.error);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/user', userRouter);
app.use('/room', roomRouter);
app.use('/rooms', roomsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.error(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('init', function (data) {
    socket.join(data.id);
    socket.emit('welcome', `hello! ${data.name}`);
    socket.on('message', (data) => {
      console.log(data);
      socket.broadcast.to(data.roomId).emit('message', data);
    });
    socket.on('disconnect', function () {
      console.log('user disconnected');
    });
  });
});

module.exports = app;
