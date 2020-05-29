const { Schema, model } = require('mongoose');
const TaskList = Schema;

const task = new TaskList({
  description: {
    type: String,
    required: true,
    trim: true
  },
  complited: {
    type: Boolean,
    default: false
  },
});

module.exports = model('Tasks', task);
