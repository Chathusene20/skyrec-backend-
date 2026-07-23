import express from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/orderController.js';
import verifyToken from '../middleware/middleware/verifyToken.js';

const orderRouter = express.Router();

orderRouter.post ("/",verifyToken, createOrder);
orderRouter.get("/",verifyToken,getOrders)
orderRouter.put("/status/:orderID",verifyToken,updateOrderStatus)

export default orderRouter;