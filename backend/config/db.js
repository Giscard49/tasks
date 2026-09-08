const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    let memoryServer;

    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tasks');
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.warn('MongoDB connection failed. Falling back to an in-memory MongoDB instance for local development.');
        console.warn(err.message);

        try {
            memoryServer = await MongoMemoryServer.create();
            await mongoose.connect(memoryServer.getUri());
            console.log('MongoDB connected using in-memory server');
        } catch (memoryErr) {
            console.error(memoryErr.message);
            process.exit(1);
        }
    }
};

module.exports = connectDB;