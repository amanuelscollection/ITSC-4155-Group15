const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const Item = require('../models/itemModel');

const auth = require('../middlewares/auth'); 

router.get('/', itemController.index);
router.get('/new', itemController.getSellItemForm);
router.post('/', auth, itemController.upload.single('image'), itemController.createNewItem);

router.get('/:id', itemController.getItemById);
router.get('/:id/edit', auth, itemController.getEditItemForm);

router.put('/:id', auth, itemController.upload.single('image'), itemController.updateItem);

router.delete('/:id', auth, itemController.deleteItem);


router.post('/:id/report', async (req, res) => {
    const itemId = req.params.id;
  
    try {
      const item = await Item.findByIdAndUpdate(
        itemId,
        { reported: true },
        { new: true }
      );
  
      if (!item) {
        return res.status(404).send('Item not found');
      }
  
      console.log(`Item ${item._id} has been reported as a scam.`);
      res.status(200).send(`Item ${item._id} has been reported as a scam.`);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error while reporting item.');
    }
  });
  
  module.exports = router;