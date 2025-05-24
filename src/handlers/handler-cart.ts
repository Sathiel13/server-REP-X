import { Request, Response } from "express";

interface CustomRequest extends Request {
    user?: { id: string };
}
import Cart from "../models/cart";
import Product from "../models/product";

// Agregar producto al carrito
export const addToCart = async (req: CustomRequest, res: Response) => {
    try {
        console.log("ID de usuario autenticado:", req.user?.id); // Esto debería mostrar el ID del usuario

        const { productId, quantity } = req.body;
        const userId = req.user?.id; // Usuario autenticado

        if (!productId || !quantity) {
            return res.status(400).json({ message: "Producto y cantidad son requeridos" });
        }

        // Buscar producto
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        // Encontrar carrito del usuario
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            // Crear nuevo carrito si no existe
            cart = new Cart({ user: userId, items: [], total: 0 });
        }

        // Verificar si el producto ya está en el carrito
        const productIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        if (productIndex > -1) {
            // Si existe, actualizar la cantidad
            cart.items[productIndex].quantity += quantity;
        } else {
            // Si no existe, agregar el producto
            cart.items.push({ product: productId, quantity });
        }

        // Recalcular el total
        cart.total = cart.items.reduce(
            (sum, item) => sum + item.quantity * product.price,
            0
        );

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: (error instanceof Error ? error.message : "Ocurrió un error desconocido") });
    }
};

// Obtener carrito del usuario
export const getCart = async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.user && req.user.id; // Usuario autenticado
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Ocurrió un error desconocido" });
    }
};

// Eliminar producto del carrito
export const removeFromCart = async (req: CustomRequest, res: Response) => {
    try {
        const { productId } = req.params; // Obtener el ID del producto del parámetro de la solicitud
        const userId = req.user?.id; // Obtener la ID del usuario autenticado

        if (!productId) {
            return res.status(400).json({ message: "El ID del producto es requerido" });
        }

        if (!userId) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }

        // Buscar el carrito del usuario, asegurándonos de poblar el campo 'product'
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        // Encontrar el producto en el carrito mediante su índice
        const productIndex = cart.items.findIndex(
            (item) => item.product._id.toString() === productId
        );

        if (productIndex === -1) {
            return res.status(404).json({ message: "Producto no encontrado en el carrito" });
        }

        // Eliminar el producto del carrito
        cart.items.splice(productIndex, 1);

        // Recalcular el total del carrito
        cart.total = cart.items.reduce(
            (sum, item) => sum + item.quantity * (item.product as any).price, // Asegúrate de que item.product contiene 'price'
            0
        );

        // Guardar los cambios en el carrito
        await cart.save();

        return res.status(200).json(cart); // Enviar el carrito actualizado al cliente
    } catch (error) {
        console.error("Error en removeFromCart:", error);
        return res.status(500).json({
            message: error instanceof Error ? error.message : "Error desconocido en el servidor",
        });
    }
};

// Vaciar carrito
export const clearCart = async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.user && req.user.id;
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        cart.items = [];
        cart.total = 0;
        await cart.save();

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: (error instanceof Error ? error.message : "Ocurrió un error desconocido") });
    }
};