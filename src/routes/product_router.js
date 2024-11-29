const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer'); // El archivo de configuración de multer
const {
    crearProducto,
    verTodosLosProductos,
    verProductosPorNegocio,
    verProductoPorId,
    editarProducto,
    desactivarProducto,
    filtrarProductosPorCategoria  } = require('../controllers/product_controllers');

// Ruta para crear un producto, con soporte para múltiples imágenes
router.post('/prd', upload.array('imagenes'), crearProducto);
router.get('/prd', verTodosLosProductos); // Ver todos los productos
router.get('/negocio/:negocioId', verProductosPorNegocio);
router.get('/prd/:productId', verProductoPorId);
router.put('/prd/:productId', editarProducto);
router.patch('/prd/:productId/desactivar', desactivarProducto);
router.get('/productos/categoria/:categoriaId', filtrarProductosPorCategoria);

module.exports = router;
