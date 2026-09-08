const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    dueDate: Date,
    dueTime: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sharedWith: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        permission: {
            type: String,
            enum: ['read', 'write'],
            default: 'read',
        },
    }],
}, { timestamps: true });

taskSchema.index({ owner: 1, createdAt: -1 });
taskSchema.index({ 'sharedWith.user': 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);