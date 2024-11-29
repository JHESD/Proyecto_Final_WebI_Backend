const Producto = require('../models/product_model');
const Categoria = require('../models/categorie_model');
const Business = require('../models/business_model');
const Imagen = require('../models/image_model');
const { validationResult } = require('express-validator');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Crear un nuevo producto
const crearProducto = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, descripcion, precio, categoria_id, negocio_id } = req.body;

        // Verificar existencia de categoría y negocio
        const categoria = await Categoria.findByPk(categoria_id);
        const negocio = await Business.findByPk(negocio_id);
        if (!categoria || !negocio) {
            return res.status(404).json({
                message: categoria ? 'Negocio no encontrado.' : 'Categoría no encontrada.',
            });
        }

        const producto = await Producto.create({
            nombre,
            descripcion,
            precio,
            categoria_id,
            negocio_id,
        });

        if (req.files && req.files.imagenes) {
            const imagenes = Array.isArray(req.files.imagenes)
                ? req.files.imagenes
                : [req.files.imagenes];

            const imagenesGuardadas = [];

            for (const imagen of imagenes) {
                const archivoPath = path.join(process.env.UPLOADS_PATH, imagen.name);

                // Verificar que la carpeta exista
                if (!fs.existsSync(process.env.UPLOADS_PATH)) {
                    fs.mkdirSync(process.env.UPLOADS_PATH, { recursive: true });
                }

                // Mover el archivo al directorio definido en .env
                await imagen.mv(archivoPath);

                // Guardar solo la parte relativa para facilitar el acceso
                const relativePath = `/uploads/${imagen.name}`;

                const nuevaImagen = await Imagen.create({
                    url_imagen: relativePath,
                    producto_id: producto.id,
                });

                imagenesGuardadas.push(nuevaImagen);
            }

            return res.status(201).json({
                message: 'Producto creado con éxito.',
                producto,
                imagenes: imagenesGuardadas,
            });
        }

        res.status(201).json({
            message: 'Producto creado con éxito.',
            producto,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el producto.' });
    }
};

const filtrarProductosPorCategoria = async (req, res) => {
    const { categoriaId } = req.params; // Obtener el ID de la categoría desde los parámetros de la URL

    try {
        const productos = await Producto.findAll({
            where: { 
                activo: true, // Solo productos activos
                categoria_id: categoriaId, // Filtrar por categoría
            },
            include: [
                {
                    model: Categoria,
                    attributes: ['id', 'nombre'],
                },
                {
                    model: Business,
                    attributes: ['id', 'nombre'],
                },
                {
                    model: Imagen,
                    attributes: ['id', 'url_imagen'],
                }
            ],
        });

        // Validar si no hay productos en la categoría especificada
        if (productos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron productos para esta categoría' });
        }

        res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al filtrar los productos por categoría' });
    }
};

// Ver todos los productos
const verTodosLosProductos = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            where: { activo: true }, // Solo productos activos
            include: [
                {
                    model: Categoria,
                    attributes: ['id', 'nombre'],
                },
                {
                    model: Business,
                    attributes: ['id', 'nombre'],
                },
                {
                    model: Imagen,
                    attributes: ['id', 'url_imagen'],
                }
            ],
        });       

        res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los productos' });
    }
};

// Ver productos por negocio
const verProductosPorNegocio = async (req, res) => {
    const { negocioId } = req.params;

    try {
        // Buscar los productos del negocio específico
        const productos = await Producto.findAll({
            where: { negocio_id: negocioId, activo: true }, // Solo activos
            include: [
                {
                    model: Categoria,
                    attributes: ['id', 'nombre'],
                },
                {
                    model: Imagen,
                    as: 'imagenes', // Usar el alias definido en el modelo
                    attributes: ['id', 'url_imagen'],
                },
            ],
        });

        if (productos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron productos para este negocio' });
        }

        res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los productos del negocio' });
    }
};

// Ver producto por ID
const verProductoPorId = async (req, res) => {
    const { productId } = req.params;

    try {
        // Buscar el producto por ID
        const producto = await Producto.findByPk(productId, {
            include: [
                {
                    model: Categoria,
                    attributes: ['id', 'nombre'],
                },
                {
                    model: Business,
                    attributes: ['id', 'nombre'],
                },
                {
                    model: Imagen,
                    attributes: ['id', 'url_imagen'],
                },
            ],
        });

        if (!producto || !producto.activo) {
            return res.status(404).json({ message: 'Producto no encontrado o está inactivo' });
        }

        res.status(200).json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el producto' });
    }
};

const editarProducto = async (req, res) => {
    const { productId } = req.params; // Asegúrate de usar el nombre correcto
    try {
        // Buscar el producto por ID
        const producto = await Producto.findByPk(productId);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Actualizar el producto (el resto del código sigue igual)
        const { nombre, descripcion, precio, categoria_id, negocio_id } = req.body;

        // Verificar que la categoría y el negocio existan si se proporcionan
        if (categoria_id) {
            const categoria = await Categoria.findByPk(categoria_id);
            if (!categoria) {
                return res.status(404).json({ message: 'Categoría no encontrada' });
            }
        }

        if (negocio_id) {
            const negocio = await Business.findByPk(negocio_id);
            if (!negocio) {
                return res.status(404).json({ message: 'Negocio no encontrado' });
            }
        }

        await producto.update({
            nombre: nombre || producto.nombre,
            descripcion: descripcion || producto.descripcion,
            precio: precio || producto.precio,
            categoria_id: categoria_id || producto.categoria_id,
            negocio_id: negocio_id || producto.negocio_id
        });

        res.status(200).json({
            message: 'Producto actualizado con éxito',
            producto
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el producto' });
    }
};

const desactivarProducto = async (req, res) => {
    const { productId } = req.params;
    try {
        const producto = await Producto.findByPk(productId);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Desactivar el producto
        producto.activo = false;
        await producto.save();

        res.status(200).json({ message: 'Producto desactivado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al desactivar el producto' });
    }
};


module.exports = {
    crearProducto,
    verTodosLosProductos,
    filtrarProductosPorCategoria,
    verProductosPorNegocio,
    verProductoPorId,
    editarProducto,
    desactivarProducto
};