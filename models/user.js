const { Schema, model } = require('mongoose')
const { isEmail } = require('validator');


const user = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!isEmail(value)) {
        throw new Error('Email is invalid')
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error(`Password doesn't contain "password"`)
      }
    }

  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be apositive number')
      }
    }
  },
  tasks: [
    { userId: {
      type: Schema.Types.ObjectId,
      ref: 'Tasks'
    }}
  ]
})

module.exports = model('User', user)