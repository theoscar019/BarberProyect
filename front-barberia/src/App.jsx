import React, { useState } from 'react';
import { Scissors, Calendar, Camera, User, ChevronLeft, Clock, CheckCircle2, Lock, Mail } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [reservaStep, setReservaStep] = useState(1);

  // VISTA 1: INICIO DE SESIÓN
  const renderLogin = () => (
    <div style={{ padding: '20px', textAlign: 'center', color: '#ffffff' }}>
      <Scissors size={48} color="#d4af37" style={{ margin: '0 auto 20px auto', display: 'block' }} />
      <h1 style={{ color: '#d4af37', marginBottom: '30px' }}>BARBER SHOP</h1>
      
      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', textAlign: 'left' }}>
        <h3 style={{ color: '#ffffff', marginTop: 0 }}>Iniciar Sesión</h3>
        <p style={{ color: '#e2e8f0', fontSize: '14px', marginBottom: '20px' }}>Ingresa a tu cuenta para agendar.</p>
        
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
          <Mail size={20} color="#94a3b8" style={{ marginRight: '10px' }} />
          <input type="email" placeholder="Correo electrónico" style={{ border: 'none', background: 'transparent', color: '#ffffff', width: '100%', outline: 'none' }} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', marginBottom: '25px' }}>
          <Lock size={20} color="#94a3b8" style={{ marginRight: '10px' }} />
          <input type="password" placeholder="Contraseña" style={{ border: 'none', background: 'transparent', color: '#ffffff', width: '100%', outline: 'none' }} />
        </div>
        
        <button 
          onClick={() => setCurrentView('dashboard')}
          style={{ backgroundColor: '#d4af37', color: '#121212', width: '100%', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
        >
          INGRESAR
        </button>

        {/* NUEVO: Botón para ir al Registro */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            ¿No tienes cuenta? <br/><br/>
            <span 
              onClick={() => setCurrentView('registro')} 
              style={{ color: '#d4af37', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
            >
              Regístrate aquí
            </span>
          </p>
        </div>
      </div>
    </div>
  );

  // NUEVA VISTA: REGISTRO DE USUARIO
  const renderRegistro = () => (
    <div style={{ padding: '20px', textAlign: 'center', color: '#ffffff' }}>
      <button 
        onClick={() => setCurrentView('login')}
        style={{ background: 'transparent', border: 'none', color: '#d4af37', display: 'flex', alignItems: 'center', padding: '0 0 20px 0', cursor: 'pointer', fontSize: '16px' }}
      >
        <ChevronLeft size={20} /> Volver
      </button>

      <Scissors size={48} color="#d4af37" style={{ margin: '0 auto 20px auto', display: 'block' }} />
      <h1 style={{ color: '#d4af37', marginBottom: '30px' }}>Crear Cuenta</h1>
      
      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', textAlign: 'left' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
          <User size={20} color="#94a3b8" style={{ marginRight: '10px' }} />
          <input type="text" placeholder="Nombre completo" style={{ border: 'none', background: 'transparent', color: '#ffffff', width: '100%', outline: 'none' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
          <Mail size={20} color="#94a3b8" style={{ marginRight: '10px' }} />
          <input type="email" placeholder="Correo electrónico" style={{ border: 'none', background: 'transparent', color: '#ffffff', width: '100%', outline: 'none' }} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', marginBottom: '25px' }}>
          <Lock size={20} color="#94a3b8" style={{ marginRight: '10px' }} />
          <input type="password" placeholder="Crear contraseña" style={{ border: 'none', background: 'transparent', color: '#ffffff', width: '100%', outline: 'none' }} />
        </div>
        
        <button 
          onClick={() => setCurrentView('dashboard')}
          style={{ backgroundColor: '#d4af37', color: '#121212', width: '100%', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
        >
          REGISTRARSE
        </button>
      </div>
    </div>
  );

  // VISTA 2: DASHBOARD CLIENTE
  const renderDashboard = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: '#ffffff', margin: 0 }}>¡Hola!</h2>
          <p style={{ color: '#94a3b8', margin: '5px 0 0 0' }}>¿Qué te harás hoy?</p>
        </div>
        <User size={32} color="#d4af37" />
      </div>

      <div 
        onClick={() => { setReservaStep(1); setCurrentView('reserva'); }} 
        style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', marginBottom: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #d4af37' }}
      >
        <div>
          <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>Agendar Cita</h3>
          <p style={{ margin: '5px 0 0 0', color: '#e2e8f0', fontSize: '14px' }}>Reserva tu hora tradicional con tu barbero.</p>
        </div>
        <Calendar size={28} color="#d4af37" />
      </div>

      <div 
        onClick={() => setCurrentView('ia')} 
        style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #d4af37' }}
      >
        <div>
          <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>Escáner IA</h3>
          <p style={{ margin: '5px 0 0 0', color: '#e2e8f0', fontSize: '14px' }}>Descubre el corte ideal para tu rostro.</p>
        </div>
        <Camera size={28} color="#d4af37" />
      </div>
    </div>
  );

  // VISTA 3: FLUJO DE RESERVA
  const renderReserva = () => (
    <div style={{ padding: '20px' }}>
      <button 
        onClick={() => setCurrentView('dashboard')}
        style={{ background: 'transparent', border: 'none', color: '#d4af37', display: 'flex', alignItems: 'center', padding: '0 0 20px 0', cursor: 'pointer', fontSize: '16px' }}
      >
        <ChevronLeft size={20} /> Volver
      </button>

      <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '20px' }}>Nueva Reserva</h2>

      {reservaStep === 1 && (
        <div>
          <h3 style={{ color: '#d4af37', fontSize: '14px', letterSpacing: '1px', marginBottom: '15px' }}>1. SELECCIONA SERVICIO</h3>
          
          <button onClick={() => setReservaStep(2)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#d4af37', padding: '15px', borderRadius: '8px', border: 'none', width: '100%', marginBottom: '10px', color: '#121212', cursor: 'pointer' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>Corte Clásico</p>
              <p style={{ margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.8 }}>
                <Clock size={16} /> 30 min
              </p>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>$10.000</div>
          </button>

          <button onClick={() => setReservaStep(2)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#d4af37', padding: '15px', borderRadius: '8px', border: 'none', width: '100%', marginBottom: '10px', color: '#121212', cursor: 'pointer' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>Perfilado Barba</p>
              <p style={{ margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.8 }}>
                <Clock size={16} /> 15 min
              </p>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>$5.000</div>
          </button>

          <button onClick={() => setReservaStep(2)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#d4af37', padding: '15px', borderRadius: '8px', border: 'none', width: '100%', marginBottom: '10px', color: '#121212', cursor: 'pointer' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>Corte + Barba</p>
              <p style={{ margin: 0, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.8 }}>
                <Clock size={16} /> 45 min
              </p>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>$14.000</div>
          </button>
        </div>
      )}

      {reservaStep === 2 && (
        <div>
          <h3 style={{ color: '#d4af37', fontSize: '14px', letterSpacing: '1px', marginBottom: '15px' }}>2. HORAS DISPONIBLES (Hoy)</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={() => setReservaStep(3)} style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '15px', borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer', fontSize: '16px' }}>10:00 AM</button>
            <button style={{ backgroundColor: '#0f172a', color: '#475569', padding: '15px', borderRadius: '8px', border: '1px solid #1e293b', cursor: 'not-allowed', fontSize: '16px', textDecoration: 'line-through' }}>11:00 AM</button>
            <button onClick={() => setReservaStep(3)} style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '15px', borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer', fontSize: '16px' }}>12:30 PM</button>
            <button onClick={() => setReservaStep(3)} style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '15px', borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer', fontSize: '16px' }}>15:00 PM</button>
          </div>
        </div>
      )}

      {reservaStep === 3 && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <CheckCircle2 size={64} color="#d4af37" style={{ margin: '0 auto 20px auto' }} />
          <h2 style={{ color: '#ffffff' }}>¡Reserva Confirmada!</h2>
          <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Te enviamos un mensaje de confirmación vía SMS con los detalles.</p>
          <button 
            onClick={() => setCurrentView('dashboard')}
            style={{ backgroundColor: '#d4af37', color: '#121212', width: '100%', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            VOLVER AL INICIO
          </button>
        </div>
      )}
    </div>
  );

  // VISTA 4: ESCÁNER IA DE VISAGISMO
  const renderIA = () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <button 
        onClick={() => setCurrentView('dashboard')}
        style={{ background: 'transparent', border: 'none', color: '#d4af37', display: 'flex', alignItems: 'center', padding: '0 0 20px 0', cursor: 'pointer', fontSize: '16px' }}
      >
        <ChevronLeft size={20} /> Volver
      </button>

      <h2 style={{ color: '#d4af37', marginBottom: '20px' }}>Asesor de Estilo IA</h2>
      
      <div style={{ backgroundColor: '#1e293b', padding: '40px 20px', borderRadius: '10px', marginBottom: '20px', border: '2px dashed #475569' }}>
        <Camera size={48} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
        <p style={{ color: '#ffffff', margin: 0 }}>Cámara en Vivo</p>
        <p style={{ color: '#64748b', fontSize: '12px', marginTop: '10px' }}>Centra tu rostro en el marco</p>
      </div>

      <button style={{ backgroundColor: '#d4af37', color: '#121212', width: '100%', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginBottom: '15px' }}>
        ESCANEAR ROSTRO
      </button>

      <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', textAlign: 'left' }}>
        <p style={{ color: '#ef4444', fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Lock size={12} /> *Por privacidad, tu foto no se guarda en nuestros servidores.
        </p>
      </div>
    </div>
  );

  // RENDERIZADO PRINCIPAL
  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#020617', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {currentView === 'login' && renderLogin()}
      {currentView === 'registro' && renderRegistro()}
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'reserva' && renderReserva()}
      {currentView === 'ia' && renderIA()}
    </div>
  );
}