const express = require('express');
const app = express();
const User = require("./User")

const jwt = require("jsonwebtoken");
const PORT = process.env.PORT_ONE || 7070;
const mongoose = require('mongoose');

app.use(express.json());

mongoose.connect("mongodb://0.0.0.0:27017/auth-service",{
    useNewUrlParser : true,
    useUnifiedTopology : true,
},)
.then(()=> console.log("Auth DB Connected"))
.catch(e=> console.log(e));

//Login 

app.post("/auth/login",async(req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if (!user){
        return res.json({message: "User doesn't exist"});
    }else{

        //check if password is correct 
        if (password !== user.password){
            return res.json({message : "Incorrect password"});
        }

        //creating payload
        const payload = {
            email,
            name: user.name

        };
        //signing jwt payload
        jwt.sign(payload,"secret",(err,token) =>{
            if (err){
                console.log(err);
            }else{
                return res.json({token:token});
            }

        });
    }

});

//Register route 

app.post("/auth/register",async(req,res)=>{
    const {email,password,name} = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.json({message: "User already exists"});
    }else{
        const newUser = new User({
            name,
            email,
            password
        });
        newUser.save();
        return res.json(newUser);
    }
});





app.listen(PORT,()=>{
    console.log(`Auth-Service at ${PORT}`);
});


