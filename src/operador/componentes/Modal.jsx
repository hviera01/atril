import { useEffect } from 'react';
import Icono from './Iconos';

export function Modal({ titulo, ancho = 560, alCerrar, children, pie }) {
  useEffect(() => {
    const f = (e) => { if (e.key === 'Escape') { e.stopPropagation(); alCerrar(); } };
    window.addEventListener('keydown', f, true);
    return () => window.removeEventListener('keydown', f, true);
  }, [alCerrar]);
  return (
    <div className="modal-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget) alCerrar(); }}>
      <div className="modal" style={{ width: ancho }} role="dialog" aria-label={titulo}>
        <div className="modal-cab">
          <h2>{titulo}</h2>
          <button className="icono-btn" onClick={alCerrar} title="Cerrar"><Icono n="cerrar" /></button>
        </div>
        <div className="modal-cuerpo">{children}</div>
        {pie ? <div className="modal-pie">{pie}</div> : null}
      </div>
    </div>
  );
}

export function Campo({ etiqueta, ayuda, children }) {
  return (
    <label className="campo">
      <span className="campo-et">{etiqueta}</span>
      {children}
      {ayuda ? <span className="campo-ayuda">{ayuda}</span> : null}
    </label>
  );
}

export function Segmentos({ valor, opciones, alCambiar }) {
  return (
    <div className="segmentos">
      {opciones.map((o) => (
        <button key={o.v} type="button" className={valor === o.v ? 'on' : ''} onClick={() => alCambiar(o.v)}>{o.t}</button>
      ))}
    </div>
  );
}

export function Interruptor({ valor, alCambiar, etiqueta }) {
  return (
    <button type="button" className={`interruptor${valor ? ' on' : ''}`} onClick={() => alCambiar(!valor)} role="switch" aria-checked={valor}>
      <span className="interruptor-pista"><span className="interruptor-bola" /></span>
      <span>{etiqueta}</span>
    </button>
  );
}
