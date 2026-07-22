import express from 'express';
import { blockOrUnblockUser, changePasswordViaOTP, createUser,getAllUsers,getUser,googleLogin,loginUser, sendOTP } from '../controllers/userController.js';
import verifyToken from '../middleware/middleware/verifyToken.js';

const userRouter = express.Router();

userRouter.post("/",createUser);
userRouter.post("/login",loginUser)
userRouter.get( "/me",verifyToken,getUser);
userRouter.post ("/google-login", googleLogin)
userRouter.get("/all-users",verifyToken,getAllUsers);
userRouter.put("/block/:email",verifyToken,blockOrUnblockUser);
userRouter.get("/send-otp/:email",sendOTP)
userRouter.post("/change-password/",changePasswordViaOTP)

export default userRouter;