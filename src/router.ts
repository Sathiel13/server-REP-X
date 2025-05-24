import { Router } from "express";
import { body } from "express-validator";
import dotenv from "dotenv";
import {authenticate} from "./middleware/auth";
import { authorizeAdmin } from "./middleware/authorizeAdmin";
import { getDashboardMetrics } from "./handlers/handler-dashboard";
import { createStripePaymentIntent } from './handlers/handler-stripe';


import {
    createOrder, getOrderById, updateOrderStatus, deleteOrder, getAllOrders
} from './handlers/handler-Ordenes';


import {
    createCoupon,
    validateCoupon,
    getAllCoupons,
    deactivateCoupon,
    activateCoupon
} from './handlers/handler-Coupons';

import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getRandomProducts
} from "./handlers/handler-product";
import {
    createUser,
    getUserByEmail,
    loginUser,
    updateUserProfile,
    deleteUser
} from "./handlers/handler-user";
import { handleInputErrors } from "./middleware/validation";
import upload from "./middleware/upload";

import {
    addToCart,
    getCart,
    removeFromCart,
    clearCart,
} from "./handlers/handler-cart";



dotenv.config();

const router: Router = Router();

// Endpoint para generar un Payment Intent para Stripe
router.post('/create-payment-intent', authenticate, createStripePaymentIntent);



// Ruta para agregar producto al carrito
router.post("/cart", authenticate, addToCart);

// Ruta para obtener el carrito del usuario actual
router.get("/cart", authenticate, getCart);

// Ruta para eliminar un producto del carrito
router.delete("/cart/:productId", authenticate, removeFromCart);

// Ruta para vaciar el carrito
router.delete("/cart", authenticate, clearCart);

//ORDENES
/**
 * @route POST /api/orders
 * @desc Crear una nueva orden
 */
// Ruta para crear una nueva orden
router.post('/orders', authenticate,createOrder);
// Ruta para obtener todas las órdenes
router.get('/orders', authenticate, getAllOrders);
// Ruta para obtener una orden por ID
router.get('/orders/:id', authenticate,getOrderById);
// Ruta para actualizar el estado de una orden
router.put('/orders/:id',authenticate, updateOrderStatus);
// Ruta para eliminar una orden
router.delete('/orders/:id', authenticate,deleteOrder);


// CUPONES
/**
 * @route POST /api/coupons
 *
 */
router.post('/admin/cupon',authenticate,authorizeAdmin,createCoupon);                  // Crear cupón (Admin)
router.get('/admin/cupon', authenticate,authorizeAdmin,getAllCoupons);                  // Obtener todos los cupones
router.post('/validatecupon',validateCoupon);        // Validar cupón en checkout
router.put('/:id/deactivate/cupon', authenticate,authorizeAdmin,deactivateCoupon); // Desactivar cupón (Admin)
// Ruta para activar un cupón (Admin)
router.put('/:id/activate/cupon', authenticate, authorizeAdmin, activateCoupon);

// 📦 PRODUCTOS
/**
 * @route POST /api/products
 * @desc Crear un nuevo producto
 */
router.post(
    "/products",
    upload.single("image"),
    body("name").notEmpty().withMessage("El nombre del producto es obligatorio"),
    body("price").isFloat().withMessage("El precio debe ser un número válido"),
    body("stock").isInt({ min: 0 }).withMessage("La cantidad en stock debe ser un número entero positivo"),
    handleInputErrors,authenticate,authorizeAdmin,
    createProduct
);

/**
 * @route GET /api/products
 * @desc Obtener todos los productos
 */
router.get("/products", getAllProducts);

// Ruta para obtener productos aleatorios
router.get('/products/random', getRandomProducts);



/**
 * @route GET /api/products/:id
 * @desc Obtener un producto específico por ID
 */
router.get("/products/:id", getProductById);

/**
 * @route PUT /api/products/:id
 * @desc Actualizar un producto
 */
router.put(
    "/products/:id",
    body("name").optional().notEmpty().withMessage("El nombre no puede estar vacío"),
    body("price").optional().isFloat().withMessage("El precio debe ser un número válido"),
    body("stock").optional().isInt({ min: 0 }).withMessage("El stock debe ser un número entero positivo"),
    handleInputErrors,authenticate,authorizeAdmin,
    updateProduct
);

/**
 * @route DELETE /api/products/:id
 * @desc Eliminar un producto
 */
router.delete("/products/:id",authenticate,authorizeAdmin,deleteProduct);



// 👥 USUARIOS Y AUTENTICACIÓN
/**
 * @route POST /api/auth/register
 * @desc Registrar un nuevo usuario
 */
router.post(
    "/auth/register",
    body("name").notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("El email debe ser válido"),
    body("password").isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres"),
    handleInputErrors,
    createUser
);

/**
 * @route POST /api/auth/login
 * @desc Iniciar sesión de usuario
 */
router.post(
    "/auth/login",
    body("email").notEmpty().withMessage("El email es obligatorio"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
    handleInputErrors,
    loginUser
);

/**
 * @route GET /api/user/:email
 * @desc Obtener un usuario por su email
 */
router.get(
    "/user/:email",
    handleInputErrors,authenticate,
    getUserByEmail
);


/**
 * @route PATCH /api/user/:handler
 * @desc Actualizar perfil del usuario
 */
router.patch("/user/:handler", authenticate,updateUserProfile);

// Ruta para eliminar un usuario
/**
 * @route DELETE /api/user/:userId
 * @desc Eliminar un usuario por su ID
 */
router.delete("/user/:userId", authenticate, deleteUser);



//RUTAS PARA PROCESO DE PAGOS
/**
@route POST /api/payment
@desc Crear un nuevo pago
*/


// Ruta para métricas del panel admin
router.get("/admin/dashboard-metrics", authenticate, authorizeAdmin, getDashboardMetrics);



export default router;
