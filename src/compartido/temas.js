export const FUENTES = [
  { id: 'fraunces', nombre: 'Fraunces', css: "'Fraunces Variable', Georgia, serif" },
  { id: 'newsreader', nombre: 'Newsreader', css: "'Newsreader Variable', Georgia, serif" },
  { id: 'cormorant', nombre: 'Cormorant Garamond', css: "'Cormorant Garamond Variable', Georgia, serif" },
  { id: 'dmserif', nombre: 'DM Serif Display', css: "'DM Serif Display', Georgia, serif" },
  { id: 'archivo', nombre: 'Archivo', css: "'Archivo Variable', 'Segoe UI', sans-serif" },
  { id: 'instrument', nombre: 'Instrument Sans', css: "'Instrument Sans Variable', 'Segoe UI', sans-serif" },
  { id: 'bricolage', nombre: 'Bricolage Grotesque', css: "'Bricolage Grotesque Variable', 'Segoe UI', sans-serif" },
];

export const fuenteCss = (id) => (FUENTES.find((f) => f.id === id) || FUENTES[0]).css;

const BASE = {
  fondo: { tipo: 'degradado', color: '#1d1510', color2: '#0c0806', angulo: 165, medio: '', oscurecer: 0.4 },
  texto: { fuente: 'fraunces', peso: 500, color: '#f6eddc', max: 124, min: 36, alinear: 'center', mayus: false, cursiva: false, sombra: 0.5, interlineado: 1.2 },
  referencia: { mostrar: true, posicion: 'abajo', fuente: 'instrument', color: '#d8a24a', tam: 46, mayus: true, espaciado: 0.16, peso: 600 },
  margen: { x: 170, y: 120 },
  adorno: 'linea',
  marca: { mostrar: false, tam: 130, opacidad: 0.95, esquina: 'inf-der' },
};

const fusionar = (base, cambios) => {
  const r = { ...base };
  for (const k of Object.keys(cambios)) {
    r[k] = cambios[k] && typeof cambios[k] === 'object' && !Array.isArray(cambios[k]) ? { ...base[k], ...cambios[k] } : cambios[k];
  }
  return r;
};

export const TEMAS_INTEGRADOS = [
  fusionar(BASE, { id: 'madrugada', nombre: 'Madrugada', integrado: true }),
  fusionar(BASE, {
    id: 'pergamino', nombre: 'Pergamino', integrado: true,
    fondo: { tipo: 'degradado', color: '#f6eddb', color2: '#e0cfae', angulo: 170, oscurecer: 0 },
    texto: { fuente: 'newsreader', peso: 500, color: '#2b1b10', sombra: 0, max: 120 },
    referencia: { color: '#9a3f1c', fuente: 'newsreader', peso: 700 },
    adorno: 'marco',
  }),
  fusionar(BASE, {
    id: 'brasa', nombre: 'Brasa', integrado: true,
    fondo: { tipo: 'degradado', color: '#45120b', color2: '#110403', angulo: 200, oscurecer: 0.2 },
    texto: { fuente: 'archivo', peso: 800, color: '#fff4e6', mayus: true, interlineado: 1.1, sombra: 0.6, max: 112 },
    referencia: { color: '#ffb347', fuente: 'archivo', peso: 700 },
    adorno: 'barra',
  }),
  fusionar(BASE, {
    id: 'alba', nombre: 'Alba', integrado: true,
    fondo: { tipo: 'degradado', color: '#f0883a', color2: '#4a1626', angulo: 175, oscurecer: 0 },
    texto: { fuente: 'fraunces', peso: 600, color: '#fffaf0', sombra: 0.8, cursiva: false },
    referencia: { color: '#fff1d2', fuente: 'instrument', peso: 600 },
    adorno: 'linea',
  }),
  fusionar(BASE, {
    id: 'monte', nombre: 'Monte', integrado: true,
    fondo: { tipo: 'degradado', color: '#17261e', color2: '#08100c', angulo: 160, oscurecer: 0 },
    texto: { fuente: 'newsreader', peso: 500, color: '#e9f0df', sombra: 0.4 },
    referencia: { color: '#b9c98a', fuente: 'instrument', peso: 600 },
    adorno: 'barra',
  }),
  fusionar(BASE, {
    id: 'lienzo', nombre: 'Lienzo', integrado: true,
    fondo: { tipo: 'color', color: '#0a0a0a', color2: '#0a0a0a', angulo: 0, oscurecer: 0 },
    texto: { fuente: 'bricolage', peso: 700, color: '#ffffff', alinear: 'left', sombra: 0, interlineado: 1.12, max: 128 },
    referencia: { color: '#ff6a3d', fuente: 'bricolage', peso: 700 },
    margen: { x: 220, y: 120 },
    adorno: 'barra',
  }),
];

export const completarTema = (tema) => fusionar(BASE, tema || {});

export const temaNuevoDesde = (tema, nombre) => ({
  ...JSON.parse(JSON.stringify(tema)),
  id: `t${Date.now().toString(36)}`,
  nombre,
  integrado: false,
});
