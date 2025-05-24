import { Request, Response } from 'express';
import Coupon from '../models/cupones';

// Crear un cupón
export const createCoupon = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { code, discountType, value, maxUses, validFrom, validUntil } = req.body;

        const coupon = new Coupon({
            code,
            discountType,
            value,
            maxUses,
            validFrom,
            validUntil
        });

        const savedCoupon = await coupon.save();
         return res.status(201).json(savedCoupon);
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear el cupón', error });
    }
};

// Validar cupón, lo usare para llamarlo desde order, por ahora no se esta usando en frontend
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (
            !coupon ||
            coupon.usedCount >= coupon.maxUses ||
            coupon.validFrom > new Date() ||
            coupon.validUntil < new Date()
        ) {
            res.status(400).json({ valid: false, message: 'Cupón inválido o expirado' });
            return;
        }


        res.status(200).json({
            valid: true,
            discountType: coupon.discountType,
            value: coupon.value,
            couponId: coupon._id
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al validar el cupón', error });
    }
};

// Obtener todos los cupones
export const getAllCoupons = async (_req: Request, res: Response): Promise<Response> => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
       return  res.status(200).json(coupons);
    } catch (error) {
      return  res.status(500).json({ message: 'Error al obtener los cupones', error });
    }
};

// Desactivar un cupón
export const deactivateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!coupon) {
          res.status(404).json({ message: 'Cupón no encontrado' });
        }

        res.status(200).json({ message: 'Cupón desactivado', coupon });
    } catch (error) {
        res.status(500).json({ message: 'Error al desactivar el cupón', error });
    }
};

// Función para incrementar el uso del cupón, tambien lo usare mas adelante en la funcion de ordenes por ahora funciona
//pero no esta llamado en el frontend
export const useCoupon = async (couponId: string): Promise<void> => {
    await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
};

// Activar un cupón
export const activateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            { isActive: true },
            { new: true }
        );

        if (!coupon) {
            res.status(404).json({ message: 'Cupón no encontrado' });
            return;
        }

        res.status(200).json({ message: 'Cupón activado', coupon });
    } catch (error) {
        res.status(500).json({ message: 'Error al activar el cupón', error });
    }
};