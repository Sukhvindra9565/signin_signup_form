const mongoose = require('mongoose');
// Connecting and Create Database
mongoose.connect("mongodb://localhost:27017/RegistrationForm").then(()=>{
    console.log("Connection successful")
}).catch((err) => {
    console.log(err);
})

