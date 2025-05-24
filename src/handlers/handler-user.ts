import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import { hashPassword, checkPassword } from "../utils/auth"; // Importar los métodos de bcrypt
import { generateToken } from '../utils/jwt';

// Crear un nuevo usuario
export const createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { name, email, password, role } = req.body; // Ahora el rol se pasa en el cuerpo de la solicitud

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El usuario con este email ya existe" });
        }

        // Encriptar la contraseña utilizando el helper
        const hashedPassword = await hashPassword(password);

        // Si no se pasa un rol, asignamos "user" por defecto
        const userRole = role || "user";  // Esto asegura que si no se pasa el rol, sea "user" por defecto

        // Crear un nuevo usuario con el rol dinámico
        const newUser = new User({ name, email, password: hashedPassword, role: userRole });
        await newUser.save();

        // Retornar el usuario creado
        return res.status(201).json({ message: "Usuario creado exitosamente", user: newUser });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};


// Obtener un usuario por su email
export const getUserByEmail = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email } = req.params;

        // Buscar usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.status(200).json(user);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// Actualizar el perfil del usuario
export const updateUserProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email } = req.params;
        const { name, password } = req.body;

        // Buscar el usuario
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Actualizar los detalles del usuario
        if (name) user.name = name;
        if (password) {
            const hashedPassword = await hashPassword(password);
            user.password = hashedPassword;
        }

        await user.save();

        return res.status(200).json({ message: "Perfil actualizado", user });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

// Autenticar usuario (login)
export const loginUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body;

        // Buscar al usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Email no registrado" });
        }

        // Verificar la contraseña utilizando el helper
        const isMatch = await checkPassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        // Generar el JWT token incluyendo el role del usuario
        const token = generateToken(user._id.toString(), user.role, user.name);

        // Retornar el token generado
        return res.status(200).json({ message: "Login exitoso", token });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};
//  eliminar un usuario
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;  // Obtener el userId desde los parámetros de la URL

        // Buscar al usuario por su ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Eliminar al usuario
        await User.findByIdAndDelete(userId);

        return res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};