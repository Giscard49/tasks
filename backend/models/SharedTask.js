const mongoose = require('mongoose');
const sharedTaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
    },
    completed: {
        type: Boolean,
        default: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    time: String,
});
module.exports = mongoose.model('SharedTask', sharedTaskSchema);