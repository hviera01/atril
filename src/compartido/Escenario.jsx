import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { fuenteCss, completarTema } from './temas';
import { IGLESIA } from './iglesia';
import logoRedondo from './logo-redondo.png';
import logoIglesia from './logo-iglesia.png';
import EstiloFondo from './Estilos';
import AnimadoFondo from './FondosAnimados';
import './escenario.css';

const ANCHO = 1920;
const ALTO = 1080;
const VACIO = { tipo: 'vacio' };
const LOGO = { tipo: 'logo' };
const TIPOS_TEXTO = ['versiculo', 'letra', 'texto'];

function estiloTexto(t) {
  const s = t.texto.sombra;
  return {
    fontFamily: fuenteCss(t.texto.fuente),
    fontWeight: t.texto.peso,
    color: t.texto.color,
    textAlign: t.texto.alinear,
    textTransform: t.texto.mayus ? 'uppercase' : 'none',
    fontStyle: t.texto.cursiva ? 'italic' : 'normal',
    lineHeight: t.texto.interlineado,
    fontVariantNumeric: 'lining-nums',
    textShadow: s > 0 ? `0 4px ${Math.round(28 * s)}px rgba(0,0,0,${0.55 * s}), 0 2px 5px rgba(0,0,0,${0.45 * s})` : 'none',
  };
}

function estiloReferencia(t) {
  const r = t.referencia;
  return {
    fontFamily: fuenteCss(r.fuente),
    fontWeight: r.peso,
    color: r.color,
    fontSize: r.tam,
    letterSpacing: `${r.espaciado}em`,
    textTransform: r.mayus ? 'uppercase' : 'none',
    textAlign: t.texto.alinear,
    fontVariantNumeric: 'lining-nums',
  };
}

const MIN_SIN_CORTES = 70;

export function TextoAjustado({ t, clave, sinCortes, columnas, capitular, children }) {
  const ref = useRef(null);
  const ajustar = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const caja = el.parentElement;
    const cabe = () => el.offsetHeight <= caja.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1;
    const buscar = (minimo) => {
      let lo = minimo;
      let hi = t.texto.max;
      el.style.fontSize = `${hi}px`;
      if (cabe()) return hi;
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        el.style.fontSize = `${mid}px`;
        if (cabe()) lo = mid; else hi = mid - 1;
      }
      return lo;
    };
    el.classList.remove('sin-cortes');
    if (sinCortes) {
      el.classList.add('sin-cortes');
      const tam = buscar(MIN_SIN_CORTES);
      el.style.fontSize = `${tam}px`;
      if (cabe()) return;
      el.classList.remove('sin-cortes');
    }
    el.style.fontSize = `${buscar(t.texto.min)}px`;
  }, [sinCortes, t.texto.min, t.texto.max, t.texto.fuente, t.texto.peso, t.texto.interlineado, t.texto.mayus, t.texto.cursiva, t.margen.x, t.margen.y]);

  useLayoutEffect(ajustar, [ajustar, clave]);
  useEffect(() => {
    if (!document.fonts || !document.fonts.load) return;
    let vivo = true;
    document.fonts.load(`${t.texto.peso} 40px ${fuenteCss(t.texto.fuente)}`).then(() => { if (vivo) ajustar(); });
    return () => { vivo = false; };
  }, [t.texto.fuente, t.texto.peso, ajustar]);

  return <div ref={ref} className={`esc-texto${columnas ? ' columnas' : ''}${capitular ? ' capitular' : ''}`} style={{ ...estiloTexto(t), '--cap': t.referencia.color }}>{children}</div>;
}

function Adorno({ t }) {
  const color = t.referencia.color;
  if (t.adorno === 'marco') {
    return (
      <>
        <div className="esc-marco" style={{ borderColor: color }} />
        <div className="esc-marco esc-marco-int" style={{ borderColor: color }} />
      </>
    );
  }
  if (t.adorno === 'barra') {
    return <div className="esc-barra" style={{ background: color, left: Math.max(40, t.margen.x - 70) }} />;
  }
  return null;
}

function Referencia({ t, children }) {
  return (
    <div className="esc-ref" style={estiloReferencia(t)}>
      {children}
    </div>
  );
}

function Cuenta({ c, t }) {
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => {
    const h = setInterval(() => setAhora(Date.now()), 200);
    return () => clearInterval(h);
  }, []);
  const restante = Math.max(0, Math.ceil(((c.finEn || ahora) - ahora) / 1000));
  const mm = String(Math.floor(restante / 60)).padStart(2, '0');
  const ss = String(restante % 60).padStart(2, '0');
  return (
    <div className="esc-cuenta">
      {c.titulo ? <Referencia t={t}>{c.titulo}</Referencia> : null}
      <div className="esc-cuenta-num" style={{ ...estiloTexto(t), fontSize: 380, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{mm}:{ss}</div>
    </div>
  );
}

function Ornamento({ color }) {
  return (
    <svg className="lib-ornamento" width="260" height="26" viewBox="0 0 260 26" aria-hidden="true">
      <path d="M0 13H108M152 13H260" stroke={color} strokeWidth="2" opacity=".7" />
      <rect x="121" y="4" width="18" height="18" transform="rotate(45 130 13)" fill={color} />
    </svg>
  );
}

function ContenidoLibro({ c, t }) {
  const clave = JSON.stringify(c);
  const color = t.referencia.color;
  const refEstilo = estiloReferencia(t);
  let cuerpo;
  let largo = false;
  let izquierda = null;
  let cabeceraDer = IGLESIA.nombre;
  if (c.tipo === 'versiculo') {
    cuerpo = c.partes.length > 1
      ? c.partes.map((p, i) => <span key={i}><sup className="esc-num" style={{ color }}>{p.n}</sup>{p.t}{' '}</span>)
      : c.partes[0].t;
    largo = c.partes.reduce((a, p) => a + p.t.length, 0) > 250;
    cabeceraDer = `Santa Biblia · ${c.version || ''}`;
    izquierda = (
      <>
        <div className="lib-libro" style={refEstilo}>{c.libroNombre}</div>
        <div className="lib-capitulo" style={{ fontFamily: fuenteCss(t.texto.fuente), color }}>{c.capitulo}</div>
        <Ornamento color={color} />
        <div className="lib-pie" style={{ ...refEstilo, fontSize: t.referencia.tam * 0.8 }}>{/[-,]/.test(c.rango) ? 'Versículos' : 'Versículo'} {c.rango}</div>
      </>
    );
  } else {
    const lineas = c.lineas;
    cuerpo = lineas.map((l, i) => <div key={i} className="esc-linea-letra">{l}</div>);
    largo = lineas.length > 6 || lineas.join('').length > 260;
    const titulo = c.titulo || '';
    izquierda = (
      <>
        {titulo ? <div className="lib-titulo" style={{ fontFamily: fuenteCss(t.texto.fuente), color: t.texto.color }}>{titulo}</div> : null}
        <Ornamento color={color} />
      </>
    );
  }
  const textoAjustado = (
    <TextoAjustado t={t} clave={clave} sinCortes={c.tipo === 'letra' && !largo} columnas={largo}>{cuerpo}</TextoAjustado>
  );
  return (
    <>
      <div className="lib-cab lib-cab-der" style={refEstilo}>{cabeceraDer}</div>
      {largo ? (
        <>
          <div className="lib-cab lib-cab-izq" style={refEstilo}>{c.tipo === 'versiculo' ? `${c.libroNombre} ${c.capitulo}` : c.titulo || IGLESIA.nombre}</div>
          <div className="lib-doble"><div className="esc-caja col">{textoAjustado}</div></div>
        </>
      ) : (
        <>
          <div className="lib-izq">{izquierda}</div>
          <div className="lib-der"><div className="esc-caja">{textoAjustado}</div></div>
        </>
      )}
    </>
  );
}

function ContenidoTexto({ c, t }) {
  if (t.estilo === 'libro') return <ContenidoLibro c={c} t={t} />;
  const clave = JSON.stringify(c);
  const refArriba = t.referencia.posicion === 'arriba';
  let referencia = null;
  if (c.tipo === 'versiculo' && t.referencia.mostrar) {
    referencia = <Referencia t={t}>{c.referencia}{c.version ? <span className="esc-version"> · {c.version}</span> : null}</Referencia>;
  } else if (c.tipo === 'texto' && c.titulo) {
    referencia = <Referencia t={t}>{c.titulo}</Referencia>;
  }
  const linea = t.adorno === 'linea' && referencia
    ? <div className="esc-linea" style={{ background: t.referencia.color, marginLeft: t.texto.alinear === 'left' ? 0 : 'auto', marginRight: t.texto.alinear === 'left' ? 'auto' : 'auto' }} />
    : null;
  let cuerpo;
  if (c.tipo === 'versiculo') {
    cuerpo = c.partes.length > 1
      ? c.partes.map((p, i) => <span key={i}><sup className="esc-num" style={{ color: t.referencia.color }}>{p.n}</sup>{p.t}{' '}</span>)
      : c.partes[0].t;
  } else {
    cuerpo = c.lineas.map((l, i) => <div key={i} className="esc-linea-letra">{l}</div>);
  }
  return (
    <div className="esc-cuerpo" style={{ padding: `${t.margen.y}px ${t.margen.x}px ${t.margen.abajo ?? t.margen.y}px` }}>
      <Adorno t={t} />
      {refArriba && referencia}
      {refArriba && linea}
      <div className="esc-caja">
        <TextoAjustado t={t} clave={clave} sinCortes={c.tipo === 'letra'} capitular={!!t.texto.capitular && c.tipo === 'versiculo' && c.partes.length === 1}>{cuerpo}</TextoAjustado>
      </div>
      {!refArriba && linea}
      {!refArriba && referencia}
    </div>
  );
}

const POS = {
  'sup-izq': { left: 56, top: 48 },
  'sup-centro': { left: '50%', top: 48, transform: 'translateX(-50%)' },
  'sup-der': { right: 56, top: 48 },
  'inf-izq': { left: 56, bottom: 48 },
  'inf-centro': { left: '50%', bottom: 48, transform: 'translateX(-50%)' },
  'inf-der': { right: 56, bottom: 48 },
};

function LogoSobre({ cfg }) {
  if (!cfg || !cfg.forma || cfg.forma === 'ninguno') return null;
  const tam = cfg.tam || 150;
  const opacidad = cfg.opacidad === undefined ? 0.95 : cfg.opacidad;
  if (cfg.forma === 'banda') {
    return (
      <div className="esc-banda" style={{ opacity: opacidad }}>
        <img src={logoRedondo} alt="" style={{ width: tam, height: tam }} />
        <div className="esc-banda-texto">
          <span className="esc-banda-nombre">{IGLESIA.nombre}</span>
          <span className="esc-banda-suf">{IGLESIA.sufijo}</span>
        </div>
      </div>
    );
  }
  if (cfg.forma === 'centro') {
    return <img className="esc-marca-centro" src={logoIglesia} alt="" style={{ width: tam * 5, opacity: opacidad * 0.5 }} />;
  }
  const simple = cfg.forma === 'simple';
  return (
    <img
      className="esc-marca"
      src={simple ? logoIglesia : logoRedondo}
      alt=""
      style={{ width: tam, height: simple ? 'auto' : tam, opacity: opacidad, filter: simple ? 'drop-shadow(0 4px 14px rgba(0,0,0,.6))' : 'drop-shadow(0 6px 18px rgba(0,0,0,.4))', ...(POS[cfg.esquina] || POS['inf-der']) }}
    />
  );
}

function VideoPantalla({ c, ctx }) {
  const ref = useRef(null);
  const control = ctx.control || {};
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (ctx.estatico || control.pausa) v.pause();
    else v.play().catch(() => {});
  }, [control.pausa, ctx.estatico]);
  useEffect(() => {
    const v = ref.current;
    if (!v || ctx.estatico) return;
    v.currentTime = 0;
    if (!control.pausa) v.play().catch(() => {});
  }, [control.reinicio]);
  const mudo = ctx.estatico || ctx.silenciar || !!control.silencio;
  return <video ref={ref} className="esc-imagen" src={ctx.estatico ? `${c.src}#t=0.1` : c.src} autoPlay={!ctx.estatico} loop={!!c.bucle} muted={mudo} playsInline preload="auto" />;
}

function Contenido({ c, t, ctx }) {
  if (c.tipo === 'vacio') return null;
  if (c.tipo === 'logo') {
    return (
      <div className="esc-logo">
        <img src={logoRedondo} alt="" />
        <div className="esc-logo-nombre" style={{ fontFamily: fuenteCss(t.texto.fuente), color: t.texto.color, fontWeight: t.texto.peso, textShadow: t.texto.sombra > 0 ? '0 4px 24px rgba(0,0,0,.5)' : 'none' }}>{IGLESIA.nombre}</div>
        <div className="esc-logo-suf" style={{ fontFamily: fuenteCss(t.referencia.fuente), color: t.referencia.color, fontWeight: t.referencia.peso }}>{IGLESIA.sufijo}</div>
      </div>
    );
  }
  if (c.tipo === 'imagen') return <><img className="esc-imagen" src={c.src} alt="" /><LogoSobre cfg={c.logo} /></>;
  if (c.tipo === 'video') return <><VideoPantalla c={c} ctx={ctx} /><LogoSobre cfg={c.logo} /></>;
  if (c.tipo === 'temporizador') return <Cuenta c={c} t={t} />;
  return <ContenidoTexto c={c} t={t} />;
}

const RUIDO = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .6 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>\")";

function patronCss(f) {
  const c = f.color3;
  if (f.patron === 'diagonal') return `repeating-linear-gradient(45deg, ${c} 0 2px, transparent 2px 26px)`;
  if (f.patron === 'puntos') return `radial-gradient(${c} 2.6px, transparent 3.2px) 0 0 / 34px 34px`;
  if (f.patron === 'cuadricula') return `linear-gradient(${c} 1.5px, transparent 1.5px) 0 0 / 48px 48px, linear-gradient(90deg, ${c} 1.5px, transparent 1.5px) 0 0 / 48px 48px`;
  if (f.patron === 'ruido') return RUIDO;
  return `repeating-linear-gradient(0deg, ${c} 0 2px, transparent 2px 28px)`;
}

function colorBase(f) {
  if (f.tipo === 'radial') return `radial-gradient(circle at 50% 42%, ${f.color}, ${f.color2} 78%)`;
  if (f.tipo === 'color' || f.tipo === 'imagen' || f.tipo === 'video') return f.color;
  return `linear-gradient(${f.angulo}deg, ${f.color}, ${f.color2})`;
}

function Fondo({ t, estatico }) {
  const f = t.fondo;
  if ((f.tipo === 'imagen' || f.tipo === 'video') && f.medio) {
    const estilo = {
      filter: `blur(${f.desenfoque}px) brightness(${f.brillo}%) saturate(${f.saturacion}%)`,
      transform: `scale(${Math.max(f.zoom / 100, 1 + f.desenfoque / 140)})`,
      objectPosition: `${f.posX}% ${f.posY}%`,
    };
    return (
      <div className="esc-fondo" style={{ background: f.color }}>
        {f.tipo === 'imagen'
          ? <img src={f.medio} alt="" style={estilo} />
          : estatico
            ? <video src={`${f.medio}#t=0.1`} muted preload="metadata" style={estilo} />
            : <video src={f.medio} autoPlay loop muted playsInline style={estilo} />}
        {f.tinteOpacidad > 0 && <div className="esc-velo" style={{ background: f.tinte, opacity: f.tinteOpacidad }} />}
        <div className="esc-velo" style={{ opacity: f.oscurecer }} />
      </div>
    );
  }
  return (
    <div className="esc-fondo" style={{ background: colorBase(f) }}>
      {f.tipo === 'patron' && <div className="esc-patron" style={{ background: patronCss(f), opacity: f.patronOpacidad }} />}
      {f.tipo === 'animado' && <AnimadoFondo f={f} estatico={estatico} />}
    </div>
  );
}

export default function Escenario({ frame, tema, estatico = false, silenciar = false }) {
  const ctx = { control: frame && frame.video, silenciar, estatico };
  const raiz = useRef(null);
  const [escala, setEscala] = useState(0.3);
  const t = completarTema(tema);
  const negro = !!frame && frame.modo === 'negro';
  const efectivo = !frame ? VACIO : frame.modo === 'logo' ? LOGO : (frame.contenido || VACIO);
  const clave = JSON.stringify(efectivo);

  useLayoutEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const medir = () => setEscala(el.clientWidth / ANCHO);
    medir();
    const o = new ResizeObserver(medir);
    o.observe(el);
    return () => o.disconnect();
  }, []);

  const contador = useRef(0);
  const anterior = useRef(clave);
  const [capas, setCapas] = useState(() => [{ id: 0, c: efectivo, sale: false }]);
  useEffect(() => {
    if (anterior.current === clave) return;
    anterior.current = clave;
    const id = ++contador.current;
    setCapas((prev) => [...prev.map((x) => ({ ...x, sale: true })), { id, c: efectivo, sale: false }]);
    const h = setTimeout(() => setCapas((prev) => prev.filter((x) => x.id === id)), 750);
    return () => clearTimeout(h);
  }, [clave]);

  const marca = t.marca.mostrar && TIPOS_TEXTO.includes(efectivo.tipo);
  const esquina = { 'inf-der': { right: 56, bottom: 48 }, 'inf-izq': { left: 56, bottom: 48 }, 'sup-der': { right: 56, top: 48 }, 'sup-izq': { left: 56, top: 48 } }[t.marca.esquina] || { right: 56, bottom: 48 };

  return (
    <div className="esc" ref={raiz}>
      <div className="esc-lienzo" style={{ transform: `scale(${escala})` }}>
        <Fondo t={t} estatico={estatico} />
        <EstiloFondo estilo={t.estilo} t={t} visible={TIPOS_TEXTO.includes(efectivo.tipo)} />
        {capas.map((x) => (
          <div key={x.id} className={`esc-capa${x.sale ? ' sale' : ''}`}>
            <Contenido c={x.c} t={t} ctx={ctx} />
          </div>
        ))}
        {marca && <img className="esc-marca" src={logoRedondo} alt="" style={{ width: t.marca.tam, height: t.marca.tam, opacity: t.marca.opacidad, ...esquina }} />}
        <div className="esc-negro" style={{ opacity: negro ? 1 : 0 }} />
      </div>
    </div>
  );
}
