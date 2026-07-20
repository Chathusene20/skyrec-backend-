import order from "../models/order.js";
import Product from "../models/product.js";
import { isAdmin, isCustomer } from "./userController.js";

export async function createOrder(req,res) {
    try {

        const user = req.user;

        if (user == null) {
            return res.status(401).json({
                message: "Unauthorized user"
            });
        }

        const orderList = await order.find().sort({ date: -1 }).limit(1);

        let newOrderID = "CBC0000001";

        if (orderList.length != 0) {

            let lastOrderIDString = orderList[0].orderID;
            let lastOrderNumberInString = lastOrderIDString.replace("CBC", "");
            let lastOrderNumber = parseInt(lastOrderNumberInString);

            let newOrderNumber = lastOrderNumber + 1;

            let newOrderNumberInString = newOrderNumber
                .toString()
                .padStart(7, "0");

            newOrderID = "CBC" + newOrderNumberInString;
        }

        let customerName = req.body.customerName;

        if (customerName == null) {
            customerName = user.firstName + " " + user.lastName;
        }

        let phone = req.body.phone;

        if (phone == null) {
            phone = "Not provided";
        }

        const itemsInRequest = req.body.items;

        if (itemsInRequest == null) {
            return res.status(404).json({
                message: "Items are required to place an order"
            });
        }

        if (!Array.isArray(itemsInRequest)) {
            return res.status(400).json({
                message: "Items should be an array"
            });
        }

        const orderItems = [];

        for (let i = 0; i < itemsInRequest.length; i++) {

            const item = itemsInRequest[i];

            const product = await Product.findOne({
                productID: item.productID
            });

            if (product == null) {
                return res.status(400).json({
                    message: `Product with ID ${item.productID} not found`,
                    productID: item.productID
                });
            }

            orderItems.push({
                productID: product.productID,
                quantity: item.quantity,
                name: product.name,
                Price: product.price,
                image: product.images[0]
            });
        }

        const newOrder = new order({
            orderID: newOrderID,
            items: orderItems,
            customerName: customerName,
            email: user.email,
            phone: phone,
            address: req.body.address,
            total: req.body.total,
            status: "pending"
        });

        const savedOrder = await newOrder.save();

        return res.status(201).json({
            message: "Order created successfully",
            order: savedOrder
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function getOrders(req, res) {

    try {

        if (isAdmin(req)) {

            // FIXED: order.find() instead of Order.find()
            const orders = await order.find().sort({ date: -1 });
            return res.json(orders);

        } else if (isCustomer(req)) {

            const user = req.user;

            const orders = await order.find({
                email: user.email
            }).sort({ date: -1 });

            return res.json(orders);

        } else {

            return res.status(403).json({
                message: "You are not authorized to view orders"
            });

        }

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            message: "Internal server error"
        });

    }
}
export async function updateOrderStatus(req, res) {

    try {

        if (!isAdmin(req)) {

            return res.status(403).json({
                message: "You are not authorized to update order"
            });

        }


        const orderID = req.params.orderID;

        const newStatus = req.body.status;



        const updatedOrder = await order.findOneAndUpdate(

            {
                orderID: orderID
            },

            {
                status: newStatus
            },

            {
                new: true
            }

        );



        if (updatedOrder == null) {

            return res.status(404).json({
                message: "Order not found"
            });

        }



        return res.json({

            message: "Order status updated successfully",

            order: updatedOrder

        });



    } catch (err) {

        console.log(err);

        return res.status(500).json({

            message: "Failed to update order status"

        });

    }

}