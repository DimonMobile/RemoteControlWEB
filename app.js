const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const panelsRouter = require('./routes/panels');
const serversRouter = require('./routes/servers');

const APP_PORT = 3000;

const app = express();

app.engine('hbs', exphbs({extname: '.hbs'}));
app.set('view engine', 'hbs');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(express.urlencoded({extended: false}));

app.use('/public', express.static('public'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/panels', panelsRouter);
app.use('/servers', serversRouter);

app.listen(APP_PORT, () => {
  console.log(`http://127.0.0.1:${APP_PORT}`);
});