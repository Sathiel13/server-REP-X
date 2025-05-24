import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";

interface AuthRequest extends Request {
    user?: { id: string; role?: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token requerido" });
    }

    try {
        const decoded = verifyToken(token) as JwtPayload & { userId: string; role?: string };
        req.user = { id: decoded.userId, role: decoded.role };
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token inválido o expirado" });
    }
};