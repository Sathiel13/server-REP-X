import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
    {
        stripeId: { type: String, required: true, unique: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        status: { type: String, required: true },
        customerEmail: { type: String },
    },
    { timestamps: true }
);

export const Payment = mongoose.model("Payment", PaymentSchema);