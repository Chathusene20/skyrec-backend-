import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        orderID: {
            type: String,
            required: true,
            unique: true
        },

        items: [
            {
                productID: {
                    type: String,
                    required: true
                },

                quantity: {
                    type: Number,
                    required: true
                },

                name: {
                    type: String,
                    required: true
                },

                Price: {
                    type: Number,
                    required: true
                },

                image: {
                    type: String,
                    required: true
                }
            }
        ],

        customerName: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true
        },

        total: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            default: "pending"
        },

        date: {
            type: Date,
            default: Date.now
        }
    }
);


const Order = mongoose.model("order", orderSchema);

export default Order;