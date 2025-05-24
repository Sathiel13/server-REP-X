import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

// Configuración de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-04-30.basil" });

export const createPaymentIntent = async (amount: number) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Monto en centavos
            currency: "mxn", // Moneda (corregido a minúsculas)
            description: "Pago de orden",
        });
        return paymentIntent;
    } catch (error) {
        throw new Error((error as Error).message);
    }
};