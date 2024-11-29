const { DataTypes } = require('sequelize');
const sequelize = require('../db/db_confing');

const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_usuario'
    },
    nombre_completo: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'nombre_completo'
    },
    usuario_correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'usuario_correo'
    },
    contrasena: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'contrasena'
    },
    nit: {
        type: DataTypes.STRING,
        unique: true,
        field: 'nit'
    },
    direccion: {
        type: DataTypes.STRING,
        field: 'direccion'
    },
    es_administrador: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'es_administrador'
    }
}, {
    tableName: 'usuario',
    timestamps: false,
});

module.exports = Usuario;