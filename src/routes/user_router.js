const express = require('express');
const router = express.Router();
const { createUser, crearUsuarioAdmin,login } = require('../controllers/user_controllers');

// Ruta para crear un usuario regular
router.post('/usr', createUser);

// Ruta para crear un usuario administrador con negocio
router.post('/adm', crearUsuarioAdmin);

router.post('/login', login);

module.exports = router;
