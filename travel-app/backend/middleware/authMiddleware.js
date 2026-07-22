const jwt = require("jsonwebtoken");

const JWT_SECRET = "gobus_secure_signature_token_key_2026";


exports.verifyToken = (req,res,next)=>{

    try{

        const token = req.headers.authorization?.split(" ")[1];


        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token missing"
            });
        }


        const decoded = jwt.verify(token, JWT_SECRET);


        req.user = decoded;


        next();


    }catch(error){

        res.status(401).json({
            success:false,
            message:"Invalid token"
        });

    }

};