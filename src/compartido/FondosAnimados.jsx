import { useMemo } from 'react';

function azar(semilla) {
  let x = semilla;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

function lista(n, semilla, fabricar) {
  const r = azar(semilla);
  return Array.from({ length: n }, (_, i) => fabricar(r, i));
}

function Aurora() {
  return (
    <>
      <div className="an-blob an-b1" />
      <div className="an-blob an-b2" />
      <div className="an-blob an-b3" />
    </>
  );
}

function Polvo() {
  const p = useMemo(() => lista(30, 11, (r) => ({ x: r() * 100, tam: 8 + r() * 30, dur: 16 + r() * 22, ret: -r() * 36, dx: (r() - 0.5) * 160, op: 0.35 + r() * 0.5 })), []);
  return p.map((a, i) => <i key={i} className="an-polvo" style={{ left: `${a.x}%`, width: a.tam, height: a.tam, '--dur': `${a.dur}s`, '--ret': `${a.ret}s`, '--dx': `${a.dx}px`, '--op': a.op }} />);
}

function Brasas() {
  const p = useMemo(() => lista(62, 23, (r) => ({ x: r() * 100, tam: 4 + r() * 12, dur: 6 + r() * 9, ret: -r() * 15, dx: (r() - 0.35) * 260, op: 0.6 + r() * 0.4 })), []);
  return (
    <>
      <div className="an-calor" />
      {p.map((a, i) => <i key={i} className="an-brasa" style={{ left: `${a.x}%`, width: a.tam, height: a.tam, '--dur': `${a.dur}s`, '--ret': `${a.ret}s`, '--dx': `${a.dx}px`, '--op': a.op }} />)}
    </>
  );
}

function Estrellas() {
  const p = useMemo(() => lista(110, 37, (r) => ({ x: r() * 100, y: r() * 100, tam: 2 + r() * 4, dur: 2.5 + r() * 5, ret: -r() * 7, op: 0.4 + r() * 0.6 })), []);
  return (
    <div className="an-cielo">
      {p.map((a, i) => <i key={i} className="an-estrella" style={{ left: `${a.x}%`, top: `${a.y}%`, width: a.tam, height: a.tam, '--dur': `${a.dur}s`, '--ret': `${a.ret}s`, '--op': a.op }} />)}
    </div>
  );
}

function Olas() {
  const onda = (alto, fase) => {
    let d = `M0 ${alto}`;
    for (let x = 0; x <= 3840; x += 120) d += ` L${x} ${alto + Math.sin((x / 3840) * Math.PI * 8 + fase) * 36}`;
    return `${d} L3840 1080 L0 1080 Z`;
  };
  return (
    <>
      {[[640, 0, 'an-ola1'], [730, 1.6, 'an-ola2'], [830, 3.1, 'an-ola3']].map(([alto, fase, cls]) => (
        <svg key={cls} className={`an-ola ${cls}`} viewBox="0 0 3840 1080" preserveAspectRatio="none" aria-hidden="true"><path d={onda(alto, fase)} /></svg>
      ))}
    </>
  );
}

function Giro() {
  return (
    <>
      <div className="an-giro" />
      <div className="an-resplandor" />
    </>
  );
}

function Nubes() {
  const n = useMemo(() => lista(7, 51, (r, i) => ({ y: 8 + r() * 80, ancho: 700 + r() * 800, alto: 220 + r() * 220, dur: 90 + r() * 120, ret: -r() * 200, op: 0.24 + r() * 0.22, i })), []);
  return n.map((a) => <i key={a.i} className="an-nube" style={{ top: `${a.y}%`, width: a.ancho, height: a.alto, '--dur': `${a.dur}s`, '--ret': `${a.ret}s`, '--op': a.op }} />);
}

const ANIMACIONES = { aurora: Aurora, polvo: Polvo, brasas: Brasas, estrellas: Estrellas, olas: Olas, giro: Giro, nubes: Nubes };

export default function AnimadoFondo({ f, estatico }) {
  const Pieza = ANIMACIONES[f.animacion] || Aurora;
  const vel = 1 / Math.max(0.25, Number(f.velocidad) || 1);
  return (
    <div className={`esc-anim an-${f.animacion}${estatico ? ' quieto' : ''}`} style={{ '--c1': f.color, '--c2': f.color2, '--c3': f.color3, '--vel': vel }}>
      <Pieza />
    </div>
  );
}
