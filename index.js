import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import orderRouter from "./routes/orderRouter.js";


dotenv.config();

const app = express();


app.get("/", (req,res)=>{
    res.send("SkyRec Backend is running");
});

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://your-frontend-url.onrender.com"
    ],
    methods:["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders:["Content-Type","Authorization"],
    credentials:true
}));






app.use(express.json());

app.get("/", (req,res)=>{
    res.send("SkyRec Backend is running");
});


// JWT middleware here


app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);


app.listen(process.env.PORT || 5000, ()=>{
    console.log(
       "Server is running on port " + 
       (process.env.PORT || 5000)
    );
});