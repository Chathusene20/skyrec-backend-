import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import orderRouter from "./routes/orderRouter.js";


dotenv.config();


console.log("MONGO_URI:", process.env.MONGO_URI);


// MongoDB Connection

mongoose.connect(process.env.MONGO_URI)

.then(()=>{

    console.log("MongoDB connected successfully");

})

.catch((error)=>{

    console.log(
        "MongoDB connection error:",
        error
    );

});



const app = express();



// CORS

app.use(cors({

    origin:[
        "http://localhost:5173",
        "https://skyrec-frontend-umxy.vercel.app"
    ],

    methods:[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ],

    allowedHeaders:[
        "Content-Type",
        "Authorization"
    ],

    credentials:true

}));




// JSON Middleware

app.use(express.json());




// Test Route

app.get("/",(req,res)=>{

    res.send("SkyRec Backend is running");

});




// Routes

app.use("/api/users", userRouter);

app.use("/api/products", productRouter);

app.use("/api/orders", orderRouter);





app.listen(
    process.env.PORT || 5000,

    ()=>{

        console.log(
            "Server is running on port " +
            (process.env.PORT || 5000)
        );

    }
);