const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema({
    products : [
        {
            product_id: String
        }
    ],
    user : String,
    total_price : Number,
    

});

module.exports = mongoose.model("order",OrderSchema)

