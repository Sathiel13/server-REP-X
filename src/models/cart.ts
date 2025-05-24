import mongoose, { Document, Schema, Types } from "mongoose";

// Interfaz para el carrito
export interface ICart extends Document {
    _id: Types.ObjectId; // Agregar explícitamente el campo _id
    user: Types.ObjectId; // Relacionado con el usuario
    items: Array<{
        product: Types.ObjectId; // Relacionado con el producto
        quantity: number; // Cantidad del producto
    }>;
    total: number; // Total del carrito
}

const CartSchema: Schema<ICart> = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // Un carrito por usuario (crea índice único automáticamente)
        },
        items: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1, // Cada producto debe tener al menos una unidad
                },
            },
        ],
        total: {
            type: Number,
            required: true,
            default: 0, // Inicializado como 0
        },
    },
    {
        timestamps: true, // Agrega campos createdAt y updatedAt automáticamente
    }
);

const Cart = mongoose.model<ICart>("Cart", CartSchema);

export default Cart;