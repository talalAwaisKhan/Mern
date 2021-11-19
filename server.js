 
const express = require('express');
const connectDB = require('./config/db');
const router = require('./routes/api/users');
const app = express();
//connect db
connectDB();
//init middleware
app.use(express.json());


app.get('/',(req, res)=>{res.send('API RUNNING')});
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{console.log(`server started on ${PORT}`)});
//defining route
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/post', require('./routes/api/post'));