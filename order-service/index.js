const express = require("express");
const app = express();
const PORT = process.env.PORT_THREE || 9090;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const isAuthenticated = require("../isAuthenticated")
const Order = require("./Order");
const buffer = require("buffer");

app.use(express.json());


var channel,connection;
// connecting to product db
mongoose.connect("mongodb://0.0.0.0:27017/order-service",{
    useNewUrlParser : true,
    useUnifiedTopology : true,
},)
.then(()=> console.log("Order DB Connected"))
.catch(e=> console.log(e));

//Calculate final price of cart 
function createOrder(products,userEmail){
    let total = 0;
    for (let t=0;t<products.length;++t){
        total += products[t].price;

    }
    const newOrder = new Order({
        products,
        user: userEmail,
        total_price: total,
    });
    
    return newOrder;

}

//connecting to rabbitmq
async function connect(){
    
    connection = await amqp.connect("amqp://0.0.0.0:5672");
    channel = await connection.createChannel();
    await channel.assertQueue("CART");
    console.log("RABBIT MQ CONNECTED AND CHANNEL CREATED")
}
connect().then(()=>{
    //fetching details of the items added in cart 
    channel.consume("CART",(data)=>{
        console.log("Consuming CART QUEUE");

        const {products,userEmail} = JSON.parse(data.content);
        //Calculate final price
        const newOrder = createOrder(products,userEmail);
        channel.ack(data)
        //Push the updated price of cart to the product_final_price queue
        channel.sendToQueue("PRODUCT_CHECKOUT",Buffer.from(JSON.stringify({newOrder})));

    });
});

app.listen(PORT,()=>{
    console.log(`Product-service running at ${PORT}`);
});






