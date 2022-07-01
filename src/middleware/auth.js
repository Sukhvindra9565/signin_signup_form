const jwt = require('jsonwebtoken');
const Signup = require('../models/register');

const auth = async (req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        const varifyUser = jwt.verify(token,process.env.SECRET_KEY);
        // console.log(varifyUser);
        const user = await Signup.findOne({_id:varifyUser._id});
        // console.log(user);

        req.token = token;
        req.user = user;
        next();
    }catch(err){
        res.status(401).send(err);
    }
}
module.exports = auth;