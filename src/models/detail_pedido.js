const { DataTypes } = require('sequelize');
const sequelize = require('../db/db_confing');
const Pedido = require('./pedido_model');
const Producto = require('./product_model');

const DetallePedido = sequelize.define('DetallePedido', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_det_pedido'
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'cantidad'
    },
    precio_unitario: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        field: 'precio_unitario'
    },
    subtotal: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        field: 'subtotal'
    },
    pedido_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'pedido',
            key: 'id_pedido'
        }
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'producto',
            key: 'id_producto'
        }
    }
}, {
    tableName: 'detalle_pedido',
    timestamps: false,
});

// Relaciones
DetallePedido.belongsTo(Pedido, { foreignKey: 'pedido_id' });
Pedido.hasMany(DetallePedido, { foreignKey: 'pedido_id' });

DetallePedido.belongsTo(Producto, { foreignKey: 'producto_id' });
Producto.hasMany(DetallePedido, { foreignKey: 'producto_id' });

module.exports = DetallePedido;
