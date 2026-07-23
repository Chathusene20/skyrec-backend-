import express from 'express';
import { createProduct, deleteProduct, getProduct, getProductId, updateProduct } from '../controllers/productController.js';
import verifyToken from '../middleware/middleware/verifyToken.js';

const productRouter = express.Router();

// CRUD operation

productRouter.get("/", getProduct);   //  matches the exported function name
productRouter.post("/",verifyToken, createProduct);
productRouter.delete("/:productID",verifyToken,deleteProduct);
productRouter.put("/:productID",verifyToken,updateProduct)
productRouter.get("/:productID",getProductId)


export default productRouter;
