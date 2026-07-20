import mongoose from "mongoose";  // export mongoose as we create schema my using mongoose.

const userSchema = new mongoose.Schema(         // Schema crated to save the structure of the user.

    {
        email:{
            type: String,
            required : true,   // there must be an email
            unique : true      // one person can register through one email


        },
        firstName : {
            type : String,
            required : true
        },
        lastName : {
            type : String,
            required : true
        },
        password : {
            type : String,
            required : true
        },
        role: {
            type : String,
            required : true,
            default : "user"
        },
        isBlock : {
            type : Boolean,
            default:false
        },
        isEmailVerified : {
            type : Boolean,
            default:false
        },
        image : {
            type : String,
            default : "/user.png"
        }
    }
)   

const User = mongoose.model("User",userSchema)
export default User