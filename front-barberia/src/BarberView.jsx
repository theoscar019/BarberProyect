import React, { useState, useEffect } from 'react';
import { LogOut, RefreshCw, CheckCircle, XCircle, Scissors } from 'lucide-react';

export default function BarberView({ onLogout, userName, barberoId }) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://barberproyect.onrender.com/api'; 
  const PRECIO_CORTE = 10000; // Valor de prueba por corte, puedes cambiarlo

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

  const actualizarEstado = async (idCita, nuevoEstado) => {
    try {
      const response = await fetch(`${API_URL}/reservas/${idCita}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (response.ok) {
        cargarCitas();
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  useEffect(() => {
    if (barberoId) cargarCitas();
  }, [barberoId]);

  const formatearHora = (fechaHoraIso) => {
    return new Date(fechaHoraIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // CÁLCULOS DINÁMICOS
  const citasCompletadas = citas.filter(c => c.estado === 'Completada');
  const citasPendientes = citas.filter(c => c.estado === 'Pendiente');
  const comisionHoy = citasCompletadas.length * (PRECIO_CORTE * 0.5);

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', padding: '20px', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <p style={{ color: '#C8A951', fontSize: '12px', fontWeight: 'bold', margin: '0 0 5px 0' }}>MODO BARBERO</p>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Hola, {userName || 'Barbero'}</h1>
        </div>
        <button onClick={onLogout} style={{ background: '#222', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <LogOut size={16} style={{ marginRight: '8px' }} /> Salir
        </button>
      </div>

      <div style={{ backgroundColor: '#111', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #222' }}>
         <div>
            <p style={{ color: '#888', margin: '0 0 5px 0', fontSize: '14px' }}>Tu Comisión Acumulada Hoy (50%)</p>
            {/* AQUÍ SE IMPRIME LA COMISIÓN REAL */}
            <h2 style={{ color: '#C8A951', margin: 0, fontSize: '28px' }}>
              ${comisionHoy.toLocaleString('es-CL')}
            </h2>
         </div>
         <Scissors color="#C8A951" size={32} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: '#C8A951', fontSize: '14px', letterSpacing: '1px' }}>CITAS PROGRAMADAS HOY</h3>
        <button onClick={cargarCitas} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <RefreshCw size={14} style={{ marginRight: '5px' }} /> Actualizar
        </button>
      </div>

      {loading ? (
         <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>Cargando tus citas...</p>
      ) : citasPendientes.length === 0 ? (
         <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>No tienes citas pendientes agendadas.</p>
      ) : (
        citasPendientes.map(cita => (
          <div key={cita.id} style={{ backgroundColor: '#111', borderRadius: '8px', padding: '20px', marginBottom: '15px', borderLeft: '4px solid #C8A951', border: '1px solid #222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <p style={{ color: '#C8A951', margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>🕒 {formatearHora(cita.fecha_hora)}</p>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{cita.cliente_nombre}</h4>
                <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>Corte Clásico (Servicio {cita.servicio_id || 1})</p>
              </div>
              <span style={{ backgroundColor: '#222', color: '#C8A951', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{cita.estado}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => actualizarEstado(cita.id, 'Completada')} style={{ flex: 1, backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                 <CheckCircle size={18} style={{ marginRight: '5px' }} /> Completar
              </button>
              <button onClick={() => actualizarEstado(cita.id, 'No asiste')} style={{ flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                 <XCircle size={18} style={{ marginRight: '5px' }} /> No asiste
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}