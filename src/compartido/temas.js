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
  fondo: {
    tipo: 'degradado', color: '#1d1510', color2: '#0c0806', color3: '#d8a24a', angulo: 165, medio: '', oscurecer: 0.4,
    desenfoque: 0, brillo: 100, saturacion: 100, zoom: 100, posX: 50, posY: 50, tinte: '#000000', tinteOpacidad: 0,
    patron: 'lineas', patronOpacidad: 0.16, animacion: 'aurora', velocidad: 1,
  },
  texto: { fuente: 'fraunces', peso: 500, color: '#f6eddc', max: 124, min: 36, alinear: 'center', mayus: false, cursiva: false, sombra: 0.5, interlineado: 1.2, capitular: false },
  referencia: { mostrar: true, posicion: 'abajo', fuente: 'instrument', color: '#d8a24a', tam: 46, mayus: true, espaciado: 0.16, peso: 600 },
  margen: { x: 170, y: 120 },
  adorno: 'linea',
  estilo: 'plano',
  marca: { mostrar: false, tam: 130, opacidad: 0.95, esquina: 'inf-der' },
};

const fusionar = (base, cambios) => {
  const r = { ...base };
  for (const k of Object.keys(cambios)) {
    r[k] = cambios[k] && typeof cambios[k] === 'object' && !Array.isArray(cambios[k]) ? { ...base[k], ...cambios[k] } : cambios[k];
  }
  return r;
};

export const TIPOS_FONDO = [
  { v: 'color', t: 'Color liso' },
  { v: 'degradado', t: 'Degradado' },
  { v: 'radial', t: 'Resplandor (radial)' },
  { v: 'patron', t: 'Patrón' },
  { v: 'animado', t: 'Animado' },
  { v: 'imagen', t: 'Imagen' },
  { v: 'video', t: 'Video corto' },
];

export const PATRONES = [
  { v: 'lineas', t: 'Líneas' },
  { v: 'diagonal', t: 'Diagonales' },
  { v: 'puntos', t: 'Puntos' },
  { v: 'cuadricula', t: 'Cuadrícula' },
  { v: 'ruido', t: 'Grano de papel' },
];

export const ANIMACIONES = [
  { v: 'aurora', t: 'Aurora' },
  { v: 'polvo', t: 'Polvo de luz' },
  { v: 'brasas', t: 'Brasas' },
  { v: 'olas', t: 'Olas' },
  { v: 'estrellas', t: 'Estrellas' },
  { v: 'giro', t: 'Rayos giratorios' },
  { v: 'nubes', t: 'Nubes' },
];

export const ESTILOS = [
  { id: 'plano', nombre: 'Plano (solo fondo)' },
  { id: 'libro', nombre: 'Biblia abierta' },
  { id: 'rollo', nombre: 'Rollo antiguo' },
  { id: 'vitral', nombre: 'Vitral' },
  { id: 'montanas', nombre: 'Montañas al atardecer' },
  { id: 'rayos', nombre: 'Rayos de luz' },
  { id: 'cruz', nombre: 'Cruz' },
  { id: 'manuscrito', nombre: 'Manuscrito' },
];

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

  fusionar(BASE, {
    id: 'biblia', nombre: 'Biblia abierta', integrado: true, estilo: 'libro',
    fondo: { tipo: 'degradado', color: '#3b2416', color2: '#120a06', angulo: 180, oscurecer: 0 },
    texto: { fuente: 'newsreader', peso: 500, color: '#2a190d', max: 68, min: 28, alinear: 'left', sombra: 0, interlineado: 1.3 },
    referencia: { color: '#8e1f19', fuente: 'cormorant', peso: 700, tam: 38, mayus: true, espaciado: 0.2 },
  }),
  fusionar(BASE, {
    id: 'rollo', nombre: 'Rollo antiguo', integrado: true, estilo: 'rollo',
    fondo: { tipo: 'degradado', color: '#2a1a11', color2: '#0d0704', angulo: 170, oscurecer: 0 },
    texto: { fuente: 'cormorant', peso: 600, color: '#33200f', max: 112, min: 34, sombra: 0, interlineado: 1.18 },
    referencia: { color: '#8a3a16', fuente: 'cormorant', peso: 700, tam: 44 },
    margen: { x: 420, y: 250 },
    adorno: 'linea',
  }),
  fusionar(BASE, {
    id: 'vitral', nombre: 'Vitral', integrado: true, estilo: 'vitral',
    fondo: { tipo: 'degradado', color: '#150a09', color2: '#050303', angulo: 180, oscurecer: 0 },
    texto: { fuente: 'fraunces', peso: 500, color: '#fff2dc', max: 96, min: 30, sombra: 0.8, interlineado: 1.18 },
    referencia: { color: '#f2bb55', fuente: 'instrument', peso: 600, tam: 40 },
    margen: { x: 520, y: 290 },
    adorno: 'linea',
  }),
  fusionar(BASE, {
    id: 'montanas', nombre: 'Montañas', integrado: true, estilo: 'montanas',
    fondo: { tipo: 'degradado', color: '#0f2a3b', color2: '#f3b566', angulo: 180, oscurecer: 0 },
    texto: { fuente: 'fraunces', peso: 600, color: '#fffaf0', max: 112, min: 34, sombra: 0.85, interlineado: 1.18 },
    referencia: { color: '#ffe2b3', fuente: 'instrument', peso: 600, tam: 42 },
    margen: { x: 230, y: 100, abajo: 500 },
    adorno: 'linea',
  }),
  fusionar(BASE, {
    id: 'luz', nombre: 'Rayos de luz', integrado: true, estilo: 'rayos',
    fondo: { tipo: 'degradado', color: '#101522', color2: '#030407', angulo: 180, oscurecer: 0 },
    texto: { fuente: 'newsreader', peso: 500, color: '#fff7e2', max: 118, sombra: 0.7 },
    referencia: { color: '#f4d27a', fuente: 'instrument', peso: 600 },
    adorno: 'linea',
  }),
  fusionar(BASE, {
    id: 'cruz', nombre: 'Cruz', integrado: true, estilo: 'cruz',
    fondo: { tipo: 'degradado', color: '#17110c', color2: '#060403', angulo: 180, oscurecer: 0 },
    texto: { fuente: 'fraunces', peso: 500, color: '#f7eedd', max: 120, sombra: 0.6 },
    referencia: { color: '#d8a24a', fuente: 'instrument', peso: 600 },
    adorno: 'linea',
  }),
  fusionar(BASE, {
    id: 'manuscrito', nombre: 'Manuscrito', integrado: true, estilo: 'manuscrito',
    fondo: { tipo: 'degradado', color: '#f3e8cd', color2: '#e2cfa6', angulo: 170, oscurecer: 0 },
    texto: { fuente: 'cormorant', peso: 600, color: '#2d1c11', max: 116, min: 34, alinear: 'left', sombra: 0, interlineado: 1.2, capitular: true },
    referencia: { color: '#9a2a18', fuente: 'cormorant', peso: 700, tam: 46 },
    margen: { x: 250, y: 190 },
    adorno: 'linea',
  }),
  fusionar(BASE, {
    id: 'aurora', nombre: 'Aurora', integrado: true,
    fondo: { tipo: 'animado', animacion: 'aurora', color: '#0b5a73', color2: '#050f1d', color3: '#2fbf9b', oscurecer: 0 },
    texto: { fuente: 'fraunces', peso: 500, color: '#f4fbff', sombra: 0.65 },
    referencia: { color: '#8ff0d2', fuente: 'instrument', peso: 600 },
    adorno: 'linea',
  }),
  fusionar(BASE, {
    id: 'fuego', nombre: 'Fuego vivo', integrado: true,
    fondo: { tipo: 'animado', animacion: 'brasas', color: '#4a1107', color2: '#0b0302', color3: '#ff8a2a', oscurecer: 0 },
    texto: { fuente: 'archivo', peso: 800, color: '#fff3e2', mayus: true, interlineado: 1.1, sombra: 0.7, max: 112 },
    referencia: { color: '#ffb347', fuente: 'archivo', peso: 700 },
    adorno: 'linea',
  }),
  fusionar(BASE, {
    id: 'luzflotante', nombre: 'Luz flotante', integrado: true,
    fondo: { tipo: 'animado', animacion: 'polvo', color: '#231a12', color2: '#07050a', color3: '#f0c36a', oscurecer: 0 },
    texto: { fuente: 'newsreader', peso: 500, color: '#fff6e4', sombra: 0.6 },
    referencia: { color: '#f0c36a', fuente: 'instrument', peso: 600 },
    adorno: 'linea',
  }),
  fusionar(BASE, {
    id: 'mar', nombre: 'Mar', integrado: true,
    fondo: { tipo: 'animado', animacion: 'olas', color: '#14688a', color2: '#04101c', color3: '#6fd0e0', angulo: 180, oscurecer: 0 },
    texto: { fuente: 'fraunces', peso: 600, color: '#f2fbff', sombra: 0.7 },
    referencia: { color: '#a9ecf5', fuente: 'instrument', peso: 600 },
    margen: { x: 200, y: 100, abajo: 330 },
    adorno: 'linea',
  }),
  fusionar(BASE, {
    id: 'noche', nombre: 'Noche estrellada', integrado: true,
    fondo: { tipo: 'animado', animacion: 'estrellas', color: '#121d44', color2: '#03050e', color3: '#cfd8ff', angulo: 180, oscurecer: 0 },
    texto: { fuente: 'cormorant', peso: 600, color: '#f4f6ff', sombra: 0.6, max: 128 },
    referencia: { color: '#cfd8ff', fuente: 'instrument', peso: 600 },
    adorno: 'linea',
  }),
  fusionar(BASE, {
    id: 'gloria', nombre: 'Gloria', integrado: true,
    fondo: { tipo: 'animado', animacion: 'giro', color: '#5a3209', color2: '#120803', color3: '#ffd27a', oscurecer: 0 },
    texto: { fuente: 'fraunces', peso: 600, color: '#fff7e6', sombra: 0.7 },
    referencia: { color: '#ffd27a', fuente: 'instrument', peso: 600 },
    adorno: 'linea',
  }),
  fusionar(BASE, {
    id: 'nubes', nombre: 'Nubes', integrado: true,
    fondo: { tipo: 'animado', animacion: 'nubes', color: '#5f9bd0', color2: '#d6e8f6', color3: '#ffffff', angulo: 180, oscurecer: 0 },
    texto: { fuente: 'fraunces', peso: 600, color: '#12253a', sombra: 0 },
    referencia: { color: '#1d5d8f', fuente: 'instrument', peso: 700 },
    adorno: 'linea',
  }),
  fusionar(BASE, {
    id: 'resplandor', nombre: 'Resplandor', integrado: true,
    fondo: { tipo: 'radial', color: '#6a4515', color2: '#0b0705', oscurecer: 0 },
    texto: { fuente: 'fraunces', peso: 500, color: '#fff3dc', sombra: 0.6 },
    referencia: { color: '#f0c36a', fuente: 'instrument', peso: 600 },
    adorno: 'linea',
  }),
];

export const temaEnBlanco = () => ({
  ...JSON.parse(JSON.stringify(completarTema({}))),
  id: `t${Date.now().toString(36)}`,
  nombre: 'Diseño nuevo',
  integrado: false,
});

export const completarTema = (tema) => fusionar(BASE, tema || {});

export const temaNuevoDesde = (tema, nombre) => ({
  ...JSON.parse(JSON.stringify(tema)),
  id: `t${Date.now().toString(36)}`,
  nombre,
  integrado: false,
});
