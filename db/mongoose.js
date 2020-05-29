const mongoose = require('mongoose');
const chalk = require('chalk');

const startServer = async () => {
  try {
    const data = await mongoose.connect(
      'mongodb+srv://admin:admin@nodejs-eg0pt.mongodb.net/task',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    );
    // if (!data) {
    //   throw new Error('Connection to database is failed');
    // }
    console.log(chalk.inverse.cyan(' Connected to database... '));
    return data;
  } catch (error) {
    console.log(chalk.inverse.red(' Connection to database is failed!!! '));
  }
};

module.exports = startServer();
