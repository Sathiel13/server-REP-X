import mongoose, { Document, Schema } from "mongoose";

// Interfaz del usuario
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
}

const UserSchema: Schema<IUser> = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,       // Clave única para evitar emails duplicados
            lowercase: true,    // Normaliza el email
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user' },
    },
    { timestamps: true }
);

// Índice compuesto para búsquedas específicas
UserSchema.index({ email: 1, name: 1 });

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
