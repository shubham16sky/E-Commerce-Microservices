const express = require("express");
const app = express();
const PORT = process.env.PORT_TWO || 8080;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const isAuthenticated = require("../isAuthenticated")
const Product = require("./Product");
const buffer = require("buffer");



app.use(express.json());
var channel,connection;
// connecting to product db
mongoose.connect("mongodb://0.0.0.0:27017/product-service",{
    useNewUrlParser : true,
    useUnifiedTopology : true,
},)
.then(()=> console.log("Product DB Connected"))
.catch(e=> console.log(e));

//connecting to rabbitmq
async function connect(){
    try{
        connection = await amqp.connect("amqp://0.0.0.0:5672");
        channel = await connection.createChannel();
        await channel.assertQueue("PRODUCT_FINAL_PRICE");
        console.log("RABBIT MQ CONNECTED AND CHANNEL CREATED")
        

    }catch(ex){
        console.error(ex);
    }
}
connect();

//Route to create product 
app.post("/product/create",isAuthenticated, async (req,res) => {

    const {name , description , price }  = req.body;
    const newProduct = new Product({
        name,
        description,
        price,
    });
    newProduct.save();
    return res.json(newProduct);


});



//route to buy product 
var order 
app.post("/product/buy",isAuthenticated,async(req,res)=>{
    const {ids} = req.body;
    //fetching product details from database 
    const products = await Product.find({_id:{$in: ids}});
    //Adding products to cart
    channel.sendToQueue("CART",
    Buffer.from(JSON.stringify({products,userEmail:req.user.email}))
    );
    //Calculating final price of items added in cart 
    channel.consume("PRODUCT_CHECKOUT",(data)=>{
         console.log("Consuming PRODUCT_FINAL_PRICE Queue")
         order = JSON.parse(data.content);
         
         channel.ack(data);
         
         
        
    
    });

    return res.json(order);

});


app.listen(PORT,()=>{
    console.log(`Product-service running at ${PORT}`);
});






