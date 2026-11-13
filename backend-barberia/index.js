require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuración de correo para recordatorios/confirmaciones
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tu_correo_barberia@gmail.com', // REEMPLAZA CON TU CORREO
    pass: 'tus_16_letras_de_app_password' // REEMPLAZA CON TU CONTRASEÑA DE APLICACIÓN
  }
});

// Conexión a la base de datos PostgreSQL en Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('¡Conectado a Neon!'))
  .catch(err => console.error('Error de conexión a la BD:', err.stack));

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
        usuario: { id: usuario.id, nombre: usuario.nombre, rol: Number(usuario.rol_id) } 
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
    res.status(500).json({ message: "Error al registrar" });
  }
});

// 3. OBTENER LISTA DE BARBEROS (rol_id = 2)
app.get('/api/barberos', async (req, res) => {
  try {
    const query = 'SELECT id, nombre FROM usuarios WHERE rol_id = 2';
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al cargar barberos" });
  }
});

// 4. OBTENER HORAS OCUPADAS
app.get('/api/reservas/ocupadas', async (req, res) => {
  const { fecha } = req.query; 
  try {
    const query = `SELECT TO_CHAR(fecha_hora, 'HH24:MI') as hora FROM reservas WHERE DATE(fecha_hora) = $1`;
    const result = await pool.query(query, [fecha]);
    const horasOcupadas = result.rows.map(row => row.hora);
    res.status(200).json(horasOcupadas);
  } catch (error) {
    res.status(500).json({ message: "Error al consultar horas" });
  }
});

// 5. GUARDAR RESERVA Y ENVIAR CORREO
app.post('/api/reservas', async (req, res) => {
  const { cliente_id, barbero_id, servicio_id, fecha, hora } = req.body;
  const fechaHora = `${fecha} ${hora}:00`; 

  try {
    const query = `
      INSERT INTO reservas (cliente_id, barbero_id, servicio_id, fecha_hora, estado) 
      VALUES ($1, $2, $3, $4, 'Pendiente') RETURNING *;
    `;
    const result = await pool.query(query, [cliente_id, barbero_id, servicio_id || 1, fechaHora]);

    // Enviar correo de confirmación
    const userQuery = 'SELECT nombre, email FROM usuarios WHERE id = $1';
    const userResult = await pool.query(userQuery, [cliente_id]);

    if (userResult.rows.length > 0) {
      const cliente = userResult.rows[0];
      const mailOptions = {
        from: 'tu_correo_barberia@gmail.com', // REEMPLAZA CON TU CORREO
        to: cliente.email,
        subject: '💈 Confirmación de tu reserva - Barber Shop',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #111; color: #fff; border-radius: 8px;">
            <h2 style="color: #C8A951;">💈 Confirmación de Reserva</h2>
            <p>Hola <strong>${cliente.nombre}</strong>,</p>
            <p>Tu reserva ha sido confirmada con éxito.</p>
            <ul style="list-style: none; padding: 0;">
              <li>📅 <strong>Fecha:</strong> ${fecha}</li>
              <li>⏰ <strong>Hora:</strong> ${hora}</li>
            </ul>
            <p>¡Te esperamos!</p>
          </div>
        `
      };
      transporter.sendMail(mailOptions, (error) => {
        if (error) console.error("Error enviando correo:", error);
      });
    }

    res.status(201).json({ message: "Reserva exitosa", reserva: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error al guardar reserva" });
  }
});

app.listen(port, () => console.log(`Backend corriendo en el puerto ${port}`));