const { Router } = require('express');
const multer = require('multer');
const sharp = require('sharp');

// Model
const User = require('../models/user');

// Import middleware
const auth = require('../middleware/auth');

// Import email handler
const { sendWelcomeEmail, sendCanceletionEmail } = require('../emails/account');

// Init
const router = Router();

// Create new user
router.post('/users', async (req, res) => {
  // Create new user
  const user = new User(req.body);
  try {
    // Save user
    await user.save();
    // Sending email to new user
    await sendWelcomeEmail(user.email, user.name);
    // Generate token
    const token = await user.generateAuthToken();
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
    await sendCanceletionEmail(req.user.email, req.user.name);
    await req.user.remove();
    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// CONFIG MULTER
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, callback) {
    // Can use method "match" & expression
    // Or method "endsWith" for extentions
    if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
      return callback(new Error('It is not accepted file format'));
    }
    callback(null, true);
  },
});

// Upload file
// Add chain to route for handle error json format
// SHARP package for crop & resize images
router.post(
  '/users/me/avatar',
  [auth, upload.single('avatar')],
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 550, height: 550 })
      .webp()
      .toBuffer();
    req.user.avatar = buffer;

    await req.user.save();
    res.send();
  },
  (err, req, res, next) => {
    res.status(400).send({ error: err.message });
  }
);

// Get file
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/webp');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

// Delete file
router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;

  await req.user.save();
  res.send();
});

module.exports = router;
