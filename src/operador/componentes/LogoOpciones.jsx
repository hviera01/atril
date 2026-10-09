import { useEffect, useRef, useState } from 'react';
import Icono from './Iconos';
import Escenario from '../../compartido/Escenario';
import { Interruptor } from './Modal';

export const FORMAS_LOGO = [
  { v: 'ninguno', t: 'Sin logo' },
  { v: 'redondo', t: 'Redondo con marco' },
  { v: 'simple', t: 'Sin marco (transparente)' },
  { v: 'banda', t: 'Banda inferior con el nombre' },
  { v: 'centro', t: 'Marca de agua grande al centro' },
];

const POSICIONES = [
  { v: 'sup-izq', t: 'Arriba a la izquierda' },
  { v: 'sup-centro', t: 'Arriba al centro' },
  { v: 'sup-der', t: 'Arriba a la derecha' },
  { v: 'inf-izq', t: 'Abajo a la izquierda' },
  { v: 'inf-centro', t: 'Abajo al centro' },
  { v: 'inf-der', t: 'Abajo a la derecha' },
];

export const LOGO_INICIAL = { forma: 'ninguno', esquina: 'inf-der', tam: 150, opacidad: 0.95 };

export default function LogoOpciones({ medio, alCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const [comoDefecto, setComoDefecto] = useState(false);
  const raiz = useRef(null);
  const logo = { ...LOGO_INICIAL, ...(medio.logo || {}) };

  useEffect(() => {
    if (!abierto) return;
    const f = (e) => { if (raiz.current && !raiz.current.contains(e.target)) setAbierto(false); };
    window.addEventListener('mousedown', f);
    return () => window.removeEventListener('mousedown', f);
  }, [abierto]);

  const poner = (cambios) => alCambiar({ ...logo, ...cambios }, comoDefecto);
  const usaPosicion = logo.forma === 'redondo' || logo.forma === 'simple';

  return (
    <div className="logo-op" ref={raiz}>
      <button className={`btn${logo.forma !== 'ninguno' ? ' btn-oro' : ''}`} onClick={() => setAbierto((a) => !a)}>
        <Icono n="logo" t={16} /> Logo{logo.forma !== 'ninguno' ? ': sí' : ''}
      </button>
      {abierto && (
        <div className="logo-pop">
          <div className="logo-vista">
            <Escenario frame={{ modo: 'contenido', contenido: { tipo: medio.tipo, src: medio.src, logo } }} tema={{}} estatico silenciar />
          </div>
          <label className="campo">
            <span className="campo-et">Cómo se ve el logo</span>
            <select value={logo.forma} onChange={(e) => poner({ forma: e.target.value })}>
              {FORMAS_LOGO.map((f) => <option key={f.v} value={f.v}>{f.t}</option>)}
            </select>
          </label>
          {usaPosicion && (
            <label className="campo">
              <span className="campo-et">Dónde</span>
              <select value={logo.esquina} onChange={(e) => poner({ esquina: e.target.value })}>
                {POSICIONES.map((p) => <option key={p.v} value={p.v}>{p.t}</option>)}
              </select>
            </label>
          )}
          {logo.forma !== 'ninguno' && (
            <>
              <label className="campo rango">
                <span className="campo-et">Tamaño<b>{logo.tam}</b></span>
                <input type="range" min={80} max={340} step={5} value={logo.tam} onChange={(e) => poner({ tam: Number(e.target.value) })} />
              </label>
              <label className="campo rango">
                <span className="campo-et">Opacidad<b>{Math.round(logo.opacidad * 100)}%</b></span>
                <input type="range" min={0.2} max={1} step={0.05} value={logo.opacidad} onChange={(e) => poner({ opacidad: Number(e.target.value) })} />
              </label>
            </>
          )}
          <Interruptor valor={comoDefecto} alCambiar={(v) => { setComoDefecto(v); if (v) alCambiar(logo, true); }} etiqueta="Usar esto en todas las imágenes y videos nuevos" />
        </div>
      )}
    </div>
  );
}
