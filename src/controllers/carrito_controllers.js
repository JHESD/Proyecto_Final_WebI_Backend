const Pedido = require('../models/pedido_model');
const DetallePedido = require('../models/detail_pedido');
const Producto = require('../models/product_model');
const Usuario = require('../models/user_model');

// |Controller Carito |
const addToCart = async (req, res) => {
    const { usuarioId } = req.params; // Id del usuario
    const { productoId, cantidad = 1 } = req.body;

    try {
        // Buscar o crear el pedido "En Proceso" para el usuario
        let pedido = await Pedido.findOne({
            where: { cliente_id: usuarioId, estado: 'En Proceso' },
        });

        if (!pedido) {
            pedido = await Pedido.create({
                cliente_id: usuarioId,
                fecha: new Date(),
                total: 0, // Se recalculará después
            });
        }

        // Verificar si el producto ya está en el detalle del pedido
        let detalle = await DetallePedido.findOne({
            where: { pedido_id: pedido.id, producto_id: productoId },
        });

        if (detalle) {
            // Si ya está, sumar la cantidad
            detalle.cantidad += cantidad;
            detalle.subtotal = detalle.cantidad * detalle.precio_unitario; // Recalcular subtotal
            await detalle.save();
        } else {
            // Si no está, agregarlo como nuevo
            const producto = await Producto.findByPk(productoId);
            if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

            await DetallePedido.create({
                pedido_id: pedido.id,
                producto_id: productoId,
                cantidad,
                precio_unitario: producto.precio,
                subtotal: producto.precio * cantidad,
            });
        }

        // Recalcular el total del pedido
        const detalles = await DetallePedido.findAll({ where: { pedido_id: pedido.id } });
        const total = detalles.reduce((sum, det) => sum + det.subtotal, 0);
        pedido.total = total;
        await pedido.save();

        res.status(200).json({ message: 'Producto agregado al carrito', pedido });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al agregar producto al carrito', error });
    }
};

const getCart = async (req, res) => {
    const { usuarioId } = req.params;

    try {
        const pedido = await Pedido.findOne({
            where: { cliente_id: usuarioId, estado: 'En Proceso' },
            include: {
                model: DetallePedido,
                include: {
                    model: Producto,
                    attributes: ['nombre', 'precio'],
                },
            },
        });

        if (!pedido || pedido.DetallePedidos.length === 0) {
            return res.status(404).json({ message: 'El carrito está vacío' });
        }

        const productos = pedido.DetallePedidos.map((detalle) => ({
            id: detalle.producto_id,
            nombre: detalle.Producto.nombre,
            precio: detalle.Producto.precio,
            cantidad: detalle.cantidad,
            subtotal: detalle.subtotal,
        }));

        res.status(200).json({
            pedidoId: pedido.id,
            productos,
            total: pedido.total,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el carrito', error });
    }
};

const updateCartItem = async (req, res) => {
    const { pedidoId, productoId } = req.params;
    const { cantidad } = req.body;

    try {
        const detalle = await DetallePedido.findOne({
            where: { pedido_id: pedidoId, producto_id: productoId },
        });

        if (!detalle) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        // Actualizar cantidad y subtotal
        detalle.cantidad = cantidad;
        detalle.subtotal = cantidad * detalle.precio_unitario;
        await detalle.save();

        // Recalcular el total del pedido
        const pedido = await Pedido.findByPk(pedidoId, {
            include: { model: DetallePedido },
        });
        pedido.total = pedido.DetallePedidos.reduce((sum, det) => sum + det.subtotal, 0);
        await pedido.save();

        res.status(200).json({ message: 'Cantidad actualizada', pedido });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el producto', error });
    }
};

const removeCartItem = async (req, res) => {
    const { pedidoId, productoId } = req.params;

    try {
        const detalle = await DetallePedido.findOne({
            where: { pedido_id: pedidoId, producto_id: productoId },
        });

        if (!detalle) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        await detalle.destroy();

        // Recalcular el total del pedido
        const pedido = await Pedido.findByPk(pedidoId, {
            include: { model: DetallePedido },
        });
        pedido.total = pedido.DetallePedidos.reduce((sum, det) => sum + det.subtotal, 0);
        await pedido.save();

        res.status(200).json({ message: 'Producto eliminado del carrito', pedido });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el producto', error });
    }
};

const confirmPurchase = async (req, res) => {
    const { usuarioId } = req.params; // ID del usuario que realiza la compra

    try {
        // Buscar el pedido en estado "En Proceso" del usuario
        const pedido = await Pedido.findOne({
            where: { cliente_id: usuarioId, estado: 'En Proceso' },
        });

        if (!pedido) {
            return res.status(404).json({ message: 'No hay un pedido en proceso para confirmar' });
        }

        // Cambiar el estado del pedido a "Pagado"
        pedido.estado = 'Pagado';
        await pedido.save();

        res.status(200).json({ message: 'Compra finalizada.', pedido });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al confirmar la compra', error });
    }
};

//
const registrarPedido = async (req, res) => {
    try {
        const { clienteId, productos, direccionEntrega } = req.body;

        // Validar si el cliente está autenticado
        if (!req.user || req.user.id !== clienteId) {
            return res.status(401).json({ mensaje: "Usuario no autenticado." });
        }

        // Calcular el total del pedido
        let total = 0;
        const detalles = await Promise.all(productos.map(async (prod) => {
            const producto = await Producto.findByPk(prod.productoId);
            if (!producto || !producto.activo) {
                throw new Error(`Producto con ID ${prod.productoId} no está disponible.`);
            }

            const subtotal = producto.precio * prod.cantidad;
            total += subtotal;

            return {
                producto_id: prod.productoId,
                cantidad: prod.cantidad,
                precio_unitario: producto.precio,
                subtotal
            };
        }));

        // Crear el pedido
        const pedido = await Pedido.create({
            fecha: new Date(),
            total,
            direccion_entrega: direccionEntrega || req.user.direccion,
            cliente_id: clienteId
        });

        // Crear los detalles del pedido
        await DetallePedido.bulkCreate(
            detalles.map((detalle) => ({ ...detalle, pedido_id: pedido.id }))
        );

        return res.status(201).json({ mensaje: "Pedido registrado exitosamente.", pedido });
    } catch (error) {
        return res.status(500).json({ mensaje: "Error al registrar el pedido.", error: error.message });
    }
};

const listarPedidosCliente = async (req, res) => {
    try {
        const clienteId = req.user.id; // Obtenemos el ID del cliente autenticado.

        const pedidos = await Pedido.findAll({
            where: { cliente_id: clienteId },
            include: [
                {
                    model: DetallePedido,
                    include: [{ model: Producto }]
                }
            ],
            order: [['fecha', 'DESC']]
        });

        return res.status(200).json(pedidos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al listar los pedidos.', error: error.message });
    }
};


const listarPedidosAdministrador = async (req, res) => {
    try {
        if (!req.user || !req.user.es_administrador) {
            return res.status(403).json({ mensaje: 'No tienes permisos para acceder a esta funcionalidad.' });
        }

        const pedidos = await Pedido.findAll({
            include: [
                {
                    model: Usuario,
                    attributes: ['nombre_completo', 'usuario_correo'],
                },
                {
                    model: DetallePedido,
                    include: [{ model: Producto }],
                },
            ],
            order: [['fecha', 'DESC']],
        });

        return res.status(200).json(pedidos);
    } catch (error) {
        console.error('Error al listar los pedidos del administrador:', error);
        return res.status(500).json({ mensaje: 'Error al listar los pedidos.', error: error.message });
    }
};


module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    confirmPurchase,
    registrarPedido,
    listarPedidosCliente,
    listarPedidosAdministrador,
};