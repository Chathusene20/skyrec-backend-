import User from "../models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

export function createUser(req,res){

const hashedPassword = bcrypt.hashSync(req.body.password,10)                  // 10 = salting rounds 

 const user = new User (
    {
       email : req.body.email,
       firstName : req.body.firstName,
       lastName : req.body.lastName,
       password : hashedPassword

    }
      
 )

  user.save().then(
    ()=>{
        res.json({
            message : "User created Successfully"
        })
    }

).catch(
    ()=> {
      res.json ({
        message : "Failed to create user"
      })
      return;
    }
)
}

export function loginUser(req,res){

   console.log(req.user) // print user details 
   
    User.findOne(
        {
            email : req.body.email  // find matching email requeted 
        }

    ).then (
         (user) => {
            if(user ==null){
                res.status(404).json (
                    {
                        message : "User not found"
                    }
                )
            } else {
                const isPasswordMatching = bcrypt.compareSync(req.body.password,user.password)  // check if the requested password and the password in the database are matching 
                {
                    if (isPasswordMatching){

                        const token = jwt.sign(
                            {
                                email: user.email,
                                firstName: user.firstName,
                                lastName : user.lastName,
                                role : user.role,
                                isEmailVerified: user.isEmailVerified,

                            },
                            "jwt-secret"   // key that used for the process encrypt and decrypt .
                        )
                      

                        res.json(
                           {
                            message: "Login Successfull",
                            token : token
                            
                           } 
                        )
                    }else {
                        res.status(500).json(
                            {
                                message : "Invalid password"
                            }
                        )
                    }
                }
            }
         }
    )
}
  

export function isAdmin(req){
  if (req.user==null){
    return false;
  }
  if (req.user.role !="admin"){
    return false 
  }

  return true;
}

export function isCustomer(req){
    if (req.user==null){
        return false;
    }
    if (req.user.role !="user"){
        return false
    }
    return true;
    
}
