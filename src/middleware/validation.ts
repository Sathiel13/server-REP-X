import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

// Middleware para manejar los errores de validación
export const handleInputErrors = (req: Request, res: Response, next: NextFunction): Response | void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
