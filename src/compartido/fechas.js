const aFecha = (f) => new Date(`${f}T12:00:00`);

const iso = (d) => d.toLocaleDateString('sv-SE');

export const PRESETS_FECHA = [
  { id: 'todos', t: 'Todos' },
  { id: 'mes', t: 'Este mes' },
  { id: 'mesPasado', t: 'Mes pasado' },
  { id: '30', t: 'Últimos 30 días' },
  { id: 'anio', t: 'Este año' },
];

export const rangoPreset = (id) => {
  const h = new Date();
  const a = h.getFullYear();
  const m = h.getMonth();
  if (id === 'mes') return [iso(new Date(a, m, 1)), iso(new Date(a, m + 1, 0))];
  if (id === 'mesPasado') return [iso(new Date(a, m - 1, 1)), iso(new Date(a, m, 0))];
  if (id === '30') return [iso(new Date(h.getTime() - 29 * 86400000)), iso(h)];
  if (id === 'anio') return [`${a}-01-01`, `${a}-12-31`];
  return ['', ''];
};

export const hoy = () => new Date().toLocaleDateString('sv-SE');

export const etiquetaFecha = (f) => aFecha(f).toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/[.,]/g, '').toUpperCase();

export const fechaLarga = (f) => aFecha(f).toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const mesAnio = (f) => {
  const t = aFecha(f).toLocaleDateString('es-HN', { month: 'long', year: 'numeric' });
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export const diaSemanaCorto = (f) => aFecha(f).toLocaleDateString('es-HN', { weekday: 'short' }).replace('.', '').toUpperCase();

export const diaMes = (f) => aFecha(f).getDate();
