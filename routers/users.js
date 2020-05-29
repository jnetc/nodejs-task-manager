const { Router } = require('express');
const UserList = require('../models/user');

const router = Router();

// Create new user
router.post('/users', async (req, res) => {
  console.log(req.body);
  const initUser = new UserList(req.body);
  try {
    const user = await initUser.save();

    if (!user) res.status(404).send();

    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
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

  try {
    const user = await UserList.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) res.status(404).send();

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
