const { Router } = require('express');
// Middleware
const auth = require('../middleware/auth');
// Model
const Task = require('../models/task');
// Init roiter
const router = Router();

// Create new task
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all tasks
router.get('/tasks', auth, async (req, res) => {
  const { user, query } = req;

  // GET /tasks?completed=true / fasle
  // GET /tasks?limit=2&skip=0
  // GET /tasks?sortBy=createdAt:desc / asc

  // Filtering tasks by qyery value "complited"
  const match = {};
  // Sort tasks by timestamp / "createdAt"
  const sort = {}
  
  if (query.completed) {
    match.completed = query.completed;
  }
  
  if (query.sortBy) {
    const parts = query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    // Other instance how to get all data
    // const tasks = await Task.find({ owner: user._id, ...match });
    
    await user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(query.limit),
        skip: parseInt(query.skip),
        sort
      }
    }).execPopulate()

    res.send(user.tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get one task
router.get('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) res.status(404).send();

    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

// Update task
router.patch('/task/:id', auth, async (req, res) => {
  const _id = req.params.id;
  const keys = Object.keys(req.body);
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    keys.forEach(key => (task[key] = req.body[key]));

    await task.save();

    if (!task) res.status(404).send();

    res.send(task);
  } catch (error) {
    res.status(400).send(error).redirect('/');
  }
});

// Delete task
router.delete('/task/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.deleteOne({ _id, owner: req.user._id });

    if (!task) res.status(404).send();

    res.send(task);
  } catch (error) {
    res.status(400).send(error).redirect('/');
  }
});

module.exports = router;
