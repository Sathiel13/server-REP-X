import mongoose, { Document, Schema, Types } from "mongoose";

// Interfaz del documento
export interface IOrder extends Document {
    user: Types.ObjectId;
    products: Array<{
        product: Types.ObjectId;
        quantity: number;
    }>;
    coupon?: Types.ObjectId | null;
    discountApplied: number;
    total: number;
    paymentStatus: "pending" | "paid" | "failed";
    deliveryStatus: "processing" | "shipped" | "delivered";
    shippingAddress: {
        street: string;
        city: string;
        zip: string;
        country: string;
    };
}

const orderSchema: Schema<IOrder> = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        products: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],
        coupon: {
            type: Schema.Types.ObjectId,
            ref: "Coupon",
            default: null,
        },
        discountApplied: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
            index: true,
        },
        deliveryStatus: {
            type: String,
            enum: ["processing", "shipped", "delivered"],
            default: "processing",
            index: true,
        },
        shippingAddress: {
            street: { type: String },
            city: { type: String },
            zip: { type: String },
            country: { type: String },
        },
    },
    {
        timestamps: true,
    }
);

// Índice compuesto
orderSchema.index({ createdAt: -1, paymentStatus: 1 });

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;