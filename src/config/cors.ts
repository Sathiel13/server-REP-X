import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();
const allowedOrigins = [
    'https://view-rep-1gxwb3rsa-cristian-sathiel-ramirez-reveles-projects.vercel.app',
    'https://view-rep-x.vercel.app',
    'http://localhost:5000'
];


const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        console.log(`Origen recibido: ${origin}`); // Para depuración
        if (!origin) {
            // Permitir solicitudes sin origen (ej. JetClient o Postman)
            console.warn('Solicitud sin origen (Posiblemente de JetClient o Postman), permitida.');
            return callback(null, true);
        }
        // Verificar origen--Frontend..
        if (allowedOrigins.includes(origin)) {
            // Origen permitido
            console.log(`Origen permitido: ${origin}`);
            return callback(null, true);
        }
        // Bloquear solicitud
        console.error(`Origen bloqueado: ${origin}`);
        return callback(new Error('Error de CORS'));
    },
};

export const corsConfig = cors(corsOptions);
