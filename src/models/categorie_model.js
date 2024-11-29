const { DataTypes } = require('sequelize');
const sequelize = require('../db/db_confing');

const Categoria = sequelize.define('Categoria', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_categoria'
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'nombre'
    },
    descripcion: {
        type: DataTypes.TEXT,
        field: 'descripcion'
    }
}, {
    tableName: 'categoria',
    timestamps: false,
});

module.exports = Categoria;
