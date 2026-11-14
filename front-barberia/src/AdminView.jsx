import React, { useState, useEffect } from 'react';
import { Calendar, User, Scissors, CheckCircle, Clock, LogOut } from 'lucide-react';

export default function AdminView({ onLogout }) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://barberproyect.onrender.com/api'; 
  const PRECIO_CORTE = 10000; // Valor total del servicio para calcular ingresos

  // Traer las citas reales desde tu backend en Render
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/citas`);
        if (response.ok) {
          const data = await response.json();
          setCitas(data);
        } else {
          console.error("Error en la respuesta del servidor");
        }
      } catch (error) {
        console.error("Error obteniendo citas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, []);

  // Formatear la fecha_hora para que se vea bonita (ej: 13-11-2026 15:00)
  const formatearFechaHora = (fechaHoraIso) => {
    const fecha = new Date(fechaHoraIso);
    return fecha.toLocaleString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // CÁLCULOS DINÁMICOS
  // Filtrar solo las citas que están programadas para "hoy" (comparando fechas)
  const hoy = new Date().toLocaleDateString('es-CL');
  const citasHoy = citas.filter(cita => new Date(cita.fecha_hora).toLocaleDateString('es-CL') === hoy);
  
  // Sumar ingresos solo de las citas que el barbero ya marcó como 'Completada'
  const citasCompletadas = citas.filter(cita => cita.estado === 'Completada');
  const ingresosTotales = citasCompletadas.length * PRECIO_CORTE;

  return (
    <div style={{ padding: '20px', color: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: '#d4af37', margin: 0 }}>Panel de Control</h2>
          <p style={{ color: '#94a3b8', margin: '5px 0 0 0' }}>Administrador</p>
        </div>
        <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
          <LogOut size={24} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #d4af37' }}>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Citas Hoy</p>
          <h3 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>{citasHoy.length}</h3>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Ingresos Totales</p>
          <h3 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>${ingresosTotales.toLocaleString('es-CL')}</h3>
        </div>
      </div>

      <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '20px' }}>Agenda General (Todas las citas)</h3>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#d4af37' }}>Cargando citas reales...</p>
      ) : citas.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Aún no hay reservas registradas en el sistema.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {citas.map((cita) => (
            <div key={cita.id} style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <User size={16}/> Cliente: {cita.cliente_nombre}
                </span>
                <span style={{ 
                  fontSize: '12px', padding: '3px 8px', borderRadius: '12px', 
                  backgroundColor: cita.estado === 'Pendiente' ? '#334155' : cita.estado === 'Completada' ? '#064e3b' : '#7f1d1d', 
                  color: cita.estado === 'Pendiente' ? '#e2e8f0' : cita.estado === 'Completada' ? '#34d399' : '#fca5a5' 
                }}>
                  {cita.estado}
                </span>
              </div>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', color: '#cbd5e1' }}>
                <Scissors size={14}/> Servicio: Corte Clásico (Servicio {cita.servicio_id || 1})
              </p>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', color: '#cbd5e1' }}>
                <User size={14}/> Barbero: {cita.barbero_nombre || 'No asignado'}
              </p>
              <p style={{ margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8' }}>
                <Clock size={14}/> {formatearFechaHora(cita.fecha_hora)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}