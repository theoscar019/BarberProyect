require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('¡Conectado a la base de datos en Neon!'))
  .catch(err => console.error('Error de conexión:', err.stack));

// 1. LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const query = 'SELECT * FROM usuarios WHERE email = $1 AND password = $2';
    const result = await pool.query(query, [email, password]);

    if (result.rows.length > 0) {
      const usuario = result.rows[0];
      res.status(200).json({ 
        message: "Login exitoso", 
        usuario: { 
          id: usuario.id, // Guardamos el ID para usarlo al agendar
          nombre: usuario.nombre, 
          rol: Number(usuario.rol_id) 
        } 
      });
    } else {
      res.status(401).json({ message: "Correo o contraseña incorrectos" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// 2. REGISTRO
app.post('/api/usuarios', async (req, res) => {
  const { nombre, email, password, rol_id } = req.body;
  try {
    const query = 'INSERT INTO usuarios (nombre, email, password, rol_id) VALUES ($1, $2, $3, $4) RETURNING *;';
    const values = [nombre, email, password, rol_id || 1]; 
    const result = await pool.query(query, values);
    res.status(201).json({ message: "Usuario registrado", usuario: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error interno al registrar" });
  }
});

// 3. CONSULTAR HORAS OCUPADAS EN UNA FECHA
app.get('/api/reservas/ocupadas', async (req, res) => {
  const { fecha } = req.query; // Recibe formato YYYY-MM-DD
  
  try {
    // Extraemos solo la hora (ej: 10:00) de la columna fecha_hora (timestamp)
    const query = `
      SELECT TO_CHAR(fecha_hora, 'HH24:MI') as hora 
      FROM reservas 
      WHERE DATE(fecha_hora) = $1
    `;
    const result = await pool.query(query, [fecha]);
    
    // Devolvemos un arreglo: ['10:00', '12:30']
    const horasOcupadas = result.rows.map(row => row.hora);
    res.status(200).json(horasOcupadas);
  } catch (error) {
    console.error("Error consultando horas:", error);
    res.status(500).json({ message: "Error interno" });
  }
});

// 4. GUARDAR NUEVA RESERVA
app.post('/api/reservas', async (req, res) => {
  // Recibimos fecha y hora por separado del frontend, las juntamos aquí
  const { cliente_id, barbero_id, servicio_id, fecha, hora } = req.body;
  const fechaHora = `${fecha} ${hora}:00`; 

  try {
    const query = `
      INSERT INTO reservas (cliente_id, barbero_id, servicio_id, fecha_hora, estado) 
      VALUES ($1, $2, $3, $4, 'Pendiente') 
      RETURNING *;
    `;
    // Enviamos un 1 temporalmente en barbero_id y servicio_id si no los tienes dinámicos aún
    const result = await pool.query(query, [cliente_id, barbero_id || 1, servicio_id || 1, fechaHora]);

    res.status(201).json({ message: "Reserva exitosa", reserva: result.rows[0] });
  } catch (error) {
    console.error("Error creando reserva:", error);
    res.status(500).json({ message: "Error al guardar reserva" });
  }
});

app.listen(port, () => console.log(`Backend corriendo en el puerto ${port}`));