const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/UserRoutes');
dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', userRoutes);
app.get('/', (req, res)=> {
    res.send("task backend server is running")
})
app.listen(process.env.PORT, ()=>{
    console.log(`server is running on port ${process.env.PORT}`) 
})