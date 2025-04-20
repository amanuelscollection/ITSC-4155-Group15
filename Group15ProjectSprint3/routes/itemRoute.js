const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

const auth = require('../middlewares/auth'); 

router.get('/', itemController.index);
router.get('/new', itemController.getSellItemForm);
router.post('/', auth, itemController.upload.single('image'), itemController.createNewItem);

router.get('/:id', itemController.getItemById);
router.get('/:id/edit', auth, itemController.getEditItemForm);

router.put('/:id', auth, itemController.upload.single('image'), itemController.updateItem);

router.delete('/:id', auth, itemController.deleteItem);

router.post('/:id/report', (req, res) => {
    const itemId = req.params.id;
    console.log(`Item ${itemId} has been reported as a scam.`);
    // (You could flag this in memory, flash a message, or just confirm)
    res.send(`Item ${itemId} has been reported as a scam.`);
  });

module.exports = router;
