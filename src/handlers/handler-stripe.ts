import { Request, Response } from 'express';

declare module 'express-serve-static-core' {
    interface Request {
        user?: { id: string };
    }
}
import Stripe from "stripe";
import dotenv from "dotenv";
import { ICart } from '../models/cart';
import Cart from "../models/cart";
import Order from "../models/ordenes";
import { Payment } from "../models/Payment";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil"
});

// Handler para crear Payment Intent
export const createStripePaymentIntent = async (req: Request, res:Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        const cart = await Cart.findOne<ICart>({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Carrito no encontrado o vacío.' });
        }

        const totalAmount = cart.items.reduce((total, item) => {
            const product = item.product as any;
            return total + product.price * item.quantity;
        }, 0);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: 'usd',
            metadata: {
                userId: userId,
                cartId: cart._id.toString(),
            },
        });

        // Guardar en la base de datos
        const paymentRecord = new Payment({
            stripeId: paymentIntent.id,
            user: userId,
            cart: cart._id,
            amount: totalAmount,
            currency: "usd",
            status: paymentIntent.status,
        });
        await paymentRecord.save();

        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            total: totalAmount,
        });
    } catch (error) {
        console.error('❌ Error al crear Payment Intent:', error);
        res.status(500).json({ message: 'Error al procesar el pago.' });
    }
};

// Webhook de Stripe
export const stripeWebhookHandler = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        return res.status(400).send("Faltan datos del Webhook.");
    }

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            const cartId = paymentIntent.metadata.cartId;
            const userId = paymentIntent.metadata.userId;

            const cart = await Cart.findById<ICart>(cartId).populate('items.product');
            if (!cart) return res.status(404).send('Carrito no encontrado.');

            // Crear orden
            await Order.create({
                user: userId,
                products: cart.items.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                })),
                total: cart.total,
                paymentStatus: 'paid',
                deliveryStatus: 'processing',
            });

            // Actualizar el estado del Payment Intent en la base de datos
            await Payment.findOneAndUpdate(
                { stripeId: paymentIntent.id },
                { status: 'succeeded' }
            );

            // Eliminar carrito
            await Cart.findByIdAndDelete(cart._id);

            console.log('✅ Orden creada correctamente.');
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('❌ Error procesando el Webhook:', error);
        if (error instanceof Error) {
            res.status(400).send(`Webhook error: ${error.message}`);
        } else {
            res.status(400).send('Webhook error: Unknown error.');
        }
    }
};