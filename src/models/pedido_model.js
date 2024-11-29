const { DataTypes } = require('sequelize');
const sequelize = require('../db/db_confing');
const User = require('./user_model');

const Pedido = sequelize.define('Pedido', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_pedido'
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'fecha'
    },
    total: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        field: 'total'
    },
    direccion_entrega: {
        type: DataTypes.STRING,
        field: 'direccion_entrega'
    },
    cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuario',
            key: 'id_usuario'
        }
    },
    estado: {
        type: DataTypes.STRING,
        defaultValue: 'En Proceso',
        field: 'estado'
    }
}, {
    tableName: 'pedido',
    timestamps: false,
});

// Relaciones
Pedido.belongsTo(User, { foreignKey: 'cliente_id' });
User.hasMany(Pedido, { foreignKey: 'cliente_id' });

module.exports = Pedido;
