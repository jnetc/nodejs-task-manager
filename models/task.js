const { Schema, model } = require('mongoose');
const TaskList = Schema;

const task = new TaskList({
  description: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = model('Task', task);
