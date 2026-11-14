require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// CONFIGURACIÓN DE CORREO (NODEMAILER)
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'barberproyect4@gmail.com',
    pass: 'AQUÍ_VA_TU_CONTRASEÑA_DE_16_CARACTERES' // Acuérdate de pegar tu clave real aquí sin espacios
  }
});

// ==========================================
// CONEXIÓN A BASE DE DATOS RELACIONAL (NEON)
// ==========================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('¡Conectado a la base de datos en Neon exitosamente!'))
  .catch(err => console.error('Error de conexión a la BD Neon:', err.stack));

// ==========================================
// CONEXIÓN A BASE DE DATOS NOSQL (MONGODB)
// ==========================================
const MONGO_URI = 'mongodb+srv://theoscar019_db_user:ofv9MFtCm3Fj6Vy7@cluster0.prjs4rz.mongodb.net/barberia';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB (Base de datos NoSQL para IA)'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Esquema para guardar los resultados de la IA
const escaneoSchema = new mongoose.Schema({
  id_cliente: { type: Number, required: true },
  fecha_escaneo: { type: Date, default: Date.now },
  analisis_visagismo: {
    forma_rostro: { type: String, required: true },
    corte_ideal: { type: String, required: true },
    tips: { type: String },
    debug_LA: { type: Number },
    debug_PM: { type: Number }
  }
});
const Escaneo = mongoose.model('Escaneo', escaneoSchema);

// ==========================================
// RUTAS DE LA API
// ==========================================

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
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// 2. REGISTRO DE USUARIOS
app.post('/api/usuarios', async (req, res) => {
  const { nombre, email, password, rol_id } = req.body;
  try {
    const query = 'INSERT INTO usuarios (nombre, email, password, rol_id) VALUES ($1, $2, $3, $4) RETURNING *;';
    const values = [nombre, email, password, rol_id || 1]; 
    const result = await pool.query(query, values);
    res.status(201).json({ message: "Usuario registrado", usuario: result.rows[0] });
  } catch (error) {
    console.error("Error al registrar:", error);
    res.status(500).json({ message: "Error al registrar" });
  }
});

// 3. OBTENER LISTA DE BARBEROS (Usuarios con rol_id = 2)
app.get('/api/barberos', async (req, res) => {
  try {
    const query = 'SELECT id, nombre FROM usuarios WHERE rol_id = 2';
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error cargando barberos:", error);
    res.status(500).json({ message: "Error al cargar barberos" });
  }
});

// 4. OBTENER HORAS OCUPADAS EN UNA FECHA (Libera las horas si el cliente no asiste o cancela)
app.get('/api/reservas/ocupadas', async (req, res) => {
  const { fecha } = req.query; 
  try {
    const query = `
      SELECT TO_CHAR(fecha_hora, 'HH24:MI') as hora 
      FROM reservas 
      WHERE DATE(fecha_hora) = $1 AND estado NOT IN ('No asiste', 'Cancelada')
    `;
    const result = await pool.query(query, [fecha]);
    const horasOcupadas = result.rows.map(row => row.hora);
    res.status(200).json(horasOcupadas);
  } catch (error) {
    console.error("Error consultando horas:", error);
    res.status(500).json({ message: "Error al consultar horas" });
  }
});

// 5. GUARDAR NUEVA RESERVA Y ENVIAR CORREO
app.post('/api/reservas', async (req, res) => {
  const { cliente_id, barbero_id, servicio_id, fecha, hora } = req.body;
  const fechaHora = `${fecha} ${hora}:00`; 

  try {
    const query = `
      INSERT INTO reservas (cliente_id, barbero_id, servicio_id, fecha_hora, estado) 
      VALUES ($1, $2, $3, $4, 'Pendiente') RETURNING *;
    `;
    const result = await pool.query(query, [cliente_id, barbero_id, servicio_id || 1, fechaHora]);

    const userQuery = 'SELECT nombre, email FROM usuarios WHERE id = $1';
    const userResult = await pool.query(userQuery, [cliente_id]);

    if (userResult.rows.length > 0) {
      const cliente = userResult.rows[0];
      const mailOptions = {
        from: 'barberproyect4@gmail.com',
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
      
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error enviando correo:", error);
        } else {
          console.log("Correo enviado exitosamente: " + info.response);
        }
      });
    }

    res.status(201).json({ message: "Reserva exitosa", reserva: result.rows[0] });
  } catch (error) {
    console.error("Error al guardar reserva:", error);
    res.status(500).json({ message: "Error al guardar reserva" });
  }
});

// 6. OBTENER LAS CITAS DE UN BARBERO ESPECÍFICO (Trae las pendientes + las completadas de hoy para la comisión)
app.get('/api/reservas/barbero/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT r.id, r.fecha_hora, r.estado, u.nombre AS cliente_nombre, r.servicio_id
      FROM reservas r
      JOIN usuarios u ON r.cliente_id = u.id
      WHERE r.barbero_id = $1 
        AND (
          r.estado = 'Pendiente' 
          OR (r.estado = 'Completada' AND DATE(r.fecha_hora) = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago')::date)
        )
      ORDER BY r.fecha_hora ASC;
    `;
    const result = await pool.query(query, [id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener citas del barbero:", error);
    res.status(500).json({ message: "Error al cargar citas" });
  }
});

// 7. OBTENER TODAS LAS CITAS (Para panel de Admin)
app.get('/api/admin/citas', async (req, res) => {
  try {
    const query = `
      SELECT r.id, u.nombre AS cliente_nombre, b.nombre AS barbero_nombre, r.fecha_hora, r.servicio_id, r.estado 
      FROM reservas r
      JOIN usuarios u ON r.cliente_id = u.id
      LEFT JOIN usuarios b ON r.barbero_id = b.id
      ORDER BY r.fecha_hora DESC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener todas las citas (Admin):", error);
    res.status(500).json({ message: "Error al obtener citas" });
  }
});

// 8. GUARDAR RESULTADO DE LA IA EN MONGODB (EVALUACIÓN 3)
app.post('/api/escaneos', async (req, res) => {
  try {
    const { id_cliente, analisis_visagismo } = req.body;
    const nuevoEscaneo = new Escaneo({ id_cliente, analisis_visagismo });
    await nuevoEscaneo.save();
    console.log("Nuevo escaneo guardado en Mongo para el cliente:", id_cliente);
    res.status(201).json({ message: 'Análisis de IA guardado exitosamente en MongoDB' });
  } catch (error) {
    console.error("Error al guardar escaneo en MongoDB:", error);
    res.status(500).json({ error: 'Error al guardar en MongoDB' });
  }
});

// 9. ACTUALIZAR ESTADO DE RESERVA (Completar / No asiste)
app.put('/api/reservas/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // Recibe 'Completada' o 'No asiste'
  try {
    const query = `
      UPDATE reservas 
      SET estado = $1 
      WHERE id = $2 
      RETURNING *;
    `;
    const result = await pool.query(query, [estado, id]);
    
    if (result.rows.length > 0) {
      res.status(200).json({ message: "Reserva actualizada con éxito", reserva: result.rows[0] });
    } else {
      res.status(404).json({ message: "Reserva no encontrada" });
    }
  } catch (error) {
    console.error("Error al actualizar la reserva:", error);
    res.status(500).json({ message: "Error interno al actualizar la reserva" });
  }
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(port, () => {
  console.log(`Servidor Backend corriendo en el puerto ${port}`);
});