require('dotenv').config();
require("./db/conn");
const auth = require("./middleware/auth");
const bcrypt = require('bcryptjs');
const hbs = require("hbs");
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const Signup = require("./models/register");
const {json} = require('express');
const {log} = require('console');
const staticPath = path.join(__dirname, "../public");
const templatePath = path.join(__dirname, "../templates/views");
const partialPath = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(staticPath));
app.use("/src", express.static(__dirname));
app.set("views", templatePath);
app.set("view engine", "hbs");
hbs.registerPartials(partialPath);



app.get("/",(req,res)=>{
    res.render("index.hbs");
});
app.get("/secret",auth,(req,res)=>{
  // console.log(`This is the cookie ${req.cookies.jwt}`);
  res.render("secret.hbs");
});

app.get("/logout",auth, async(req,res)=>{
  try{

    console.log(req.user);
    // For single user logout
    req.user.tokens = req.user.tokens.filter((currElement)=>{
      return currElement.token !== req.token;
    })

    // logout for all users
    // req.user.tokens = [];
    res.clearCookie("jwt");

    console.log("logout successfully");
    await req.user.save();
    res.render("index.hbs");
  }catch(err){
    res.status(500).send(err);
  }
})

// Login user
app.post("/login", async (req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Signup.findOne({email:email});

        // compare hash password
        const isMatch = await bcrypt.compare(password,useremail.password); // first userpassword second database password

        // Generate token
        const token = await useremail.generateAuthToken();
        // console.log(token);

        // Store cookie
        res.cookie("jwt",token,{
          expires:new Date(Date.now()+500000),
          httpOnly:true,
          // secure:true
        });

        if(isMatch){
            res.status(201).render("index.hbs");
        }
        else
        {
            alert("Invalid Login Details");
        }
    }catch(err){
        res.status(404).send(err);
    }
})
// Create a new user in our database or Registration
app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    
    if(password === cpassword){
        const registerEmployee = new Signup({
          username: req.body.username,
          password: password,
          cpassword: cpassword,
          email: req.body.email,
        });
        // Generate token
        const token = await registerEmployee.generateAuthToken();
        
        // Store cookie
        res.cookie("jwt",token,{
          expires:new Date(Date.now()+30000),
          httpOnly:true
        });

        const registered = await registerEmployee.save();
        res.status(201).render("signin_signup.hbs");
    }else{
        res.send("Password are not matching");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/signup", (req, res) => {
  res.render("signin_signup.hbs");
});

app.get("*", (req, res) => {
  res.render("404", {
    errorcomment: "OOPs page couldn't found",
  });
});

app.listen(port, () => {
  console.log(`Server is running at port no ${port}`);
});
// http://localhost:3000
