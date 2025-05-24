import mongoose, { Document, Schema } from "mongoose";

// Interfaz para un Producto
interface IProduct extends Document {
    name: string;
    price: number;
    description?: string;
    stock: number;
    image:string;
}

const productSchema: Schema<IProduct> = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true, // 🔍 índice para búsquedas
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        description: {
            type: String,
            required: false,
            trim: true,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
        },
        image:{
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

// Índice de texto para búsqueda por nombre y descripción
productSchema.index({ name: "text", description: "text" });

// índice compuesto para filtros en catálogos (si usas categorías)
productSchema.index({ price: 1, stock: -1 });

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
