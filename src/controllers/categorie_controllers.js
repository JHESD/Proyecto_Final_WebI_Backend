const Categoria = require('../models/categorie_model');
const { validationResult } = require('express-validator');

// Crear una nueva categoría
const crearCategoria = async (req, res) => {
    try {
        // Validar los datos de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, descripcion } = req.body;

        // Crear la categoría en la base de datos
        const nuevaCategoria = await Categoria.create({ nombre, descripcion });

        res.status(201).json({
            message: 'Categoría creada con éxito',
            categoria: nuevaCategoria,
        });
    } catch (error) {
        console.error('Error al crear la categoría:', error);
        res.status(500).json({ message: 'Error al crear la categoría' });
    }
};

// Obtener todas las categorías
const obtenerCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.findAll();
        res.status(200).json(categorias);
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        res.status(500).json({ message: 'Error al obtener las categorías' });
    }
};

module.exports = {
    crearCategoria,
    obtenerCategorias,
};