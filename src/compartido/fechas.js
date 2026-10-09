const aFecha = (f) => new Date(`${f}T12:00:00`);

export const hoy = () => new Date().toLocaleDateString('sv-SE');

export const etiquetaFecha = (f) => aFecha(f).toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/[.,]/g, '').toUpperCase();

export const fechaLarga = (f) => aFecha(f).toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const mesAnio = (f) => {
  const t = aFecha(f).toLocaleDateString('es-HN', { month: 'long', year: 'numeric' });
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export const diaSemanaCorto = (f) => aFecha(f).toLocaleDateString('es-HN', { weekday: 'short' }).replace('.', '').toUpperCase();

export const diaMes = (f) => aFecha(f).getDate();
