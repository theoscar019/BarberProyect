import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, ChevronLeft, ScanFace, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';

export default function EscanerRostro({ onVolver }) {
  const [stream, setStream] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef(null);

  const GOLD = "#C8A951";
  const CARD_BG = "#111111";
  const BORDER = "#222222";
  const TEXT_MUTED = "#888888";

  // Cargar los modelos de IA desde el repositorio oficial al abrir el componente
  useEffect(() => {
    const cargarModelos = async () => {
      try {
        // Enlace oficial de GitHub Pages que permite CORS
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        ]);
        
        setModelsLoaded(true);
        iniciarCamara();
      } catch (error) {
        console.error("Error cargando modelos de IA:", error);
        alert("Error al cargar la IA. Revisa tu conexión a internet o la consola (F12).");
      }
    };
    cargarModelos();

    return () => detenerCamara();
  }, []);

  const iniciarCamara = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      alert("No se pudo acceder a la cámara. Revisa los permisos de tu navegador.");
    }
  };

  const detenerCamara = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const realizarEscaneoReal = async () => {
    if (!videoRef.current) return;
    setIsScanning(true);

    try {
      // 1. La IA detecta el rostro y mapea los 68 puntos faciales
      const detection = await faceapi.detectSingleFace(
        videoRef.current, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

      if (!detection) {
        alert("No se detectó ningún rostro. Por favor, mira directamente a la cámara y asegúrate de tener buena luz.");
        setIsScanning(false);
        return;
      }

      // 2. Extraer dimensiones matemáticas reales del rostro
      const landmarks = detection.landmarks;
      const jawOutline = landmarks.getJawOutline();
      
      // Cálculo de distancias (ancho de mandíbula vs altura del rostro)
      const anchoRostro = faceapi.euclideanDistance([jawOutline[0].x, jawOutline[0].y], [jawOutline[16].x, jawOutline[16].y]);
      const alturaRostro = faceapi.euclideanDistance([landmarks.getNose()[0].x, landmarks.getNose()[0].y], [jawOutline[8].x, jawOutline[8].y]) * 2; 
      
      const proporcion = alturaRostro / anchoRostro;

      // 3. Algoritmo de clasificación según geometría real
      let resultado = {};
      
      if (proporcion > 1.35) {
        resultado = {
          tipo: 'Ovalado / Alargado',
          descripcion: 'Tu rostro tiene mayor longitud que anchura, con proporciones simétricas.',
          corte: 'Pompadour o Fade Clásico',
          tip: 'Casi cualquier corte te queda bien. Evita el flequillo muy largo o demasiado volumen arriba para no alargarlo más.'
        };
      } else if (proporcion < 1.15) {
        resultado = {
          tipo: 'Cuadrado / Redondo',
          descripcion: 'El ancho y alto de tu rostro son casi iguales.',
          corte: 'Fade Alto con volumen superior',
          tip: 'Busca cortes con volumen arriba y muy cortos a los lados (Fade) para dar la ilusión de un rostro más alargado.'
        };
      } else {
        resultado = {
          tipo: 'Diamante',
          descripcion: 'Tus pómulos son la parte más ancha de tu rostro.',
          corte: 'French Crop o Flequillo texturizado',
          tip: 'Deja algo de peso en los lados y flequillo para equilibrar el ancho de los pómulos.'
        };
      }

      setScanResult(resultado);
      detenerCamara();
    } catch (error) {
      console.error("Error en el escaneo:", error);
      alert("Hubo un error procesando el rostro.");
    } finally {
      setIsScanning(false);
    }
  };

  const reiniciarEscaner = () => {
    setScanResult(null);
    iniciarCamara();
  };

  return (
    <div style={{ padding: '30px 25px', animation: 'fadeIn 0.5s ease-out' }}>
      <button onClick={() => { detenerCamara(); onVolver(); }} style={{ background: 'transparent', border: 'none', color: TEXT_MUTED, display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '30px' }}>
        <ChevronLeft size={20} /> Volver
      </button>

      <h2 style={{ color: '#ffffff', marginBottom: '5px', fontSize: '22px' }}>Escáner de Visagismo IA</h2>
      <p style={{ color: TEXT_MUTED, marginBottom: '30px', fontSize: '14px' }}>Mapeo facial en tiempo real para recomendar tu corte ideal.</p>

      {!modelsLoaded ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Loader2 size={40} color={GOLD} style={{ animation: 'spin 2s linear infinite', margin: '0 auto 20px auto' }} />
          <p style={{ color: GOLD }}>Cargando redes neuronales...</p>
        </div>
      ) : !scanResult ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '100%', height: '350px', backgroundColor: CARD_BG, borderRadius: '8px', overflow: 'hidden', border: `2px solid ${isScanning ? GOLD : BORDER}`, marginBottom: '25px' }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isScanning ? 0.5 : 1, transition: 'opacity 0.3s' }} />
            {isScanning && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <ScanFace size={50} color={GOLD} style={{ animation: 'pulse 1.5s infinite' }} />
                <p style={{ color: GOLD, fontWeight: 'bold', marginTop: '10px' }}>CALCULANDO PROPORCIONES...</p>
              </div>
            )}
          </div>
          <button onClick={realizarEscaneoReal} disabled={isScanning} style={{ backgroundColor: GOLD, color: '#000', width: '100%', padding: '16px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: isScanning ? 'not-allowed' : 'pointer' }}>
            {isScanning ? 'Midiendo puntos faciales...' : 'INICIAR ESCANEO REAL'}
          </button>
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
          <div style={{ backgroundColor: CARD_BG, padding: '25px', borderRadius: '8px', border: `1px solid ${GOLD}`, textAlign: 'center', marginBottom: '20px' }}>
            <CheckCircle2 size={50} color={GOLD} style={{ margin: '0 auto 15px auto' }} />
            <h3 style={{ color: '#fff', fontSize: '20px', margin: '0 0 5px 0' }}>{scanResult.tipo}</h3>
            <p style={{ color: TEXT_MUTED, fontSize: '14px', margin: '0 0 20px 0' }}>{scanResult.descripcion}</p>
            <div style={{ backgroundColor: '#050505', padding: '15px', borderRadius: '6px', border: `1px solid ${BORDER}` }}>
              <h4 style={{ color: GOLD, margin: '0 0 10px 0', fontSize: '13px', letterSpacing: '1px' }}>CORTE IDEAL:</h4>
              <p style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0' }}>{scanResult.corte}</p>
              <p style={{ color: TEXT_MUTED, fontSize: '13px', margin: 0 }}>{scanResult.tip}</p>
            </div>
          </div>
          <button onClick={reiniciarEscaner} style={{ backgroundColor: 'transparent', color: '#fff', width: '100%', padding: '16px', borderRadius: '4px', border: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
            <RefreshCw size={18} style={{ marginRight: '10px' }} /> Escanear otro rostro
          </button>
        </div>
      )}
    </div>
  );
}