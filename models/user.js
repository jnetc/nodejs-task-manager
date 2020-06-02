const { Schema, model } = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!isEmail(value)) {
        throw new Error('Email is invalid');
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error(`Password doesn't contain "password"`);
      }
    },
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be apositive number');
      }
    },
  },
  tokens: [{
    _id: false,
    token: {
      type: String,
      required: true
    }
  }],
  tasks: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'Tasks',
      },
    },
  ],
});

// LOGIN function
// Find by pawwsord and email
userSchema.statics.findAndLogin = async (password, email) => {
  // Find by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Unable user email');
  }
  // Check for currect password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Unable user password');
  }
  return user;
};

// GENERATE TOKEN
userSchema.methods.generateAuthToken = async function () {
  const user = this;
    // Create token from user ID + secret word
  const token = jwt.sign({ _id: user._id.toString() }, 'hellopasword');
  // 
  user.tokens = user.tokens.concat({token})
  await user.save()
};

// BCRYPT password
// Middleware before saving user data
// isModified - mongoose method
userSchema.pre('save', async function () {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

// Create user model for use in statics method
const User = model('User', userSchema);

module.exports = User;
