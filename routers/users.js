const { Router } = require('express');
const UserList = require('../models/user');

const router = Router();

// Create new user
router.post('/users', async (req, res) => {
  // Create new user
  const user = new UserList(req.body);
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
    const user = await UserList.findAndLogin(password, email);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await UserList.find({});

    if (!users) res.status(404).send();

    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Find user
router.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserList.findById(id);
    if (!user) res.status(404).send();
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update user
router.patch('/user/:id', async (req, res) => {
  const { id } = req.params;
  // Get all object keys from user model
  const keys = Object.keys(req.body);
  try {
    // Find user by ID
    const user = await UserList.findById(id);
    // Update user each object key
    keys.forEach(key => (user[key] = req.body[key]));
    // Save to db
    await user.save();
    // If not found user, send error
    if (!user) res.status(404).send();
    // If OK, show user data
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete user
router.delete('/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await UserList.findByIdAndDelete({ _id: id });

    if (!user) res.status(404).send();

    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
