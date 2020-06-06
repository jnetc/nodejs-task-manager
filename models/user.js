const { Schema, model } = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Model
const Task = require('./task.js');

const userSchema = new Schema(
  {
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
    tokens: [
      {
        _id: false,
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  { timestamps: true }
);

// Was some problem with virtual, can't find data from Task
// Solved - restart server!!!
userSchema.virtual('tasks', {
  ref: 'Task', // Name schema to connect
  localField: '_id', // User schema key need
  foreignField: 'owner', // Task schema key need
});

// Hiding PRIVATE data
userSchema.methods.toJSON = function () {
  const user = this;

  const hidingKeys = user.toObject();
  // delete keys for hiding user data
  delete hidingKeys.password;
  delete hidingKeys.tokens;
  delete hidingKeys.avatar;

  return hidingKeys;
};

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
  // Create token from user ID + secret word + expires time
  const token = jwt.sign({ _id: user._id.toString() }, 'hellopasword', {
    expiresIn: '2d',
  });
  // Tokens
  user.tokens = user.tokens.concat({ token });
  // Save user schema to tokens for session (login with other devices)
  await user.save();
  // Return USER TOKEN!!!!
  return token;
};

// BCRYPT password
// Middleware before saving user data
// isModified - mongoose method
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

// Create user model for use in statics method
const User = model('User', userSchema);

module.exports = User;
