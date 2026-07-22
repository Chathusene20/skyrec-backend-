import axios from "axios";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import OTP from "../models/otpModel.js";
import getDesignedEmail from "../lib/emailDesigner.js";

dotenv.config();


// ===============================
// Nodemailer Configuration
// ===============================


const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",

    port: 587,

    secure: false,

    requireTLS: true,

    family: 4,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD,
    }

});















// Check mail server connection

transporter.verify((error, success) => {

    if (error) {

        console.log("Mail Error:", error);

    } else {

        console.log("Mail server is ready.");

    }

});



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



    if (!email) {


        return res.status(400).json({

            message: "Email is required"

        });


    }



    try {



        const user = await User.findOne({

            email: email

        });



        if (!user) {


            return res.status(404).json({

                message: "User not found"

            });


        }





        const otp = Math.floor(

            100000 + Math.random() * 900000

        );



        console.log(
            "Generated OTP:",
            otp
        );





        await OTP.deleteMany({

            email: email

        });





        const newOTP = new OTP({

            email: email,

            otp: otp.toString()

        });




        await newOTP.save();







        const mailResult = await transporter.sendMail({


            from:
            `"Crystal Beauty Clear" <${process.env.EMAIL_USER}>`,


            to: email,


            subject:
            "Reset Your Password - OTP",



            html: getDesignedEmail({


                title:
                "Password Reset",



                subtitle:
                "Password Reset Verification",



                greeting:
                `Hello ${user.firstName} 👋`,



                message:
                "We received a request to reset your password. Use the OTP below to continue. Do not share this code with anyone.",



                otp: otp,



                validity:
                "10 minutes",



                companyName:
                "Crystal Beauty Clear"


            })


        });




        console.log(
            "MAIL SENT:",
            mailResult.messageId
        );




        res.json({

            message:
            "OTP sent to your email"

        });



    } catch(error) {


        console.log(
            "OTP Error:",
            error
        );


        res.status(500).json({

            message:
            "Failed to send OTP"

        });


    }


}
// ===============================
// Change Password Using OTP
// ===============================

export async function changePasswordViaOTP(req, res) {


    const email = req.body.email;

    const otp = req.body.otp?.toString();

    const newPassword = req.body.newPassword;



    if (!email || !otp || !newPassword) {


        return res.status(400).json({

            message:
            "Email, OTP and new password are required"

        });


    }



    console.log("Email:", email);

    console.log("OTP:", otp);



    try {



        // Find OTP record

        const otpRecord = await OTP.findOne({

            email: email,

            otp: otp

        });




        if (!otpRecord) {


            return res.status(400).json({

                message:
                "Invalid OTP"

            });


        }




        // Delete OTP after successful verification

        await OTP.deleteMany({

            email: email

        });






        // Hash new password

        const hashedPassword = bcrypt.hashSync(

            newPassword,

            10

        );






        // Update password

        await User.updateOne(

            {

                email: email

            },

            {

                password: hashedPassword

            }


        );





        res.json({

            message:
            "Password changed successfully"

        });





    } catch(error) {



        console.log(
            "Change Password Error:",
            error
        );



        res.status(500).json({

            message:
            "Failed to change password"

        });



    }


}