import { Request, Response } from "express";
import Order from "../models/ordenes";

// Crear una nueva orden
export const createOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { user, products, coupon, discountApplied, total, shippingAddress } = req.body;

        // Crear una nueva orden
        const newOrder = new Order({
            user,
            products,
            coupon,
            discountApplied,
            total,
            shippingAddress,
        });

        await newOrder.save();

        return res.status(201).json(newOrder);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// Obtener una orden por ID
export const getOrderById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;

        // Buscar la orden por ID
        const order = await Order.findById(id)
            .populate("user")
            .populate("products.product")
            .populate("coupon");

        if (!order) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        return res.status(200).json(order);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// Actualizar el estado de una orden
export const updateOrderStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { paymentStatus, deliveryStatus } = req.body;

        // Buscar y actualizar la orden
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { paymentStatus, deliveryStatus },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        return res.status(200).json(updatedOrder);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// Eliminar una orden
export const deleteOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;

        // Eliminar la orden
        const deletedOrder = await Order.findByIdAndDelete(id);

        if (!deletedOrder) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        return res.status(200).json({ message: "Orden eliminada correctamente" });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// Obtener todas las órdenes
export const getAllOrders = async (req: Request, res: Response): Promise<Response> => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("products.product", "name price")
            .populate("coupon", "code discount");

        return res.status(200).json(orders);
    } catch (error: any) {
        console.error("Error al obtener órdenes:", error);
        return res.status(500).json({ message: error.message });
    }
};