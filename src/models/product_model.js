const { DataTypes } = require('sequelize');
const sequelize = require('../db/db_confing');
const Categoria = require('./categorie_model');
const Business = require('./business_model');
const Imagen = require('./image_model');

const Producto = sequelize.define('Producto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_producto'
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'nombre'
    },
    descripcion: {
        type: DataTypes.TEXT,
        field: 'descripcion'
    },
    precio: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        field: 'precio'
    },
    categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categoria',
            key: 'id_categoria'
        }
    },
    negocio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'negocio',
            key: 'id_negocio'
        }
    },
    activo: { // Nuevo campo
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'activo'
    }
}, {
    tableName: 'producto',
    timestamps: false,
});

// Asociación con Imagen
Producto.hasMany(Imagen, {
    foreignKey: 'producto_id',
    sourceKey: 'id',
    as: 'imagenes', // Alias para acceder a las imágenes relacionadas
});

Imagen.belongsTo(Producto, {
    foreignKey: 'producto_id',
    targetKey: 'id',
});

module.exports = Producto;