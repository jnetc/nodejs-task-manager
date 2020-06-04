const express = require('express');
const path = require('path');
const chalk = require('chalk');

// Connect mongodb
require('./db/mongoose');

// Import routers
const usersRouter = require('./routers/users');
const tasksRouter = require('./routers/tasks');
const page404 = require('./routers/404');


// Init app
const app = express();

// Public folder
app.use(express.static(path.join(__dirname, '/public')));

// Parse data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// EJS template engine
app.set('render engine', 'ejs');
app.set('views', 'view');


// Routers
app.use(usersRouter);
app.use(tasksRouter);
app.use(page404);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(chalk.inverse.green(' Server running...')));


const Task = require('./models/task');
const User = require('./models/user');

// const main = async() => {
//   // const task = await Task.findById('5ed9131bf4295214945d90bd')
//   // await task.populate('owner').execPopulate()
//   // console.log(task);
//   const user = await User.findById('5ed91baa472b383d5ca3e0c6')
//   await user.populate('tasks').execPopulate()
//   console.log(user.tasks);
  
// }
// main()