import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET!;

export const generateToken = (userId: string, role:string, name:string) => {
    return jwt.sign({ userId, role, name }, SECRET_KEY, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, SECRET_KEY);
};
