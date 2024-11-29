const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Usuario = require('../models/user_model');
const Negocio = require('../models/business_model');
const sequelize = require('../db/db_confing');
const secretKey = '1234';


const verificarCorreoOUsuario = async (usuario_correo) => {
    return await Usuario.findOne({
        where: { usuario_correo },
    });
};

const createUser = async (req, res) => {
    try {
        const { nombre_completo, usuario_correo, contrasena, nit, direccion } = req.body;

        if (!nombre_completo || !usuario_correo || !contrasena || !nit || !direccion) {
            return res.status(400).json({ message: 'Faltan datos obligatorios.' });
        }

        const existingUser = await verificarCorreoOUsuario(usuario_correo);
        if (existingUser) {
            return res.status(400).json({ message: 'El correo ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(contrasena, 10);

        const newUser = await Usuario.create({
            nombre_completo,
            usuario_correo,
            contrasena: hashedPassword,
            nit,
            direccion,
        });

        res.status(201).json({
            message: 'Usuario creado exitosamente.',
            user: {
                id: newUser.id_usuario,
                nombre_completo: newUser.nombre_completo,
                usuario_correo: newUser.usuario_correo,
                nit: newUser.nit,
                direccion: newUser.direccion,
            },
        });
    } catch (error) {
        console.error('Error en createUser:', error);
        res.status(500).json({ message: 'Error al crear el usuario.', error: error.message });
    }
};

const crearUsuarioAdmin = async (req, res) => {
    const {
        nombre_completo,
        usuario_correo,
        contrasena,
        direccion,
        nombre_negocio,
        direccion_negocio,
    } = req.body;

    try {
        const existeUsuario = await verificarCorreoOUsuario(usuario_correo);
        if (existeUsuario) {
            return res.status(400).json({
                message: 'El correo ya está registrado.',
            });
        }

        const transaction = await sequelize.transaction();

        try {
            const nuevoUsuario = await Usuario.create(
                {
                    nombre_completo,
                    usuario_correo,
                    contrasena: await bcrypt.hash(contrasena, 10),
                    direccion,
                    es_administrador: true,
                },
                { transaction }
            );

            const nuevoNegocio = await Negocio.create(
                {
                    nombre: nombre_negocio,
                    direccion: direccion_negocio,
                    usuario_id: nuevoUsuario.id_usuario || nuevoUsuario.id,
                },
                { transaction }
            );

            await transaction.commit();

            return res.status(201).json({
                message: 'Usuario administrador y negocio creados con éxito.',
                usuario: nuevoUsuario,
                negocio: nuevoNegocio,
            });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error al crear usuario administrador:', error);
        return res.status(500).json({
            message: 'Ocurrió un error al registrar el usuario administrador.',
            error: error.message,
        });
    }
};

const login = async (req, res) => {
    const { usuario_correo, contrasena } = req.body;

    try {
        // Verificar si el correo existe
        const usuario = await Usuario.findOne({ where: { usuario_correo } });

        if (!usuario) {
            return res.status(404).json({
                message: 'El correo no está registrado.',
            });
        }

        // Verificar la contraseña
        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!contrasenaValida) {
            return res.status(401).json({
                message: 'Contraseña incorrecta.',
            });
        }

        // Verificar si es administrador y obtener el negocio asociado
        let negocioId = null;
        if (usuario.es_administrador) {
            const negocio = await Negocio.findOne({ where: { usuario_id: usuario.id } });
            if (negocio) {
                negocioId = negocio.id;
            }
        }

        // Generar el token JWT
        const token = jwt.sign(
            { 
                id: usuario.id, 
                esAdmin: usuario.es_administrador 
            },
            secretKey, 
            { expiresIn: '1h' } // El token expirará en 1 hora
        );

        // Devolver respuesta con token y detalles del usuario
        return res.status(200).json({
            message: 'Login exitoso.',
            token, // Incluir el token en la respuesta
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre_completo,
                correo: usuario.usuario_correo,
                esAdmin: usuario.es_administrador,
                negocioId, // Incluir el ID del negocio si existe
            },
        });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            message: 'Ocurrió un error en el servidor.',
            error: error.message,
        });
    }
};


module.exports = {
    createUser,
    crearUsuarioAdmin,
    login
};
