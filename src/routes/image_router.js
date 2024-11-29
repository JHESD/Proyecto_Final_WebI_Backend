const express = require('express');
const router = express.Router();
const imagenController = require('../controllers/image_controllers');
const multer = require('multer');
const path = require('path');

// Configurar multer para manejo de archivos
const uploadDirectory = process.env.UPLOADS_PATH || 'uploads';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage:storage });

// Crear imágenes
router.post('/', upload.single('imagenes'), imagenController.createImagenes);

// Obtener imágenes por producto
router.get('/prd/:productoId', imagenController.getImagenesByProductoId);

module.exports = router;