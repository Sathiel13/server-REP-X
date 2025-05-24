import express from "express";
import { corsConfig } from './config/cors';
import router from './router';
import { connectDB } from "./config/db";
import dotenv from 'dotenv';
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { stripeWebhookHandler } from "./handlers/stripeWebhook";
dotenv.config();
connectDB();



const app = express();
// Ruta específica para el Webhook de Stripe con cuerpo crudo
app.post('/api/webhook', express.raw({ type: "application/json" }), stripeWebhookHandler);
//CORS 1
app.use(corsConfig);
//HELMET 2
app.use(helmet());
// 3. Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limita a 100 solicitudes por IP
    message: "Demasiadas solicitudes desde esta IP, por favor intente de nuevo más tarde.",
});
app.use(limiter);

// Configuración para manejar JSON globalmente (excepto en el webhook)
app.use(express.json());


// Montamos el router con el prefijo /api
app.use('/api', router);

export default app;
