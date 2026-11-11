import React, { useEffect, useRef, useState } from 'react';
import { Camera, ChevronLeft, Lock } from 'lucide-react';
import { analizarRostro } from './visagismo';

// El código y el modelo de MediaPipe se descargan la primera vez que se usa el escáner.
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODELO_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

const estiloBotonDorado = {
  backgroundColor: '#d4af37',
  color: '#121212',
  width: '100%',
  padding: '14px',
  borderRadius: '8px',
  border: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
  cursor: 'pointer',
  marginBottom: '15px',
};

export default function EscanerRostro({ onVolver }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);

  const [acepta, setAcepta] = useState(false);
  const [fase, setFase] = useState('inicio'); // inicio | cargando | camara | resultado
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);

  function apagarCamara() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  // Al salir de la pantalla se apaga la cámara y se libera el detector.
  useEffect(() => {
    return () => {
      apagarCamara();
      if (detectorRef.current) {
        detectorRef.current.close();
        detectorRef.current = null;
      }
    };
  }, []);

  async function activarCamara() {
    setError('');
    setResultado(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Tu navegador no permite usar la cámara. Prueba con Chrome o Edge.');
      return;
    }
    setFase('cargando');
    try {
      // 1) Cargar el detector (solo la primera vez)
      if (!detectorRef.current) {
        const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        detectorRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODELO_URL },
          runningMode: 'IMAGE',
          numFaces: 1,
        });
      }
      // 2) Encender la cámara frontal
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      setFase('camara');
    } catch (e) {
      apagarCamara();
      setFase('inicio');
      if (e && (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError')) {
        setError('Necesitamos permiso para usar la cámara. Actívalo en el navegador e inténtalo de nuevo.');
      } else if (e && e.name === 'NotFoundError') {
        setError('No se encontró ninguna cámara en este dispositivo.');
      } else {
        setError('No se pudo iniciar el escáner. Revisa tu conexión a internet e inténtalo de nuevo.');
      }
    }
  }

  // Cuando aparece el <video>, se le conecta la cámara.
  useEffect(() => {
    if (fase === 'camara' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [fase]);

  function escanear() {
    const video = videoRef.current;
    if (!video || !detectorRef.current || !video.videoWidth) {
      setError('La cámara todavía no está lista. Espera un segundo e inténtalo de nuevo.');
      return;
    }
    setError('');
    try {
      const deteccion = detectorRef.current.detect(video);
      const puntos = deteccion.faceLandmarks && deteccion.faceLandmarks[0];
      if (!puntos) {
        setError('No detectamos ningún rostro. Mejora la luz y centra tu cara en el marco.');
        return;
      }
      const analisis = analizarRostro(puntos, video.videoWidth, video.videoHeight);
      if (!analisis.ok) {
        setError(analisis.motivo);
        return;
      }
      // La foto nunca se guarda ni se envía: solo se usan los puntos para medir y luego se apaga la cámara.
      apagarCamara();
      setResultado(analisis);
      setFase('resultado');
    } catch {
      setError('Ocurrió un error al analizar el rostro. Inténtalo de nuevo.');
    }
  }

  function reiniciar() {
    setResultado(null);
    setError('');
    setFase('inicio');
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <button
        onClick={onVolver}
        style={{ background: 'transparent', border: 'none', color: '#d4af37', display: 'flex', alignItems: 'center', padding: '0 0 20px 0', cursor: 'pointer', fontSize: '16px' }}
      >
        <ChevronLeft size={20} /> Volver
      </button>

      <h2 style={{ color: '#d4af37', marginBottom: '20px' }}>Asesor de Estilo IA</h2>

      {fase === 'camara' ? (
        <div style={{ position: 'relative', marginBottom: '20px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#000' }}>
          <video
            ref={videoRef}
            playsInline
            muted
            style={{ width: '100%', display: 'block', transform: 'scaleX(-1)' }}
          />
          <div
            style={{
              position: 'absolute',
              top: '8%',
              left: '25%',
              width: '50%',
              height: '84%',
              border: '2px dashed #d4af37',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
        </div>
      ) : fase === 'resultado' && resultado ? (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', marginBottom: '20px', textAlign: 'left' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0, letterSpacing: '1px' }}>TU FORMA DE ROSTRO</p>
          <h3 style={{ color: '#d4af37', fontSize: '28px', margin: '5px 0 10px 0' }}>{resultado.forma}</h3>
          <p style={{ color: '#e2e8f0', margin: '0 0 15px 0', fontSize: '14px' }}>{resultado.descripcion}</p>
          <p style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '14px', margin: '0 0 6px 0' }}>Cortes recomendados</p>
          <ul style={{ color: '#e2e8f0', fontSize: '14px', margin: '0 0 15px 0', paddingLeft: '20px' }}>
            {resultado.cortes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            <strong>Mejor evitar:</strong> {resultado.evitar}
          </p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#1e293b', padding: '40px 20px', borderRadius: '10px', marginBottom: '20px', border: '2px dashed #475569' }}>
          <Camera size={48} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
          <p style={{ color: '#ffffff', margin: 0 }}>{fase === 'cargando' ? 'Preparando el escáner…' : 'Cámara en Vivo'}</p>
          <p style={{ color: '#64748b', fontSize: '12px', marginTop: '10px' }}>
            {fase === 'cargando' ? 'La primera vez puede tardar unos segundos.' : 'Centra tu rostro en el marco'}
          </p>
        </div>
      )}

      {error && (
        <p role="alert" style={{ color: '#fca5a5', fontSize: '14px', margin: '0 0 15px 0' }}>
          {error}
        </p>
      )}

      {fase === 'inicio' && (
        <>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#e2e8f0', fontSize: '13px', textAlign: 'left', marginBottom: '15px', cursor: 'pointer' }}>
            <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} style={{ marginTop: '2px' }} />
            <span>Acepto que la cámara analice mi rostro en este dispositivo para recomendarme un corte.</span>
          </label>
          <button
            onClick={activarCamara}
            disabled={!acepta}
            style={{ ...estiloBotonDorado, opacity: acepta ? 1 : 0.5, cursor: acepta ? 'pointer' : 'not-allowed' }}
          >
            ACTIVAR CÁMARA
          </button>
        </>
      )}
      {fase === 'camara' && (
        <button onClick={escanear} style={estiloBotonDorado}>
          ESCANEAR ROSTRO
        </button>
      )}
      {fase === 'resultado' && (
        <button onClick={reiniciar} style={estiloBotonDorado}>
          ESCANEAR DE NUEVO
        </button>
      )}

      <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', textAlign: 'left' }}>
        <p style={{ color: '#ef4444', fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Lock size={12} /> *Por privacidad, tu foto no se guarda ni sale de tu dispositivo.
        </p>
      </div>
    </div>
  );
}
