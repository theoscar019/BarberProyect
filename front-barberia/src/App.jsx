import React, { useState } from 'react';
import './App.css'; 
import { Scissors, Calendar, Camera, User, ChevronLeft, Clock, CheckCircle2, Lock, Mail, LogOut } from 'lucide-react';
import BarberView from './BarberView';
import AdminView from './AdminView'; 
import EscanerRostro from './EscanerRostro'; 

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [reservaStep, setReservaStep] = useState(1);
  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [userName, setUserName] = useState('');

  // Estados para el formulario de registro
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const GOLD = "#C8A951"; 
  const BG_DARK = "#050505"; 
  const CARD_BG = "#111111"; 
  const BORDER = "#222222"; 
  const TEXT_MUTED = "#888888"; 

  const handleLoginSubmit = async (e) => {
    e.preventDefault(); 
    if (emailLogin === "admin") { setCurrentView('admin'); return; }
    if (emailLogin === "cliente") { setCurrentView('dashboard'); return; }
    if (emailLogin === "barbero") { setCurrentView('barbero'); return; }

    try {
      const response = await fetch('https://barberproyect.onrender.com/api/login', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLogin, password: passwordLogin }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserName(data.usuario?.nombre || 'Cliente');
        
        // Mapeo exacto según tu tabla de roles en Neon:
        // 3 = Administrador, 2 = Barbero, 1 = Cliente
        const rolUsuario = Number(data.usuario?.rol);
        if (rolUsuario === 3) {
          setCurrentView('admin');
        } else if (rolUsuario === 2) {
          setCurrentView('barbero');
        } else {
          setCurrentView('dashboard');
        }
      } else {
        alert("Error: " + (data.message || "Revisa tus credenciales"));
      }
    } catch (error) {
      console.error("Error al conectar con Node:", error);
      alert("Error: No hay conexión con el backend.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://barberproyect.onrender.com/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: regNombre, email: regEmail, password: regPassword, rol_id: 1 })
      });

      const data = await response.json();
      if (response.ok) {
        alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
        setCurrentView('login');
      } else {
        alert("Error al registrarse: " + (data.message || "Inténtalo de nuevo"));
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("No se pudo conectar con el servidor para registrar.");
    }
  };

  const renderLogin = () => (
    <div style={{ padding: '40px 25px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '90vh', animation: 'fadeIn 0.6s ease-out' }}>
      <Scissors size={50} color={GOLD} strokeWidth={1.5} style={{ margin: '0 auto 20px auto', display: 'block' }} />
      <h1 style={{ color: GOLD, marginBottom: '50px', fontSize: '24px', letterSpacing: '4px', fontWeight: '300', textTransform: 'uppercase' }}>
        BARBER SHOP
      </h1>
      
      <div className="login-box" style={{ backgroundColor: CARD_BG, padding: '30px 25px', borderRadius: '4px', textAlign: 'left', border: `1px solid ${BORDER}` }}>
        <h3 style={{ color: '#ffffff', marginTop: 0, fontSize: '18px', fontWeight: '400', letterSpacing: '1px' }}>Iniciar Sesión</h3>
        <p style={{ color: TEXT_MUTED, fontSize: '13px', marginBottom: '30px' }}>Ingresa tus credenciales para agendar.</p>
        
        <form onSubmit={handleLoginSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: BG_DARK, padding: '14px', borderRadius: '4px', marginBottom: '15px', border: `1px solid ${BORDER}` }}>
            <Mail size={18} color={TEXT_MUTED} style={{ marginRight: '15px' }} />
            <input 
              type="text" 
              placeholder="Correo electrónico" 
              value={emailLogin}
              onChange={(e) => setEmailLogin(e.target.value)}
              required
              style={{ border: 'none', background: 'transparent', color: '#ffffff', width: '100%', outline: 'none', fontSize: '14px', fontWeight: '300' }} 
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: BG_DARK, padding: '14px', borderRadius: '4px', marginBottom: '35px', border: `1px solid ${BORDER}` }}>
            <Lock size={18} color={TEXT_MUTED} style={{ marginRight: '15px' }} />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={passwordLogin}
              onChange={(e) => setPasswordLogin(e.target.value)}
              style={{ border: 'none', background: 'transparent', color: '#ffffff', width: '100%', outline: 'none', fontSize: '14px', fontWeight: '300' }} 
            />
          </div>
          
          <button 
            type="submit"
            style={{ backgroundColor: GOLD, color: '#000000', width: '100%', padding: '14px', borderRadius: '4px', border: 'none', fontWeight: '500', fontSize: '14px', letterSpacing: '1px', cursor: 'pointer', textTransform: 'uppercase' }}
          >
            Ingresar
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ color: TEXT_MUTED, fontSize: '13px', margin: 0 }}>
            ¿No tienes cuenta? <br/><br/>
            <span onClick={() => setCurrentView('registro')} style={{ color: GOLD, cursor: 'pointer', fontWeight: '400', letterSpacing: '0.5px' }}>
              Regístrate aquí
            </span>
          </p>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div style={{ padding: '40px 25px', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '45px' }}>
        <div>
          <h2 style={{ color: '#ffffff', margin: 0, fontSize: '22px', fontWeight: '400' }}>Hola, {userName || 'Cliente'}</h2>
          <p style={{ color: TEXT_MUTED, margin: '5px 0 0 0', fontSize: '14px', fontWeight: '300' }}>¿Qué te harás hoy?</p>
        </div>
        <button onClick={() => setCurrentView('login')} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <LogOut size={24} color={TEXT_MUTED} />
        </button>
      </div>

      <div className="options-grid">
        <div 
          onClick={() => { setReservaStep(1); setCurrentView('reserva'); }} 
          style={{ backgroundColor: CARD_BG, padding: '25px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${BORDER}`, borderLeft: `3px solid ${GOLD}` }}
        >
          <div>
            <h3 style={{ margin: 0, color: '#ffffff', fontSize: '16px', paddingBottom: '6px', fontWeight: '400', letterSpacing: '0.5px' }}>Agendar Cita</h3>
            <p style={{ margin: 0, color: TEXT_MUTED, fontSize: '13px', fontWeight: '300' }}>Reserva tu hora tradicional.</p>
          </div>
          <Calendar size={24} color={GOLD} strokeWidth={1.5} />
        </div>

        <div 
          onClick={() => setCurrentView('ia')} 
          style={{ backgroundColor: CARD_BG, padding: '25px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${BORDER}`, borderLeft: `3px solid #E5E5E5` }}
        >
          <div>
            <h3 style={{ margin: 0, color: '#ffffff', fontSize: '16px', paddingBottom: '6px', fontWeight: '400', letterSpacing: '0.5px' }}>Escáner IA</h3>
            <p style={{ margin: 0, color: TEXT_MUTED, fontSize: '13px', fontWeight: '300' }}>Descubre el corte ideal.</p>
          </div>
          <Camera size={24} color="#E5E5E5" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );

  const renderReserva = () => (
    <div style={{ padding: '30px 25px' }}>
      <button onClick={() => setCurrentView('dashboard')} style={{ background: 'transparent', border: 'none', color: TEXT_MUTED, display: 'flex', alignItems: 'center', padding: '10px 0 40px 0', cursor: 'pointer', fontSize: '14px', letterSpacing: '0.5px' }}>
        <ChevronLeft size={20} /> Volver
      </button>

      <h2 style={{ color: '#ffffff', marginBottom: '35px', fontSize: '20px', fontWeight: '400', letterSpacing: '1px' }}>Nueva Reserva</h2>

      {reservaStep === 1 && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <h3 style={{ color: TEXT_MUTED, fontSize: '11px', letterSpacing: '2px', marginBottom: '25px', textTransform: 'uppercase' }}>1. Selecciona Servicio</h3>
          
          <div className="options-grid">
            {[
              { n: 'Corte Clásico', t: '30 min', p: '$10.000' },
              { n: 'Perfilado Barba', t: '15 min', p: '$5.000' },
              { n: 'Corte + Barba', t: '45 min', p: '$14.000' },
              { n: 'Diseño/Tribal', t: '20 min', p: '$7.000' }
            ].map(s => (
              <button key={s.n} onClick={() => setReservaStep(2)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: CARD_BG, padding: '22px', borderRadius: '4px', border: `1px solid ${BORDER}`, width: '100%', color: '#ffffff', cursor: 'pointer' }}>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: '400', fontSize: '15px', color: '#ffffff', letterSpacing: '0.5px' }}>{s.n}</p>
                  <p style={{ margin: 0, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: TEXT_MUTED, fontWeight: '300' }}><Clock size={12} /> {s.t}</p>
                </div>
                <div style={{ fontWeight: '300', fontSize: '15px', color: GOLD }}>{s.p}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {reservaStep === 2 && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <h3 style={{ color: TEXT_MUTED, fontSize: '11px', letterSpacing: '2px', marginBottom: '25px', textTransform: 'uppercase' }}>2. Horas Disponibles (Hoy)</h3>
          <div className="time-grid">
            <button onClick={() => setReservaStep(3)} style={{ backgroundColor: CARD_BG, color: '#ffffff', padding: '18px', borderRadius: '4px', border: `1px solid ${GOLD}`, cursor: 'pointer', fontSize: '14px', fontWeight: '300', letterSpacing: '1px' }}>10:00 AM</button>
            <button style={{ backgroundColor: BG_DARK, color: '#333', padding: '18px', borderRadius: '4px', border: `1px solid ${BORDER}`, cursor: 'not-allowed', fontSize: '14px', textDecoration: 'line-through', fontWeight: '300' }}>11:00 AM</button>
            <button onClick={() => setReservaStep(3)} style={{ backgroundColor: CARD_BG, color: '#ffffff', padding: '18px', borderRadius: '4px', border: `1px solid ${GOLD}`, cursor: 'pointer', fontSize: '14px', fontWeight: '300', letterSpacing: '1px' }}>12:30 PM</button>
            <button onClick={() => setReservaStep(3)} style={{ backgroundColor: CARD_BG, color: '#ffffff', padding: '18px', borderRadius: '4px', border: `1px solid ${GOLD}`, cursor: 'pointer', fontSize: '14px', fontWeight: '300', letterSpacing: '1px' }}>15:00 PM</button>
          </div>
        </div>
      )}

      {reservaStep === 3 && (
        <div className="login-box" style={{ textAlign: 'center', marginTop: '60px', animation: 'fadeIn 0.6s ease-out' }}>
          <div style={{ display: 'inline-flex', padding: '20px', borderRadius: '50%', border: `1px solid ${GOLD}`, marginBottom: '30px' }}>
            <CheckCircle2 size={40} color={GOLD} strokeWidth={1.5} />
          </div>
          <h2 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '15px', fontWeight: '400', letterSpacing: '1px' }}>¡Reserva Confirmada!</h2>
          <p style={{ color: TEXT_MUTED, marginBottom: '50px', lineHeight: '1.6', fontSize: '14px', fontWeight: '300' }}>Te enviamos un mensaje de confirmación vía SMS con los detalles.</p>
          <button onClick={() => setCurrentView('dashboard')} style={{ backgroundColor: CARD_BG, color: '#ffffff', width: '100%', padding: '16px', borderRadius: '4px', border: `1px solid ${BORDER}`, fontWeight: '400', fontSize: '13px', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}>
            VOLVER AL INICIO
          </button>
        </div>
      )}
    </div>
  );

  const renderRegistro = () => (
    <div style={{ padding: '40px 25px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '90vh', animation: 'fadeIn 0.6s ease-out' }}>
      <Scissors size={50} color={GOLD} strokeWidth={1.5} style={{ margin: '0 auto 20px auto', display: 'block' }} />
      <h1 style={{ color: GOLD, marginBottom: '30px', fontSize: '24px', letterSpacing: '4px', fontWeight: '300', textTransform: 'uppercase' }}>
        NUEVA CUENTA
      </h1>
      
      <div className="login-box" style={{ backgroundColor: CARD_BG, padding: '30px 25px', borderRadius: '4px', textAlign: 'left', border: `1px solid ${BORDER}` }}>
        <h3 style={{ color: '#ffffff', marginTop: 0, fontSize: '18px', fontWeight: '400', letterSpacing: '1px' }}>Registro de Cliente</h3>
        <p style={{ color: TEXT_MUTED, fontSize: '13px', marginBottom: '30px' }}>Crea tu cuenta para comenzar a agendar.</p>
        
        <form onSubmit={handleRegisterSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: BG_DARK, padding: '14px', borderRadius: '4px', marginBottom: '15px', border: `1px solid ${BORDER}` }}>
            <User size={18} color={TEXT_MUTED} style={{ marginRight: '15px' }} />
            <input 
              type="text" 
              placeholder="Nombre completo" 
              value={regNombre}
              onChange={(e) => setRegNombre(e.target.value)}
              required
              style={{ border: 'none', background: 'transparent', color: '#ffffff', width: '100%', outline: 'none', fontSize: '14px', fontWeight: '300' }} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: BG_DARK, padding: '14px', borderRadius: '4px', marginBottom: '15px', border: `1px solid ${BORDER}` }}>
            <Mail size={18} color={TEXT_MUTED} style={{ marginRight: '15px' }} />
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
              style={{ border: 'none', background: 'transparent', color: '#ffffff', width: '100%', outline: 'none', fontSize: '14px', fontWeight: '300' }} 
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: BG_DARK, padding: '14px', borderRadius: '4px', marginBottom: '30px', border: `1px solid ${BORDER}` }}>
            <Lock size={18} color={TEXT_MUTED} style={{ marginRight: '15px' }} />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
              style={{ border: 'none', background: 'transparent', color: '#ffffff', width: '100%', outline: 'none', fontSize: '14px', fontWeight: '300' }} 
            />
          </div>
          
          <button 
            type="submit"
            style={{ backgroundColor: GOLD, color: '#000000', width: '100%', padding: '14px', borderRadius: '4px', border: 'none', fontWeight: '500', fontSize: '14px', letterSpacing: '1px', cursor: 'pointer', textTransform: 'uppercase', marginBottom: '15px' }}
          >
            Registrarse
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => setCurrentView('login')} 
            style={{ background: 'transparent', border: 'none', color: TEXT_MUTED, cursor: 'pointer', fontSize: '13px', letterSpacing: '0.5px' }}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );

  const renderIA = () => (
    <EscanerRostro onVolver={() => setCurrentView('dashboard')} />
  );

  return (
    <div className="app-container">
      {currentView === 'login' && renderLogin()}
      {currentView === 'registro' && renderRegistro()}
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'reserva' && renderReserva()}
      {currentView === 'ia' && renderIA()}
      {currentView === 'barbero' && <BarberView onLogout={() => setCurrentView('login')} />}
      {currentView === 'admin' && <AdminView onLogout={() => setCurrentView('login')} />}
    </div>
  );
}