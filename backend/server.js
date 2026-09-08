const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/AuthRoutes');
const taskRoutes = require('./routes/TaskRoutes');
const userRoutes = require('./routes/UserRoutes');
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.get('/', (req, res)=> {
    res.json({ message: 'Task backend server is running' });
})

app.use((error, req, res, next) => {
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    if (error.code === 11000) return res.status(409).json({ message: 'Username is already taken' });
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
});

const port = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(port, () => console.log(`server is running on port ${port}`));
}).catch(() => process.exit(1));