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
    // Consulta a la tabla usuarios (ajusta 'usuarios', 'correo', 'password' según el nombre real de tus columnas)
   const query = 'SELECT * FROM usuarios WHERE email = $1 AND password = $2';
    const result = await pool.query(query, [email, password]);

    if (result.rows.length > 0) {
      const usuario = result.rows[0];
      // Si el rol es 1 es admin, si es 2 es cliente (ajústalo según tu lógica)
      res.status(200).json({ 
        message: "Login exitoso", 
        usuario: { nombre: usuario.nombre, rol: usuario.rol } 
      });
    } else {
      res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// 2. RUTA PARA EL ADMINVIEW (Obtener Citas)
app.get('/api/admin/citas', async (req, res) => {
  try {
    // Aquí puedes hacer un JOIN si tienes las citas en una tabla y los nombres en otra
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

