const { DataTypes } = require('sequelize');
const sequelize = require('../db/db_confing');
const Usuario = require('./user_model');

const Negocio = sequelize.define('Negocio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_negocio'
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'nombre'
    },
    direccion: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'direccion'
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuario',
            key: 'id_usuario'
        }
    }
}, {
    tableName: 'negocio',
    timestamps: false,
});

// Relaciones
Negocio.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Usuario.hasOne(Negocio, { foreignKey: 'usuario_id' });

module.exports = Negocio;