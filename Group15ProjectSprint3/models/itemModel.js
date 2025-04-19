const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    condition: { type: String },
    details: { type: String },
    seller: { type: String, ref: 'User' }, 
    image: { type: String, default: 'default.jpg' },
    totalOffers: { type: Number, default: 0 }, 
    highestOffer: { type: Number, default: 0 }, 
    active: { type: Boolean, default: true },
    offers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Offer' }]
});

module.exports = mongoose.model('Item', itemSchema);

