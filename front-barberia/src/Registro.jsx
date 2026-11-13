import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight, ChevronLeft } from 'lucide-react';

export default function Registro({ onVolver }) {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: ''
  });

  const GOLD = "#C8A951";
  const CARD_BG = "#111111";
  const BORDER = "#222222";
  const TEXT_MUTED = "#888888";
  const API_URL = 'https://barberproyect.onrender.com/api'; 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre: formData.nombre, 
          email: formData.correo, 
          password: formData.password, 
          rol_id: 1 // Rol 1 = Cliente normal
        })
      });
      
      if (response.ok) {
        alert("¡Registro exitoso! Ya puedes iniciar sesión.");
        onVolver(); // Devuelve al usuario a la pantalla de login
      } else {
        alert("Hubo un error al registrar el usuario.");
      }
    } catch (error) {
      alert("Error de conexión con el backend.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      
      {/* Botón Volver */}
      <div style={{ width: '100%', maxWidth: '400px', marginBottom: '20px' }}>
        <button onClick={onVolver} style={{ background: 'transparent', border: 'none', color: TEXT_MUTED, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <ChevronLeft size={20} /> Volver al login
        </button>
      </div>

      <div style={{ backgroundColor: CARD_BG, padding: '40px', borderRadius: '12px', border: `1px solid ${BORDER}`, width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h2 style={{ color: GOLD, fontSize: '28px', margin: '0 0 10px 0', letterSpacing: '2px' }}>REGISTRO</h2>
          <p style={{ color: TEXT_MUTED, fontSize: '14px', margin: 0 }}>Crea tu cuenta para agendar cortes y usar la IA.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ position: 'relative' }}>
            <User size={20} color={TEXT_MUTED} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" name="nombre" placeholder="Nombre completo" 
              value={formData.nombre} onChange={handleChange} required
              style={{ width: '100%', padding: '15px 15px 15px 45px', backgroundColor: '#050505', border: `1px solid ${BORDER}`, borderRadius: '6px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'border 0.3s', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.border = `1px solid ${GOLD}`}
              onBlur={(e) => e.target.style.border = `1px solid ${BORDER}`}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Mail size={20} color={TEXT_MUTED} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="email" name="correo" placeholder="Correo electrónico" 
              value={formData.correo} onChange={handleChange} required
              style={{ width: '100%', padding: '15px 15px 15px 45px', backgroundColor: '#050505', border: `1px solid ${BORDER}`, borderRadius: '6px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'border 0.3s', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.border = `1px solid ${GOLD}`}
              onBlur={(e) => e.target.style.border = `1px solid ${BORDER}`}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} color={TEXT_MUTED} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="password" name="password" placeholder="Contraseña" 
              value={formData.password} onChange={handleChange} required
              style={{ width: '100%', padding: '15px 15px 15px 45px', backgroundColor: '#050505', border: `1px solid ${BORDER}`, borderRadius: '6px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'border 0.3s', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.border = `1px solid ${GOLD}`}
              onBlur={(e) => e.target.style.border = `1px solid ${BORDER}`}
            />
          </div>

          <button type="submit" style={{ marginTop: '10px', backgroundColor: GOLD, color: '#000', padding: '16px', borderRadius: '6px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'transform 0.2s', width: '100%' }}>
            CREAR CUENTA <ArrowRight size={20} style={{ marginLeft: '10px' }} />
          </button>
        </form>
      </div>
    </div>
  );
}