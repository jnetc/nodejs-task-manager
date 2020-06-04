const { Router } = require('express');
const User = require('../models/user');
// Import middleware
const auth = require('../middleware/auth');

const router = Router();

// Create new user
router.post('/users', async (req, res) => {
  // Create new user
  const user = new User(req.body);
  try {
    // Save user
    await user.save();
    // Generate token
    const token = await user.generateAuthToken();
    // Check
    if (!user) res.status(404).send();
    // SEND data
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// LOGIN
router.post('/users/login', async (req, res) => {
  const { password, email } = req.body;
  try {
    const user = await User.findAndLogin(password, email);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

// LOGOUT
router.post('/users/logout', [auth], async (req, res) => {
  const { tokens } = req.user;

  try {
    const keys = tokens.filter(key => {
      // Not found token return empty arr
      if (!key.token) {
        return [];
      }
      // Found token return new arr
      return key.token !== req.token;
    });
    // Write filtered arr to user tokens data
    req.user.tokens = keys;
    // Save to user request object
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(500).send();
  }
});

// LOGOUT from all devices
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send();
  }
});

// Get all users
router.get('/users/me', [auth], async (req, res) => {
  res.send(req.user);
});

// Update user
router.patch('/user/me', auth, async (req, res) => {
  let { user, body } = req;
  const updates = Object.keys(body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    // Update user each object key
    updates.forEach(update => (user[update] = body[update]));

    // Save to db
    await user.save();

    // If OK, show user data
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete user
router.delete('/user/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
