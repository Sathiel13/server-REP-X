import { Request, Response } from "express";
import Order from "../models/ordenes";
import User from "../models/user";

export const getDashboardMetrics = async (req: Request, res: Response) => {
    try {
        // Total de ventas (de órdenes pagadas)
        const paidOrders = await Order.find({ isPaid: true });

        const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

        // Total de productos vendidos
        const totalItemsSold = paidOrders.reduce((sum, order) => {
            return sum + order.products.reduce((acc, item) => acc + item.quantity, 0);
        }, 0);

        // Total de usuarios registrados
        const totalUsers = await User.countDocuments();

        // Total de órdenes completadas
        const completedOrders = await Order.countDocuments({ isDelivered: true });

        // Órdenes por estado
        const ordersByStatus = {
            pagadas: await Order.countDocuments({ isPaid: true }),
            pendientesPago: await Order.countDocuments({ isPaid: false }),
            entregadas: await Order.countDocuments({ isDelivered: true }),
            pendientesEntrega: await Order.countDocuments({ isDelivered: false }),
        };

        // Ventas diarias (últimos 7 días)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // últimos 7 días incluyendo hoy

        const dailySales = await Order.aggregate([
            {
                $match: {
                    isPaid: true,
                    createdAt: { $gte: sevenDaysAgo },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    total: { $sum: "$total" },
                },
            },
            { $sort: { _id: 1 } }
        ]);

        return res.status(200).json({
            totalRevenue,
            totalItemsSold,
            totalUsers,
            completedOrders,
            ordersByStatus,
            dailySales,
        });
    } catch (error) {
        console.error("Error en getDashboardMetrics:", error);
        return res.status(500).json({ message: "Error al obtener métricas del dashboard." });
    }
};
