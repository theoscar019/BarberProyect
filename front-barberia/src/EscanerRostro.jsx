import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { ChevronLeft, ScanFace, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    const cargarModelos = async () => {
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        iniciarCamara();
      } catch (error) {
        alert("Error al cargar la IA. Revisa tu conexión a internet.");
      }
    };
    cargarModelos();

    return () => detenerCamara();
  }, []);

  const iniciarCamara = async () => {
    try {
      // Ajustado a "video: true" para que acepte la cámara virtual de OBS sin problemas
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      alert("No se pudo acceder a la cámara.");
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
      const detection = await faceapi.detectSingleFace(
        videoRef.current, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

      if (!detection) {
        alert("No se detectó ningún rostro. Por favor, mira directamente a la cámara.");
        setIsScanning(false);
        return;
      }

      const puntos = detection.landmarks.positions;
      
      // 1. Largo del rostro (desde el entrecejo hasta el mentón)
      const entrecejoY = (puntos[21].y + puntos[22].y) / 2;
      const mentonY = puntos[8].y;
      const largoRostro = mentonY - entrecejoY;

      // 2. Ancho de los pómulos (puntos 0 y 16 son los extremos del rostro)
      const anchoPomulos = puntos[16].x - puntos[0].x;

      // 3. Ancho de la mandíbula (puntos 4 y 12)
      const anchoMandibula = puntos[12].x - puntos[4].x;

      // Calculamos las proporciones reales
      const proporcionLargoAncho = largoRostro / anchoPomulos;
      const proporcionPomuloMandibula = anchoPomulos / anchoMandibula;

      // Esto te mostrará las medidas exactas en la consola (F12) para que las revises con OBS
      console.log("Largo/Ancho:", proporcionLargoAncho.toFixed(2));
      console.log("Pómulo/Mandíbula:", proporcionPomuloMandibula.toFixed(2));

      let resultado = {};
      
      // Lógica matemática ajustada a la medida desde el entrecejo
      if (proporcionPomuloMandibula >= 1.15 && proporcionLargoAncho >= 0.90 && proporcionLargoAncho < 1.10) {
        resultado = {
          tipo: 'Diamante',
          descripcion: 'Tus pómulos son la parte más ancha de tu rostro, con barbilla en punta.',
          corte: 'French Crop o Flequillo texturizado',
          tip: 'Deja algo de peso en los lados y flequillo para equilibrar el ancho.'
        };
      } else if (proporcionLargoAncho >= 1.10) {
        resultado = {
          tipo: 'Ovalado / Alargado',
          descripcion: 'Tu rostro tiene mayor longitud que anchura, con proporciones simétricas.',
          corte: 'Pompadour o Fade Clásico',
          tip: 'Casi cualquier corte te queda bien. Evita el flequillo muy largo.'
        };
      } else {
        resultado = {
          tipo: 'Cuadrado / Redondo',
          descripcion: 'El ancho y alto de tu rostro son muy similares.',
          corte: 'Fade Alto con volumen superior',
          tip: 'Busca cortes con volumen arriba y muy cortos a los lados para alargar el rostro visualmente.'
        };
      }

      setScanResult(resultado);
      detenerCamara();
    } catch (error) {
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
                <p style={{ color: GOLD, fontWeight: 'bold', marginTop: '10px' }}>CALCULANDO...</p>
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