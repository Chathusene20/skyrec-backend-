import User from "../models/user.js";
import Product from "../models/product.js";
import Order from "../models/order.js";

export async function getDashboardData(req, res) {

    try {

        // --------------------------------
        // BASIC COUNTS
        // --------------------------------

        const totalUsers = await User.countDocuments({
            role: "user"
        });

        const totalProducts = await Product.countDocuments();

        const totalOrders = await Order.countDocuments();


        // --------------------------------
        // SALES
        // --------------------------------

        const salesResult = await Order.aggregate([
            {
                $match: {
                    status: {
                        $nin: ["cancelled", "Cancelled"]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$total"
                    }
                }
            }
        ]);

        const totalSales =
            salesResult.length > 0
                ? salesResult[0].total
                : 0;


        // --------------------------------
        // ORDER STATUS COUNTS
        // --------------------------------

        const pendingOrders = await Order.countDocuments({
            status: "pending"
        });

        const processingOrders = await Order.countDocuments({
            status: "processing"
        });

        const completedOrders = await Order.countDocuments({
            status: "completed"
        });

        const cancelledOrders = await Order.countDocuments({
            status: "cancelled"
        });


        // --------------------------------
        // RECENT ORDERS
        // --------------------------------

        const recentOrders = await Order.find()
            .sort({ date: -1 })
            .limit(5)
            .select(
                "orderID customerName email total status date items"
            );


        // --------------------------------
        // RESPONSE
        // --------------------------------

        res.json({

            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalSales
            },

            orderStatus: {
                pending: pendingOrders,
                processing: processingOrders,
                completed: completedOrders,
                cancelled: cancelledOrders
            },

            recentOrders

        });

    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );

        res.status(500).json({
            message: "Failed to load admin dashboard"
        });

    }

}