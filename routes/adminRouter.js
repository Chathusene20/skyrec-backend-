import express from "express";

import {
    getDashboardData
} from "../controllers/adminController.js";

import verifyToken from "../middleware/middleware/verifyToken.js";
import verifyAdmin from "../middleware/middleware/verifyAdmin.js";

const adminRouter = express.Router();


adminRouter.get(
    "/dashboard",
    verifyToken,
    verifyAdmin,
    getDashboardData
);


export default adminRouter;