const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    crearCategoria,
    obtenerCategorias,
} = require('../controllers/categorie_controllers');

// Ruta para crear una categoría
router.post(
    '/',
    [
        body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    ],
    crearCategoria
);

// Ruta para obtener todas las categorías
router.get('/', obtenerCategorias);

module.exports = router;
