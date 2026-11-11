import React, { useState, useEffect } from 'react';
import { Calendar, User, Scissors, CheckCircle, Clock, LogOut } from 'lucide-react';

export default function AdminView({ onLogout }) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Traer las citas reales desde el backend
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const response = await fetch('https://upgraded-winner-6vprx6p557pc4pqq-3000.app.github.dev/api/admin/citas');
        if (response.ok) {
          const data = await response.json();
          setCitas(data);
        }
      } catch (error) {
        console.error("Error obteniendo citas:", error);
        // Datos falsos por si la BD aún no tiene tablas creadas
        setCitas([
          { id_cita: 1, cliente_nombre: "Juan Pérez", barbero_nombre: "Jesús", fecha: "2026-12-01 10:00", servicio: "Corte + Barba", estado: "Pendiente" },
          { id_cita: 2, cliente_nombre: "Matías", barbero_nombre: "Felipe", fecha: "2026-12-01 11:30", servicio: "Corte Clásico", estado: "Completado" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, []);

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
          <h3 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>{citas.length}</h3>
        </div>
        <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Ingresos</p>
          <h3 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>$0</h3>
        </div>
      </div>

      <h3 style={{ borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '20px' }}>Agenda Reciente</h3>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#d4af37' }}>Cargando citas...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {citas.map((cita) => (
            <div key={cita.id_cita} style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <User size={16}/> {cita.cliente_nombre}
                </span>
                <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '12px', backgroundColor: cita.estado === 'Pendiente' ? '#334155' : '#064e3b', color: cita.estado === 'Pendiente' ? '#e2e8f0' : '#34d399' }}>
                  {cita.estado}
                </span>
              </div>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', color: '#cbd5e1' }}>
                <Scissors size={14}/> Servicio: {cita.servicio}
              </p>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', color: '#cbd5e1' }}>
                <User size={14}/> Barbero: {cita.barbero_nombre}
              </p>
              <p style={{ margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8' }}>
                <Clock size={14}/> {cita.fecha}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}