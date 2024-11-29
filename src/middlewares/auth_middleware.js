const jwt = require('jsonwebtoken');
const secretKey = '1234'; // Cambia esto por una clave fuerte y privada.

// Middleware para verificar la autenticación del usuario
const verificarAutenticacion = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('No se proporcionó un token.');
        return res.status(401).json({ mensaje: 'Usuario no autenticado.' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.log('Error al verificar el token:', err.message);
            return res.status(403).json({ mensaje: 'Token inválido o expirado.' });
        }

        console.log('Token decodificado:', decoded);
        req.user = decoded; // Guarda los datos decodificados del token en req.user
        next();
    });
};

// Función para generar un token
const generarToken = (usuario) => {
    const payload = {
        id: usuario.id,
        esAdmin: usuario.esAdmin, // Incluye el permiso de administrador en el token
    };
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

// Middleware para verificar permisos de administrador
const verificarAdministrador = (req, res, next) => {
    verificarAutenticacion(req, res, () => {
        console.log('Verificando permisos de administrador para:', req.user);
        if (!req.user.esAdmin) {
            console.log('El usuario no tiene permisos de administrador.');
            return res.status(403).json({ mensaje: 'No tienes permisos de administrador.' });
        }
        next();
    });
};

module.exports = { verificarAutenticacion, verificarAdministrador, generarToken };
