const Producto = require('../product_model');
const Imagen = require('../image_model');
const Categoria = require('../categorie_model');
const Business = require('../business_model');

// Relaciones Producto - Categoria
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id' });
Categoria.hasMany(Producto, { foreignKey: 'categoria_id' });

// Relaciones Producto - Negocio
Producto.belongsTo(Business, { foreignKey: 'negocio_id' });
Business.hasMany(Producto, { foreignKey: 'negocio_id' });

// Relaciones Producto - Imagen
Producto.hasMany(Imagen, { foreignKey: 'producto_id' });
Imagen.belongsTo(Producto, { foreignKey: 'producto_id' });

module.exports = { Producto, Imagen, Categoria, Business };
