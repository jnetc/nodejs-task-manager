const { Router } = require('express')
const TaskList = require('../models/task');

const router = Router()

// Create new task
router.post('/tasks', async (req, res) => {
  console.log(req.body);
  const initTask = new TaskList(req.body);
  try {
    const task = await initTask.save();
    if (!task) res.status(404).send();

    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await TaskList.find({});

    if (!tasks) res.status(404).send();
  
    res.render('index.ejs', {
      title: 'Home page',
      h1: 'Hello express - ejs',
      tasks,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get one task
router.get('/tasks/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const task = await TaskList.findById(id);

    if (!task) res.status(404).send();

    res.status(200).send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});


// Update task
router.patch('/task/:id', async (req, res) => {
  const id = req.params.id;
  const keys = Object.keys(req.body)
  try {
    const task = await TaskList.findById(id)
    keys.forEach(key => task[key] = req.body[key])
    await task.save()

    if (!task) res.status(404).send();

    res.send(task);
    // res.redirect('/');
  } catch (error) {
    res.status(400).send(error).redirect('/');
  }
});
// Delete task
router.delete('/task/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    const task = await TaskList.deleteOne({ _id: id });

    if (!task) res.status(404).send();

    res.send(task);
    // res.redirect('/');
  } catch (error) {
    res.status(400).send(error).redirect('/');
  }
});

module.exports = router