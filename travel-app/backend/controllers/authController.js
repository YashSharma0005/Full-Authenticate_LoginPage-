const User = require("../models/User");
const transporter = require("../config/mailConfig");
const bcrypt = require("bcryptjs");


/* ==========================
   SEND OTP
========================== */
exports.forgotPassword = async (req, res) => {
    try {

        const { email } = req.body;

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });


        if (!user) {
            return res.status(404).json({
                message: "Email not found"
            });
        }


        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();


        user.otp = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;


        await user.save();

        
        await transporter.sendMail({

            from: `"Travel Support" <${process.env.EMAIL}>`,

            to: user.email,

            subject: "Travel Password Reset OTP",

            html: `
                <h2>Travel Password Reset</h2>

                <p>Your OTP is:</p>

                <h1>${otp}</h1>

                <p>This OTP is valid for 5 minutes.</p>
            `
        });


        console.log("OTP Sent Successfully:", otp);


        res.json({
            message: "OTP sent successfully"
        });


    } catch (err) {

        console.log("MAIL ERROR:", err);

        res.status(500).json({
            message: err.message
        });
    }
};



/* ==========================
   VERIFY OTP
========================== */
exports.verifyOtp = async (req,res)=>{

    try{

        const {email,otp}=req.body;


        const user=await User.findOne({
            email:email.toLowerCase()
        });


        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }


        if(
            user.otp !== otp ||
            user.otpExpiry < Date.now()
        ){

            return res.status(400).json({
                message:"Invalid or Expired OTP"
            });

        }


        res.json({
            message:"OTP Verified"
        });


    }catch(err){

        res.status(500).json({
            message:err.message
        });

    }

};




/* ==========================
   RESET PASSWORD
========================== */
exports.resetPassword = async(req,res)=>{

    try{

        const {email,password}=req.body;


        const user=await User.findOne({
            email:email.toLowerCase()
        });



        if(!user){

            return res.status(404).json({
                message:"User not found"
            });

        }



        const hashedPassword =
        await bcrypt.hash(password,10);



        user.password=hashedPassword;
        user.otp="";
        user.otpExpiry=null;


        await user.save();



        res.json({

            message:"Password Updated Successfully"

        });



    }catch(err){

        res.status(500).json({
            message:err.message
        });

    }

};