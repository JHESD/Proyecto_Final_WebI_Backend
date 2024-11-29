const express = require('express');
const cors = require('cors');
const usuarioRoutes = require('./src/routes/user_router');
const productRoutes = require('./src/routes/product_router');
const categorieRoutes = require('./src/routes/categorie_router');
const imagenRouter = require('./src/routes/image_router');
const carritoRouter = require('./src/routes/carrito_route');
const sequelize = require('./src/db/db_confing');

require('dotenv').config();
require('./src/models/associations/associations_product');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Registrar las rutas de usuario, productos, categorías e imágenes
app.use('/usuario', usuarioRoutes);
app.use('/product', productRoutes);
app.use('/categorias', categorieRoutes);
app.use('/image', imagenRouter);
app.use('/car',carritoRouter);


// Servir archivos estáticos desde el directorio de uploads
const uploadDirectory = process.env.UPLOADS_PATH || 'uploads';
app.use('/uploads', express.static(uploadDirectory));

// Ruta raíz (opcional)
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a la API' });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
});
const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Modelos sincronizados con la base de datos');
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error al sincronizar la base de datos:', err.message);
    });

    sequelize.authenticate()
    .then(() => console.log('Conexión exitosa con la base de datos'))
    .catch((err) => console.error('Error al conectar con la base de datos:', err));