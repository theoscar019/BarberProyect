import React, { useState, useEffect } from 'react';
import { 
  Scissors, Calendar, Clock, CheckCircle2, XCircle, 
  DollarSign, PlusCircle, Lock, LogOut, RefreshCw, 
  FileText, Phone, AlertTriangle 
} from 'lucide-react';

const API_URL = 'http://localhost:3000/api';
const PORCENTAJE_COMISION = 0.5; // 50% de comisión para el barbero

const SERVICIOS_EXTRA = [
  { id: 'ext1', nombre: 'Perfilado de Cejas', precio: 3000 },
  { id: 'ext2', nombre: 'Arreglo de Barba', precio: 5000 },
  { id: 'ext3', nombre: 'Limpieza Facial', precio: 6000 },
];

export default function BarberView({ usuarioBarbero, onLogout }) {
  const [tabActiva, setTabActiva] = useState('agenda'); // 'agenda' | 'colacion' | 'comisiones'
  const [citas, setCitas] = useState([]);
  const [citaAbierta, setCitaAbierta] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Estado para bloqueo de horario / colación (HU-11)
  const [bloqueo, setBloqueo] = useState({
    horaInicio: '13:00',
    horaFin: '14:00',
    motivo: 'Horario de Colación'
  });

  const barberoId = usuarioBarbero?.id || 1;
  const barberoNombre = usuarioBarbero?.nombre || 'Jesús Rojas';

  // 1. Cargar la agenda del barbero desde el Backend (HU-09 / RF-05)
  const cargarAgenda = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/reservas/barbero/${barberoId}`);
      if (!res.ok) throw new Error('Backend sin tabla reservas aún, usando datos locales');
      const data = await res.json();
      setCitas(data);
    } catch (err) {
      // Datos iniciales de respaldo para que la interfaz funcione de inmediato en la demo
      setCitas([
        {
          id: 101,
          hora: '10:00 AM',
          cliente: 'Juan Pérez',
          telefono: '+56 9 8765 4321',
          servicio: 'Corte Clásico',
          precio_base: 10000,
          extras: [],
          notas: 'Degradado medio con navaja, remolino en la coronilla.',
          estado: 'Pendiente'
        },
        {
          id: 102,
          hora: '12:30 PM',
          cliente: 'Pedro Gómez',
          telefono: '+56 9 1234 5678',
          servicio: 'Corte + Barba',
          precio_base: 14000,
          extras: [],
          notas: 'Piel sensible en el cuello, aplicar loción fría.',
          estado: 'Pendiente'
        }
      ]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAgenda();
  }, []);

  // 2. Marcar cita como 'Completada' o 'No asiste' (HU-10, HU-13 / RF-06)
  const actualizarEstadoCita = async (citaId, nuevoEstado) => {
    try {
      await fetch(`${API_URL}/reservas/${citaId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
    } catch (e) {
      console.warn('Actualizado en modo local');
    }

    setCitas(prev =>
      prev.map(c => (c.id === citaId ? { ...c, estado: nuevoEstado } : c))
    );
  };

  // 3. Agregar servicio extra en vivo - Upselling (HU-15)
  const agregarExtra = async (citaId, extra) => {
    try {
      await fetch(`${API_URL}/reservas/${citaId}/extra`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extra)
      });
    } catch (e) {
      console.warn('Extra agregado en modo local');
    }

    setCitas(prev =>
      prev.map(c => {
        if (c.id === citaId) {
          const yaExiste = c.extras.some(item => item.id === extra.id);
          if (yaExiste) return c;
          return { ...c, extras: [...c.extras, extra] };
        }
        return c;
      })
    );
  };

  // 4. Bloquear horario de colación o permisos (HU-11)
  const bloquearHorario = async (e) => {
    e.preventDefault();
    const nuevoBloqueo = {
      id: Date.now(),
      hora: `${bloqueo.horaInicio} - ${bloqueo.horaFin}`,
      cliente: bloqueo.motivo,
      telefono: '-',
      servicio: 'Bloqueo de Agenda Personal',
      precio_base: 0,
      extras: [],
      notas: 'Horario bloqueado por el barbero.',
      estado: 'Bloqueado'
    };

    try {
      await fetch(`${API_URL}/barberos/${barberoId}/bloqueos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bloqueo)
      });
    } catch (e) {
      console.warn('Bloqueo guardado en modo local');
    }

    setCitas(prev => [...prev, nuevoBloqueo]);
    setTabActiva('agenda');
  };

  // Cálculos financieros y de comisiones (HU-14 / RF-07)
  const calcularTotalCita = (cita) => {
    const totalExtras = (cita.extras || []).reduce((acc, ext) => acc + ext.precio, 0);
    return Number(cita.precio_base || 0) + totalExtras;
  };

  const citasCompletadas = citas.filter(c => c.estado === 'Completada');
  const totalGenerado = citasCompletadas.reduce((acc, c) => acc + calcularTotalCita(c), 0);
  const comisionGanada = totalGenerado * PORCENTAJE_COMISION;

  return (
    <div style={{ padding: '20px', color: '#ffffff' }}>
      {/* ENCABEZADO DEL BARBERO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span style={{ color: '#d4af37', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>
            MODO BARBERO
          </span>
          <h2 style={{ margin: '2px 0 0 0', color: '#ffffff' }}>Hola, {barberoNombre}</h2>
        </div>
        <button 
          onClick={onLogout}
          style={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}
        >
          <LogOut size={16} color="#d4af37" /> Salir
        </button>
      </div>

      {/* TARJETA RÁPIDA DE COMISIÓN DEL DÍA */}
      <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '10px', marginBottom: '20px', borderLeft: '4px solid #d4af37', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Tu Comisión Acumulada Hoy (50%)</p>
          <h3 style={{ margin: '5px 0 0 0', color: '#d4af37', fontSize: '24px' }}>
            ${comisionGanada.toLocaleString('es-CL')}
          </h3>
        </div>
        <Scissors size={32} color="#d4af37" />
      </div>

      {/* BARRA DE NAVEGACIÓN INTERNA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setTabActiva('agenda')}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            backgroundColor: tabActiva === 'agenda' ? '#d4af37' : '#1e293b',
            color: tabActiva === 'agenda' ? '#121212' : '#e2e8f0'
          }}
        >
          Agenda ({citas.length})
        </button>

        <button
          onClick={() => setTabActiva('colacion')}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            backgroundColor: tabActiva === 'colacion' ? '#d4af37' : '#1e293b',
            color: tabActiva === 'colacion' ? '#121212' : '#e2e8f0'
          }}
        >
          Colación
        </button>

        <button
          onClick={() => setTabActiva('comisiones')}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            backgroundColor: tabActiva === 'comisiones' ? '#d4af37' : '#1e293b',
            color: tabActiva === 'comisiones' ? '#121212' : '#e2e8f0'
          }}
        >
          Ganancias
        </button>
      </div>

      {/* PESTAÑA 1: AGENDA DIARIA DEL BARBERO */}
      {tabActiva === 'agenda' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ color: '#d4af37', fontSize: '14px', letterSpacing: '1px', margin: 0 }}>
              CITAS PROGRAMADAS HOY
            </h3>
            <button 
              onClick={cargarAgenda}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              <RefreshCw size={14} /> Actualizar
            </button>
          </div>

          {cargando ? (
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>Cargando citas...</p>
          ) : (
            citas.map(cita => (
              <div 
                key={cita.id} 
                style={{ 
                  backgroundColor: '#1e293b', 
                  padding: '16px', 
                  borderRadius: '10px', 
                  marginBottom: '14px',
                  borderLeft: cita.estado === 'Completada' 
                    ? '4px solid #22c55e' 
                    : cita.estado === 'No asiste' 
                    ? '4px solid #ef4444' 
                    : cita.estado === 'Bloqueado'
                    ? '4px solid #64748b'
                    : '4px solid #d4af37'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d4af37', fontWeight: 'bold', fontSize: '15px' }}>
                    <Clock size={16} /> {cita.hora}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor: '#0f172a',
                    color: cita.estado === 'Completada' ? '#22c55e' : cita.estado === 'No asiste' ? '#ef4444' : '#d4af37'
                  }}>
                    {cita.estado}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 4px 0', fontSize: '17px', color: '#ffffff' }}>{cita.cliente}</h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#cbd5e1' }}>{cita.servicio}</p>

                {cita.estado !== 'Bloqueado' && (
                  <>
                    {/* Botón para desplegar notas e insumos (HU-12) y extras (HU-15) */}
                    <button
                      onClick={() => setCitaAbierta(citaAbierta === cita.id ? null : cita.id)}
                      style={{ background: '#0f172a', border: '1px solid #334155', color: '#d4af37', width: '100%', padding: '8px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', marginBottom: '10px', textAlign: 'left' }}
                    >
                      {citaAbierta === cita.id ? '▲ Ocultar ficha técnica y servicios extra' : '▼ Ver notas del cliente / Agregar servicio extra'}
                    </button>

                    {citaAbierta === cita.id && (
                      <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
                        <p style={{ margin: '0 0 6px 0', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} color="#d4af37" /> <strong>Notas:</strong> {cita.notas}
                        </p>
                        <p style={{ margin: '0 0 10px 0', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} color="#d4af37" /> <strong>Teléfono:</strong> {cita.telefono}
                        </p>

                        {cita.estado === 'Pendiente' && (
                          <div>
                            <p style={{ margin: '0 0 6px 0', color: '#d4af37', fontWeight: 'bold', fontSize: '12px' }}>
                              + AGREGAR SERVICIO EXTRA (HU-15):
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {SERVICIOS_EXTRA.map(ext => (
                                <button
                                  key={ext.id}
                                  onClick={() => agregarExtra(cita.id, ext)}
                                  style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#1e293b', color: '#ffffff', border: '1px solid #334155', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                                >
                                  <span>+ {ext.nombre}</span>
                                  <strong style={{ color: '#d4af37' }}>${ext.precio.toLocaleString('es-CL')}</strong>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mostrar extras si se agregaron */}
                    {cita.extras && cita.extras.length > 0 && (
                      <div style={{ fontSize: '12px', color: '#d4af37', marginBottom: '8px' }}>
                        Extras sumados: {cita.extras.map(e => e.nombre).join(', ')}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: '10px', marginBottom: '12px', fontSize: '14px' }}>
                      <span style={{ color: '#94a3b8' }}>Total a cobrar:</span>
                      <strong style={{ color: '#ffffff', fontSize: '16px' }}>
                        ${calcularTotalCita(cita).toLocaleString('es-CL')}
                      </strong>
                    </div>

                    {/* Botones de acción principal: Completar (HU-13) o No Asiste (HU-10) */}
                    {cita.estado === 'Pendiente' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                          onClick={() => actualizarEstadoCita(cita.id, 'Completada')}
                          style={{ backgroundColor: '#22c55e', color: '#052e16', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                        >
                          <CheckCircle2 size={16} /> Completar
                        </button>
                        <button
                          onClick={() => actualizarEstadoCita(cita.id, 'No asiste')}
                          style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                        >
                          <XCircle size={16} /> No asiste
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* PESTAÑA 2: BLOQUEAR COLACIÓN O PERMISOS (HU-11) */}
      {tabActiva === 'colacion' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px' }}>
          <h3 style={{ color: '#d4af37', marginTop: 0, fontSize: '16px' }}>Bloquear Horario Personal</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '18px' }}>
            Impide que los clientes agenden citas durante tu hora de colación o descansos.
          </p>

          <form onSubmit={bloquearHorario}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#e2e8f0', marginBottom: '6px' }}>Hora Inicio</label>
              <input
                type="time"
                value={bloqueo.horaInicio}
                onChange={e => setBloqueo({ ...bloqueo, horaInicio: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#ffffff' }}
                required
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#e2e8f0', marginBottom: '6px' }}>Hora Fin</label>
              <input
                type="time"
                value={bloqueo.horaFin}
                onChange={e => setBloqueo({ ...bloqueo, horaFin: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#ffffff' }}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#e2e8f0', marginBottom: '6px' }}>Motivo</label>
              <select
                value={bloqueo.motivo}
                onChange={e => setBloqueo({ ...bloqueo, motivo: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#ffffff' }}
              >
                <option value="Horario de Colación">Horario de Colación</option>
                <option value="Permiso Personal">Permiso Personal</option>
                <option value="Desinfección de Herramientas">Desinfección de Herramientas</option>
              </select>
            </div>

            <button
              type="submit"
              style={{ backgroundColor: '#d4af37', color: '#121212', width: '100%', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
            >
              BLOQUEAR EN MI AGENDA
            </button>
          </form>
        </div>
      )}

      {/* PESTAÑA 3: RESUMEN DE COMISIONES (HU-14 / RF-07) */}
      {tabActiva === 'comisiones' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px' }}>
          <h3 style={{ color: '#d4af37', marginTop: 0, fontSize: '16px' }}>Resumen de Ganancias</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Cortes Completados</p>
              <strong style={{ fontSize: '20px', color: '#ffffff' }}>{citasCompletadas.length}</strong>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Total Bruto</p>
              <strong style={{ fontSize: '20px', color: '#ffffff' }}>${totalGenerado.toLocaleString('es-CL')}</strong>
            </div>
          </div>

          <h4 style={{ color: '#e2e8f0', fontSize: '14px', marginBottom: '10px' }}>Desglose por Servicio Completado:</h4>
          {citasCompletadas.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>
              Aún no has completado servicios hoy. Marca una cita como "Completar" en tu agenda para ver tu comisión reflejada.
            </p>
          ) : (
            citasCompletadas.map(c => (
              <div key={c.id} style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: '#ffffff' }}>{c.cliente}</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>{c.servicio} ({c.hora})</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Comisión 50%</span>
                  <strong style={{ color: '#22c55e', fontSize: '15px' }}>
                    +${(calcularTotalCita(c) * PORCENTAJE_COMISION).toLocaleString('es-CL')}
                  </strong>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}