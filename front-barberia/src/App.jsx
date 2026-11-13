import React, { useState, useEffect } from 'react';
import './App.css'; 
import { Scissors, Camera, User, ChevronLeft, CheckCircle2, LogOut } from 'lucide-react';
import BarberView from './BarberView';
import AdminView from './AdminView'; 
import EscanerRostro from './EscanerRostro'; 
import Registro from './Registro';

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [reservaStep, setReservaStep] = useState(1);
  
  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  
  const [barberos, setBarberos] = useState([]);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState(null);

  const GOLD = "#C8A951"; 
  const BG_DARK = "#050505"; 
  const CARD_BG = "#111111"; 
  const BORDER = "#222222"; 
  const TEXT_MUTED = "#888888"; 

  const horariosBase = ['10:00', '11:00', '12:30', '15:00', '16:00', '17:30'];

  const API_URL = 'https://barberproyect.onrender.com/api'; 

  const handleLoginSubmit = async (e) => {
    e.preventDefault(); 
    try {
      const response = await fetch(`${API_URL}/login`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLogin, password: passwordLogin }),
      });
      const data = await response.json();
      if (response.ok) {
        setUserId(data.usuario?.id);
        setUserName(data.usuario?.nombre || 'Cliente');
        const rolUsuario = Number(data.usuario?.rol);
        if (rolUsuario === 3) setCurrentView('admin');
        else if (rolUsuario === 2) setCurrentView('barbero');
        else setCurrentView('dashboard');
      } else {
        alert("Error: " + (data.message || "Revisa tus credenciales"));
      }
    } catch (error) {
      alert("Error: No hay conexión con el backend.");
    }
  };

  const iniciarReserva = async () => {
    setCurrentView('reserva');
    setReservaStep(1);
    try {
      const response = await fetch(`${API_URL}/barberos`);
      if (response.ok) {
        const data = await response.json();
        setBarberos(data);
      }
    } catch (error) {
      console.error("Error al cargar los barberos:", error);
    }
  };

  const cargarHorasDisponibles = async (fecha) => {
    try {
      const response = await fetch(`${API_URL}/reservas/ocupadas?fecha=${fecha}`);
      if (response.ok) {
        const ocupadas = await response.json();
        setHorasOcupadas(ocupadas); 
      }
    } catch (error) {
      console.error("Error al cargar horas", error);
    }
  };

  const seleccionarServicio = () => {
    cargarHorasDisponibles(fechaSeleccionada);
    setReservaStep(3);
  };

  const confirmarReserva = async (hora) => {
    setHoraSeleccionada(hora);
    try {
      const response = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: userId,
          barbero_id: barberoSeleccionado, 
          servicio_id: 1,
          fecha: fechaSeleccionada,
          hora: hora
        })
      });

      if (response.ok) {
        setReservaStep(4);
      } else {
        alert("Hubo un problema al guardar la reserva.");
      }
    } catch (error) {
      alert("Error de conexión al guardar reserva.");
    }
  };

  const renderLogin = () => (
    <div style={{ padding: '40px 25px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '90vh' }}>
      <Scissors size={50} color={GOLD} strokeWidth={1.5} style={{ margin: '0 auto 20px auto', display: 'block' }} />
      <h1 style={{ color: GOLD, marginBottom: '50px', fontSize: '24px', letterSpacing: '4px', fontWeight: '300' }}>BARBER SHOP</h1>
      <div className="login-box" style={{ backgroundColor: CARD_BG, padding: '30px 25px', borderRadius: '4px', textAlign: 'left', border: `1px solid ${BORDER}` }}>
        <form onSubmit={handleLoginSubmit}>
          <input type="text" placeholder="Correo electrónico" value={emailLogin} onChange={(e) => setEmailLogin(e.target.value)} required style={{ width: '100%', marginBottom: '15px', padding: '14px', backgroundColor: BG_DARK, color: '#fff', border: `1px solid ${BORDER}` }} />
          <input type="password" placeholder="Contraseña" value={passwordLogin} onChange={(e) => setPasswordLogin(e.target.value)} required style={{ width: '100%', marginBottom: '30px', padding: '14px', backgroundColor: BG_DARK, color: '#fff', border: `1px solid ${BORDER}` }} />
          <button type="submit" style={{ backgroundColor: GOLD, color: '#000', width: '100%', padding: '14px', border: 'none', fontWeight: '500', cursor: 'pointer' }}>Ingresar</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: GOLD, cursor: 'pointer' }} onClick={() => setCurrentView('registro')}>Regístrate aquí</p>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div style={{ padding: '40px 25px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '45px' }}>
        <div>
          <h2 style={{ color: '#ffffff', margin: 0 }}>Hola, {userName}</h2>
          <p style={{ color: TEXT_MUTED, margin: '5px 0 0 0' }}>¿Qué te harás hoy?</p>
        </div>
        <button onClick={() => setCurrentView('login')} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <LogOut size={24} color={TEXT_MUTED} />
        </button>
      </div>
      <div className="options-grid">
        <div onClick={iniciarReserva} style={{ backgroundColor: CARD_BG, padding: '25px', borderLeft: `3px solid ${GOLD}`, cursor: 'pointer', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#fff' }}>Agendar Cita</h3>
        </div>
        <div onClick={() => setCurrentView('ia')} style={{ backgroundColor: CARD_BG, padding: '25px', borderLeft: `3px solid #E5E5E5`, cursor: 'pointer' }}>
          <h3 style={{ margin: 0, color: '#fff' }}>Escáner IA</h3>
        </div>
      </div>
    </div>
  );

  const renderReserva = () => (
    <div style={{ padding: '30px 25px' }}>
      <button onClick={() => setCurrentView('dashboard')} style={{ background: 'transparent', border: 'none', color: TEXT_MUTED, cursor: 'pointer', marginBottom: '20px' }}>
        <ChevronLeft size={20} /> Volver
      </button>

      {reservaStep === 1 && (
        <div>
          <h3 style={{ color: TEXT_MUTED, marginBottom: '20px' }}>1. ¿Con quién te cortas?</h3>
          {barberos.length > 0 ? (
            barberos.map(barbero => (
              <button 
                key={barbero.id} 
                onClick={() => { setBarberoSeleccionado(barbero.id); setReservaStep(2); }} 
                style={{ display: 'flex', alignItems: 'center', backgroundColor: CARD_BG, padding: '20px', width: '100%', border: `1px solid ${BORDER}`, color: '#fff', marginBottom: '15px', cursor: 'pointer' }}
              >
                <User size={24} style={{ marginRight: '15px', color: GOLD }} />
                <span style={{ fontSize: '16px' }}>{barbero.nombre}</span>
              </button>
            ))
          ) : (
            <p style={{ color: TEXT_MUTED }}>Cargando barberos disponibles...</p>
          )}
        </div>
      )}

      {reservaStep === 2 && (
        <div>
          <h3 style={{ color: TEXT_MUTED, marginBottom: '20px' }}>2. Selecciona Servicio</h3>
          {['Corte Clásico', 'Corte + Barba'].map(s => (
            <button key={s} onClick={seleccionarServicio} style={{ display: 'block', backgroundColor: CARD_BG, padding: '20px', width: '100%', border: `1px solid ${BORDER}`, color: '#fff', marginBottom: '15px', cursor: 'pointer' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {reservaStep === 3 && (
        <div>
          <h3 style={{ color: TEXT_MUTED, marginBottom: '20px' }}>3. Horas Disponibles (Hoy)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {horariosBase.map(hora => {
              const isOcupada = horasOcupadas.includes(hora);
              return (
                <button 
                  key={hora} 
                  disabled={isOcupada}
                  onClick={() => confirmarReserva(hora)} 
                  style={{ backgroundColor: isOcupada ? BG_DARK : CARD_BG, color: isOcupada ? '#333' : '#ffffff', padding: '18px', border: isOcupada ? `1px solid ${BORDER}` : `1px solid ${GOLD}`, cursor: isOcupada ? 'not-allowed' : 'pointer', textDecoration: isOcupada ? 'line-through' : 'none' }}
                >
                  {hora}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {reservaStep === 4 && (
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <CheckCircle2 size={50} color={GOLD} style={{ margin: '0 auto 15px auto' }} />
          <h2 style={{ color: '#fff' }}>¡Reserva Confirmada!</h2>
          <p style={{ color: TEXT_MUTED }}>Tu cita quedó registrada a las {horaSeleccionada}.</p>
          <button onClick={() => setCurrentView('dashboard')} style={{ backgroundColor: CARD_BG, color: '#fff', width: '100%', padding: '16px', marginTop: '20px', border: 'none', cursor: 'pointer' }}>VOLVER AL INICIO</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="app-container">
      {currentView === 'login' && renderLogin()}
      {currentView === 'registro' && <Registro onVolver={() => setCurrentView('login')} />}
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'reserva' && renderReserva()}
      {currentView === 'ia' && <EscanerRostro onVolver={() => setCurrentView('dashboard')} />}
      {currentView === 'barbero' && <BarberView onLogout={() => setCurrentView('login')} userName={userName} barberoId={userId} />}
      {currentView === 'admin' && <AdminView onLogout={() => setCurrentView('login')} />}
    </div>
  );
}