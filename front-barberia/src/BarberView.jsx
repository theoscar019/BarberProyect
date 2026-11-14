import React, { useState, useEffect } from 'react';
import { LogOut, RefreshCw, CheckCircle, XCircle, Scissors } from 'lucide-react';

export default function BarberView({ onLogout, userName, barberoId }) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://barberproyect.onrender.com/api'; // O localhost:3000 si pruebas local

  const cargarCitas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reservas/barbero/${barberoId}`);
      if (response.ok) {
        const data = await response.json();
        setCitas(data);
      }
    } catch (error) {
      console.error("Error cargando citas", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar el estado de la cita (Completada o No asiste)
  const actualizarEstado = async (idCita, nuevoEstado) => {
    try {
      const response = await fetch(`${API_URL}/reservas/${idCita}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        // Recargar la lista de citas para que desaparezca o se actualice visualmente
        cargarCitas();
      } else {
        console.error("Error al actualizar la cita");
      }
    } catch (error) {
      console.error("Error de red al actualizar estado:", error);
    }
  };

  // Cargar citas apenas el barbero entra a su panel
  useEffect(() => {
    if (barberoId) {
      cargarCitas();
    }
  }, [barberoId]);

  // Formatear la fecha_hora de PostgreSQL a solo hora (ej: 10:00 AM)
  const formatearHora = (fechaHoraIso) => {
    const fecha = new Date(fechaHoraIso);
    return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', padding: '20px', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <p style={{ color: '#C8A951', fontSize: '12px', fontWeight: 'bold', margin: '0 0 5px 0' }}>MODO BARBERO</p>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Hola, {userName || 'Barbero'}</h1>
        </div>
        <button onClick={onLogout} style={{ background: '#222', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <LogOut size={16} style={{ marginRight: '8px' }} /> Salir
        </button>
      </div>

      <div style={{ backgroundColor: '#111', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #222' }}>
         <div>
            <p style={{ color: '#888', margin: '0 0 5px 0', fontSize: '14px' }}>Tu Comisión Acumulada Hoy (50%)</p>
            <h2 style={{ color: '#C8A951', margin: 0, fontSize: '28px' }}>$0</h2>
         </div>
         <Scissors color="#C8A951" size={32} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: '#C8A951', fontSize: '14px', letterSpacing: '1px' }}>CITAS PROGRAMADAS HOY</h3>
        <button onClick={cargarCitas} style={{ background: 'transparent', border: 'none', color: '#888', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <RefreshCw size={14} style={{ marginRight: '5px' }} /> Actualizar
        </button>
      </div>

      {loading ? (
         <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>Cargando tus citas...</p>
      ) : citas.length === 0 ? (
         <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>No tienes citas agendadas por el momento.</p>
      ) : (
        citas.map(cita => (
          <div key={cita.id} style={{ backgroundColor: '#111', borderRadius: '8px', padding: '20px', marginBottom: '15px', borderLeft: '4px solid #C8A951', borderTop: '1px solid #222', borderRight: '1px solid #222', borderBottom: '1px solid #222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <p style={{ color: '#C8A951', margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>🕒 {formatearHora(cita.fecha_hora)}</p>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{cita.cliente_nombre}</h4>
                <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>Corte Clásico (Servicio {cita.servicio_id || 1})</p>
              </div>
              <span style={{ backgroundColor: '#222', color: '#C8A951', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{cita.estado}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => actualizarEstado(cita.id, 'Completada')}
                style={{ flex: 1, backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                 <CheckCircle size={18} style={{ marginRight: '5px' }} /> Completar
              </button>
              <button 
                onClick={() => actualizarEstado(cita.id, 'No asiste')}
                style={{ flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                 <XCircle size={18} style={{ marginRight: '5px' }} /> No asiste
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}