require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Conexión a la base de datos PostgreSQL en Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

pool.connect()
  .then(() => console.log('¡Conectado a la base de datos en Neon exitosamente!'))
  .catch(err => console.error('Error de conexión a la BD:', err.stack));

// 1. RUTA DE LOGIN REAL CON POSTGRESQL
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = 'SELECT * FROM usuarios WHERE email = $1 AND password = $2';
    const result = await pool.query(query, [email, password]);

    if (result.rows.length > 0) {
      const usuario = result.rows[0];
      res.status(200).json({ 
        message: "Login exitoso", 
        usuario: { nombre: usuario.nombre, rol: usuario.rol_id } 
      });
    } else {
      res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// 2. RUTA PARA REGISTRAR NUEVOS USUARIOS (Ajustada a la tabla 'usuarios' con 'rol_id')
app.post('/api/usuarios', async (req, res) => {
  const { nombre, email, password, rol_id } = req.body;

  try {
    const query = `
      INSERT INTO usuarios (nombre, email, password, rol_id) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *;
    `;
    const values = [nombre, email, password, rol_id || 1]; // Por defecto 1 o cliente según prefieras
    const result = await pool.query(query, values);

    res.status(201).json({ 
      message: "Usuario registrado con éxito", 
      usuario: result.rows[0] 
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "Error interno al registrar el usuario" });
  }
});

// 3. RUTA PARA EL ADMINVIEW (Obtener Citas)
app.get('/api/admin/citas', async (req, res) => {
  try {
    const query = 'SELECT id_cita, cliente_nombre, barbero_nombre, fecha, servicio, estado FROM citas ORDER BY fecha DESC';
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.status(500).json({ message: "Error al obtener citas" });
  }
});

app.listen(port, () => {
  console.log(`Servidor Backend corriendo en el puerto ${port}`);
});