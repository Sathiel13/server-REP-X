import { Request, Response } from "express";
import Product from "../models/product";

// Crear un nuevo producto
export const createProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { name, price, description, stock } = req.body;
        const image = (req as any).file?.path || "";

        const newProduct = new Product({ name, price, description, stock, image });
        await newProduct.save();
        return res.status(201).json(newProduct);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// Obtener todos los productos
export const getAllProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const products = await Product.find();
        return res.status(200).json(products);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// Obtener un producto por ID
export const getProductById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        return res.status(200).json(product);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// Actualizar un producto
export const updateProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        return res.status(200).json(product);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// Eliminar un producto
export const deleteProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        return res.status(200).json({ message: "Producto eliminado" });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};
//Productos Aleatorios
export const getRandomProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const randomProducts = await Product.aggregate([{ $sample: { size: 3 } }]);
        return res.json(randomProducts);
    } catch (error) {
        console.error('Error al obtener productos aleatorios:', error);
        return res.status(500).json({ message: 'Error al obtener productos aleatorios' });
    }
};

