const expressAsyncHandler=require("express-async-handler");
const jwt=require("jsonwebtoken");
const User=require("../model/User");

const authMiddleware=expressAsyncHandler(async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token=req.headers.authorization.split(" ")[1];
    }
    if(!token){
        res.status(401);
        throw new Error("Unauthorized, token is required");
    }
    try {
        const decoded=jwt.verify(token,process.env.JWT_KEY);
        const user=await User.findById(decoded.id).select("-password");
        req.user=user;
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Unauthorized, token is invalid");
    }
});

module.exports=authMiddleware;