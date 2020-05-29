const { Router } = require('express');

const router = Router();

// Page not found
router.use((req, res) => {
  if (res.status(404)) {
    res.send('Page not found');
  }
});

module.exports = router;