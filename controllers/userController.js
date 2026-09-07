import axios from "axios";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import OTP from "../models/otpModel.js";
import getDesignedEmail from "../lib/emailDesigner.js";
import { Resend } from "resend";

dotenv.config();


const resend = new Resend(process.env.RESEND_API_KEY);


// ===============================
// Create User / Register
// ===============================

export function createUser(req, res) {

    const hashedPassword = bcrypt.hashSync(
        req.body.password,
        10
    );


    const user = new User({

        email: req.body.email,

        firstName: req.body.firstName,

        lastName: req.body.lastName,

        password: hashedPassword,

        image: "/user.png"

    });



    user.save()

    .then(() => {

        res.json({

            message: "User created successfully"

        });

    })


    .catch((err) => {

        console.log(err);

        res.status(500).json({

            message: "Failed to create user"

        });

    });

}




// ===============================
// Login User
// ===============================

export async function loginUser(req, res) {

    console.log("LOGIN API CALLED");

    console.log("EMAIL:", req.body.email);
    console.log("PASSWORD:", req.body.password);


    try {

        const user = await User.findOne({
            email: req.body.email
        });


        console.log("USER FOUND:", user);


        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }


        console.log("ENTERED PASSWORD:", req.body.password);
console.log("DATABASE PASSWORD:", user.password);

const passwordMatch = bcrypt.compareSync(
    req.body.password,
    user.password
);

console.log("MATCH:", passwordMatch);
        
        
        


        console.log("PASSWORD MATCH:", passwordMatch);


        if (!passwordMatch) {

            return res.status(401).json({
                message: "Invalid password"
            });

        }


        const token = jwt.sign(
            {
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET
        );


        res.json({

            message:"Login successful",

            token:token,

            user:{
                email:user.email,
                firstName:user.firstName,
                lastName:user.lastName,
                role:user.role,
                image:user.image
            }

        });


    } catch(error){

        console.log("LOGIN ERROR:",error);


        res.status(500).json({
            message:"Login failed"
        });

    }

}
// ===============================
// Check Admin
// ===============================

export function isAdmin(req) {

    if (req.user == null) {

        return false;

    }


    if (req.user.role !== "admin") {

        return false;

    }


    return true;

}



// ===============================
// Check Customer
// ===============================

export function isCustomer(req) {


    if (req.user == null) {

        return false;

    }


    if (req.user.role !== "user") {

        return false;

    }


    return true;

}




// ===============================
// Get Logged User
// ===============================

export function getUser(req, res) {


    if (req.user == null) {

        return res.status(401).json({

            message: "Unauthorized"

        });

    }



    res.json(req.user);


}





// ===============================
// Google Login
// ===============================

export async function googleLogin(req, res) {


    const token = req.body.token;


    if (!token) {

        return res.status(400).json({

            message: "Google token is required"

        });

    }



    try {


        const googleResponse = await axios.get(

            "https://www.googleapis.com/oauth2/v3/userinfo",

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );



        const googleUser = googleResponse.data;



        let user = await User.findOne({

            email: googleUser.email

        });



        // Create new user

        if (!user) {


            user = new User({

                email: googleUser.email,

                firstName: googleUser.given_name,

                lastName: googleUser.family_name || "",

                password: bcrypt.hashSync(
                    "google-login",
                    10
                ),

                isEmailVerified: googleUser.email_verified,

                image: googleUser.picture

            });



            await user.save();


        }




        if (user.isBlock) {


            return res.status(403).json({

                message:
                "Your account has been blocked. Please contact admin"

            });


        }




        const jwtToken = jwt.sign(


            {

                email: user.email,

                firstName: user.firstName,

                lastName: user.lastName,

                role: user.role,

                isEmailVerified: user.isEmailVerified,

                image: user.image


            },


            process.env.JWT_SECRET


        );





        res.json({


            message: "Login successful",


            token: jwtToken,


            user: {


                email: user.email,

                firstName: user.firstName,

                lastName: user.lastName,

                role: user.role,

                isEmailVerified: user.isEmailVerified,

                image: user.image


            }


        });



    } catch (error) {


        console.log(error);


        res.status(500).json({

            message: "Google login failed"

        });


    }

}





// ===============================
// Get All Users (Admin)
// ===============================

export async function getAllUsers(req, res) {


    if (!isAdmin(req)) {


        return res.status(403).json({

            message: "Forbidden"

        });


    }



    try {


        const users = await User.find();


        res.json(users);



    } catch (error) {


        console.log(error);


        res.status(500).json({

            message: "Failed to get users"

        });


    }


}






// ===============================
// Block / Unblock User
// ===============================

export async function blockOrUnblockUser(req, res) {


    if (!isAdmin(req)) {


        return res.status(403).json({

            message: "Forbidden"

        });


    }



    if (req.user.email === req.params.email) {


        return res.status(400).json({

            message: "You cannot block yourself"

        });


    }



    try {


        await User.updateOne(

            {

                email: req.params.email

            },

            {

                isBlock: req.body.isBlock

            }


        );



        res.json({

            message:
            "User block status updated successfully"

        });



    } catch(error) {


        console.log(error);


        res.status(500).json({

            message:
            "Failed to update user status"

        });


    }


}






// ===============================
// Send OTP Email
// ===============================

export async function sendOTP(req, res) {

   

    const email = req.params.email;

  



    if (email==null) {


        res.status(400).json({

            message: "Email is required"

        });
        return


    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    try{

        await OTP.deleteMany({
            email : email
        });

        const newOTP = new OTP ({
            email : email,
            otp : otp,
       
        });
        await newOTP.save();

        //Send email using Resend 

    const { data, error } = await resend.emails.send({

    from: "SkyRec <onboarding@resend.dev>",
    to: [email],
    subject: "Your OTP for password reset",
    text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`

    });

     if (error) {
     console.log("Resend Error:", error);
     throw new Error("Failed to send email");
      }
        
     res.json({
            message: "OTP send to your email"
        });

    }catch(err){
        console.log("OTP ERROR:",err)
        res.status(500).json({
            message: "Failed to send OTP"
        });
    }
}


export async function changePasswordViaOTP(req,res){
    const email = req.body.email;
    const otp = req.body.otp;
    const newPassword = req.body.newPassword;
try{
    const otpRecord = await OTP.findOne({
        email : email,
        otp :otp 
    });
    
    if(otpRecord == null){
        res.status(400).json({
            message: "Invalid OTP"
        });
        return;
    }

    await OTP.deleteMany({
        email : email 
    }); 

    const hashedPassword = bcrypt.hashSync(newPassword, 10)
  
        await User.updateOne({
            email : email 
        },{
            password : hashedPassword
        });

    }catch(err){
        res.status(500).json({
            message: "Failed to change password"
        });
    }

    
}



   



   

   

   



   


   

   

   


   





   

   

   



   
   
   
   





   

   

   





   

   

   

   




   







   


   
   


   


   
   



   


   
   



   
   



   
   



   
   



   



   
   




















































































