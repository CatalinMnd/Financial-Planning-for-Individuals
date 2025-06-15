const express = require('express');
const dbConnect = require('./config/dbConnect');
const { registerUser } = require('./controllers/users/usersCtrl');
const userRoute = require('./routes/users/usersRoute');

const app = express();

//dbConnect
dbConnect();

//routes
app.use('/',userRoute);

//income


//expenses


module.exports = app;

