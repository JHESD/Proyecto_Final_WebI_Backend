const { DataTypes } = require('sequelize');
const sequelize = require('../db/db_confing');

const Imagen = sequelize.define('Imagen', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_imagen'
    },
    url_imagen: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'url_imagen'
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
    tableName: 'imagen',
    timestamps: false,
});


module.exports = Imagen;
