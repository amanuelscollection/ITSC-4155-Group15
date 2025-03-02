const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

const auth = require('../middlewares/auth'); 

router.get('/', itemController.index);
router.get('/new', itemController.getSellItemForm);
router.post('/', auth, itemController.upload.single('image'), itemController.createNewItem);

router.get('/:id', itemController.getItemById);
router.get('/:id/edit', auth, itemController.getEditItemForm);

// Correct route for updating an item
router.put('/:id', auth, itemController.upload.single('image'), itemController.updateItem);

router.delete('/:id', auth, itemController.deleteItem);

module.exports = router;
