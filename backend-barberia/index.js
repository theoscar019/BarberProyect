require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Configurar la conexión a PostgreSQL (Neon)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Ruta principal por defecto
app.get('/', (req, res) => {
    res.send('¡Servidor Backend de la Barbería funcionando al 100%!');
});

// Ruta de prueba para verificar que la BD conectó bien
app.get('/api/test-db', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT current_database(), now()');
        res.json({ 
            estado: "Éxito", 
            mensaje: "¡Conectado a Neon exitosamente!", 
            datos: resultado.rows[0] 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Fallo la conexión a la Base de Datos" });
    }
});

// Ruta: Registro de Usuarios (Clientes)
app.post('/api/usuarios/registro', async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO usuarios (nombre, email, password, rol_id)
            VALUES ($1, $2, $3, 1)
            RETURNING id, nombre, email;
        `;
        const valores = [nombre, email, passwordEncriptada];
        
        const resultado = await pool.query(query, valores);

        res.status(201).json({
            mensaje: "Usuario registrado con éxito",
            usuario: resultado.rows[0]
        });

    } catch (error) {
        console.error("Error en registro:", error);
        res.status(400).json({ error: "Error al registrar. Es posible que el correo ya esté en uso." });
    }
});

// Ruta: Inicio de sesión (Login)
app.post('/api/usuarios/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar si el usuario existe
        const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (resultado.rows.length === 0) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }

        const usuario = resultado.rows[0];

        // 2. Comparar contraseñas
        const passwordValida = await bcrypt.compare(password, usuario.password);
        
        if (!passwordValida) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos" });
        }

        // 3. Responder con éxito
        res.json({
            mensaje: "Inicio de sesión exitoso",
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol_id: usuario.rol_id
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Levantar el servidor
// ==========================================
// RUTAS DEL MÓDULO BARBERO (Citas y Comisiones)
// ==========================================

// 1. Obtener agenda diaria del barbero (RF-05 / HU-09)
app.get('/api/reservas/barbero/:barberoId', async (req, res) => {
    const { barberoId } = req.params;
    try {
        const resultado = await pool.query(
            'SELECT * FROM reservas WHERE barbero_id = $1 ORDER BY hora ASC',
            [barberoId]
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener agenda:", error);
        res.status(500).json({ error: "Error al consultar las reservas del barbero" });
    }
});

// 2. Cambiar estado de la cita a 'Completada' o 'No asiste' (RF-06 / HU-10 y HU-13)
app.patch('/api/reservas/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const resultado = await pool.query(
            'UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );
        res.json({ mensaje: "Estado actualizado", reserva: resultado.rows[0] });
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        res.status(500).json({ error: "No se pudo actualizar el estado de la reserva" });
    }
});

// 3. Registrar bloqueo de horario / colación del barbero (HU-11)
app.post('/api/barberos/:barberoId/bloqueos', async (req, res) => {
    const { barberoId } = req.params;
    const { horaInicio, horaFin, motivo } = req.body;
    try {
        const resultado = await pool.query(
            `INSERT INTO reservas (barbero_id, cliente, servicio, hora, precio_base, estado)
             VALUES ($1, $2, 'Bloqueo Personal', $3, 0, 'Bloqueado') RETURNING *`,
            [barberoId, motivo, `${horaInicio} - ${horaFin}`]
        );
        res.status(201).json({ mensaje: "Horario bloqueado con éxito", bloqueo: resultado.rows[0] });
    } catch (error) {
        console.error("Error al bloquear horario:", error);
        res.status(500).json({ error: "No se pudo registrar el bloqueo" });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en el puerto ${PORT}`);
});