const Imagen = require('../models/image_model');
const Producto = require('../models/product_model');
const path = require('path');

// Crear imágenes asociadas a un producto
exports.createImagenes = async (req, res) => {
    try {
        const { producto_id } = req.body;

        if (!producto_id) {
            return res.status(400).json({ message: 'El producto_id es requerido' });
        }

        // Validar que el producto exista
        const producto = await Producto.findByPk(producto_id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Verificar que se hayan subido imágenes
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No se subieron imágenes' });
        }

        // Guardar las imágenes en la base de datos
        const imagenesGuardadas = [];
        for (const file of req.files) {
            const nuevaImagen = await Imagen.create({
                url_imagen: path.join('/uploads', file.filename),
                producto_id: producto.id
            });
            imagenesGuardadas.push(nuevaImagen);
        }

        res.status(201).json({
            message: 'Imágenes subidas y asociadas con éxito',
            imagenes: imagenesGuardadas
        });
    } catch (error) {
        console.error('Error al crear las imágenes:', error);
        res.status(500).json({ message: 'Error al subir las imágenes' });
    }
};

// Obtener imágenes por el ID del producto
exports.getImagenesByProductoId = async (req, res) => {
    try {
        const { productoId } = req.params;

        const producto = await Producto.findByPk(productoId);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const imagenes = await Imagen.findAll({
            where: { producto_id: productoId }
        });

        if (imagenes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron imágenes para este producto' });
        }

        res.status(200).json({
            message: 'Imágenes obtenidas con éxito',
            imagenes
        });
    } catch (error) {
        console.error('Error al obtener imágenes:', error);
        res.status(500).json({ message: 'Error al obtener imágenes' });
    }
};