const express = require('express');
const {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    confirmPurchase,
    registrarPedido,
    listarPedidosCliente,
    listarPedidosAdministrador,
} = require('../controllers/carrito_controllers');
const { verificarAutenticacion,verificarAdministrador } = require('../middlewares/auth_middleware');
const router = express.Router();

// crear o agregar productos a carrito
router.post('/cart/:usuarioId/add', addToCart); // Agregar producto
router.get('/cart/:usuarioId', getCart); // Obtener carrito
router.put('/cart/:pedidoId/product/:productoId', updateCartItem); // Modificar cantidad
router.delete('/cart/:pedidoId/product/:productoId', removeCartItem); // Eliminar producto
router.post('/cart/:usuarioId/confirm', confirmPurchase);

// ver por usuario o negocio
router.post('/pedidos', verificarAutenticacion, registrarPedido);
router.get('/pedidos/admin', listarPedidosAdministrador);
router.get('/pedidos/misPedidos', verificarAutenticacion, listarPedidosCliente);

module.exports = router;
