import { Request, Response } from 'express';
import Stripe from "stripe";
import dotenv from "dotenv";
import colors from "colors";
import { ICart } from '../models/cart';
import Order from "../models/ordenes";
import Cart from "../models/cart";

dotenv.config();

export const stripeWebhookHandler = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    if (!sig || !webhookSecret) {
        console.error('❌ Webhook: Faltan datos requeridos');

        return res.status(400).send("Faltan datos del Webhook.");
    }

    let event;
    try {
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15" as Stripe.LatestApiVersion });
        event = stripeInstance.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook verificación fallida:', err instanceof Error ? err.message : err);
        return res.status(400).send(`Webhook error: ${err instanceof Error ? err.message : err}`);
    }

    console.log('📥 Evento recibido:', event.type);

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        try {
            const cartId = paymentIntent.metadata.cartId;
            const userId = paymentIntent.metadata.userId;

            const cart = await Cart.findById<ICart>(cartId).populate('items.product');
            if (!cart) {
                console.error('Carrito no encontrado:', cartId);
                return res.status(404).send('Carrito no encontrado.');
            }
            console.log('✅ Carrito encontrado para el Webhook:', cart._id); // Valida que se obtiene el _id correctamente

            const products = cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
            }));

            const shippingAddress = {
                street: paymentIntent.shipping?.address?.line1 || 'N/A',
                city: paymentIntent.shipping?.address?.city || 'N/A',
                zip: paymentIntent.shipping?.address?.postal_code || 'N/A',
                country: paymentIntent.shipping?.address?.country || 'N/A',
            };

            await Order.create({
                user: userId,
                products,
                total: cart.total,
                paymentStatus: 'paid',
                deliveryStatus: 'processing',
                shippingAddress,
            });

            await Cart.findByIdAndDelete(cartId);

            console.log('💾 Orden y pago guardados en la base de datos:', paymentIntent.id);
        } catch (err) {
            console.error('❌ Error procesando el pago:', err);
            return res.status(500).send('Error procesando el pago.');
        }
    }

    res.status(200).json({ received: true });
};