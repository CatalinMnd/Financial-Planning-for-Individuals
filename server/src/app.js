const express = require('express');
const cors = require('cors');
const dotenv=require("dotenv");
const dbConnect = require('./config/dbConnect');
//env
dotenv.config();
const {errorHandler,notFound}=require('./middlewares/errorMiddleware');

const userRoute = require('./routes/users/usersRoute');
const incomeRoute = require('./routes/income/incomeRoute');
const expenseRoute = require('./routes/expenses/expenseRoute');

const app = express();

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('JWT_KEY:', process.env.JWT_KEY ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');

//dbConnect
dbConnect();

//middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to Financial Planning for Individuals API");
});


//user routes
app.use("/api/users", userRoute);
//income routes
app.use("/api/income",incomeRoute);
//expense routes
app.use("/api/expenses",expenseRoute);

//error
app.use(errorHandler);
app.use(notFound);

//income


//expenses


module.exports = app;

