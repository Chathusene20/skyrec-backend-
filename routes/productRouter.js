import express from 'express';
import { createProduct, deleteProduct, getProduct, getProductId, updateProduct } from '../controllers/productController.js';

const productRouter = express.Router();

// CRUD operation

productRouter.get("/", getProduct);   // ✅ matches the exported function name
productRouter.post("/", createProduct);
productRouter.delete("/:productID",deleteProduct);
productRouter.put("/:productID",updateProduct)
productRouter.get("/:productID",getProductId)


export default productRouter;