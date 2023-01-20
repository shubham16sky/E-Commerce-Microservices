const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema({
    name: String,
    description : String,
    price : Number,

});

module.exports = mongoose.model("product",ProductSchema)

