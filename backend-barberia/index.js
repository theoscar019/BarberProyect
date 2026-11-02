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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en el puerto ${PORT}`);
});