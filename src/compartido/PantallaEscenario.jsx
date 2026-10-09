import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TextoAjustado } from './Escenario';
import { completarTema } from './temas';
import './escenario.css';

const ANCHO = 1920;

function resumen(c) {
  if (!c) return { etiqueta: '', cuerpo: <span className="st-vacio">—</span>, clave: '' };
  if (c.tipo === 'versiculo') {
    const cuerpo = c.partes.length > 1
      ? c.partes.map((p, i) => <span key={i}><sup className="esc-num">{p.n}</sup>{p.t}{' '}</span>)
      : c.partes[0].t;
    return { etiqueta: c.referencia, cuerpo, clave: c.referencia + c.partes.length };
  }
  if (c.tipo === 'letra' || c.tipo === 'texto') {
    return { etiqueta: c.titulo || '', cuerpo: c.lineas.map((l, i) => <div key={i} className="esc-linea-letra">{l}</div>), clave: c.lineas.join('|') };
  }
  if (c.tipo === 'temporizador') return { etiqueta: 'Cuenta regresiva', cuerpo: `${c.titulo || ''} ${c.minutos} min`.trim(), clave: 't' };
  return { etiqueta: 'Imagen', cuerpo: 'Imagen', clave: 'i' };
}

function Reloj() {
  const [ahora, setAhora] = useState(new Date());
  useEffect(() => {
    const h = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(h);
  }, []);
  return <span className="st-reloj">{ahora.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>;
}

export default function PantallaEscenario({ actual, siguiente, tema, modo }) {
  const raiz = useRef(null);
  const [escala, setEscala] = useState(0.3);
  useLayoutEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const medir = () => setEscala(el.clientWidth / ANCHO);
    medir();
    const o = new ResizeObserver(medir);
    o.observe(el);
    return () => o.disconnect();
  }, []);

  const base = completarTema(tema);
  const tAhora = completarTema({ ...base, texto: { ...base.texto, color: '#f6eddc', alinear: 'left', max: 124, min: 28, sombra: 0, interlineado: 1.2, mayus: false } });
  const tSigue = completarTema({ ...base, texto: { ...base.texto, color: '#b3a58d', alinear: 'left', max: 62, min: 22, sombra: 0, interlineado: 1.2, mayus: false } });
  const a = resumen(actual);
  const s = resumen(siguiente);
  const aviso = modo === 'negro' ? 'Pantalla en negro' : modo === 'logo' ? 'Mostrando el logo' : '';

  return (
    <div className="esc esc-stage" ref={raiz}>
      <div className="esc-lienzo" style={{ transform: `scale(${escala})` }}>
        <div className="st-barra">
          <span className="st-et">Ahora</span>
          <span className="st-ref">{a.etiqueta}</span>
          {aviso && <span className="st-aviso">{aviso}</span>}
          <Reloj />
        </div>
        <div className="st-actual">
          <div className="esc-caja"><TextoAjustado t={tAhora} clave={a.clave}>{a.cuerpo}</TextoAjustado></div>
        </div>
        <div className="st-division" />
        <div className="st-sigue">
          <div className="st-sigue-cab"><span className="st-et">Sigue</span><span className="st-ref">{s.etiqueta}</span></div>
          <div className="esc-caja"><TextoAjustado t={tSigue} clave={s.clave}>{s.cuerpo}</TextoAjustado></div>
        </div>
      </div>
    </div>
  );
}
