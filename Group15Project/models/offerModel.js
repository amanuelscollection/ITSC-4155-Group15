const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    item: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Item', 
        required: true 
    },
    
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true, 
        min: 0.01 
    },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected'], 
        default: 'pending' 
    }
});

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;