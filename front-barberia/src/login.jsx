// Ejemplo en tu componente de React (ej. Login.jsx o App.jsx)
import React, { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Esta función se ejecuta cuando el usuario presiona "Iniciar Sesión"
  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    try {
      // AQUÍ ESTÁ LA CONEXIÓN AL BACKEND
      const response = await fetch('http://localhost:3000/api/login', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Enviamos los datos que el usuario escribió
        body: JSON.stringify({ email, password }), 
      });

      const data = await response.json();

      if (response.ok) {
        console.log("¡Login exitoso!", data);
        // Aquí podrías guardar el token y redirigir al AdminView o BarberView
      } else {
        console.error("Error al iniciar sesión:", data.message);
        alert("Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error de red o el servidor está apagado:", error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        placeholder="Correo" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Contraseña" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">Iniciar Sesión</button>
    </form>
  );
}

export default Login;