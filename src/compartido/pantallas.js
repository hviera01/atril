export const ROLES = [
  { id: 'principal', nombre: 'Principal (todo)', desc: 'Muestra todo lo que proyectas.' },
  { id: 'escenario', nombre: 'Escenario', desc: 'Para el pastor o los cantantes: lo que se proyecta ahora, lo que sigue y la hora.' },
  { id: 'letras', nombre: 'Solo canciones', desc: 'Muestra las letras; lo demás sale en negro.' },
  { id: 'biblia', nombre: 'Solo versículos', desc: 'Muestra los versículos; lo demás sale en negro.' },
  { id: 'avisos', nombre: 'Avisos', desc: 'Anuncios, imágenes y cuenta regresiva; el logo cuando no hay nada de eso.' },
  { id: 'logo', nombre: 'Logo fijo', desc: 'Siempre el logo de la iglesia.' },
  { id: 'negro', nombre: 'Apagada', desc: 'Pantalla en negro.' },
];

export const rolDe = (id) => ROLES.find((r) => r.id === id) || ROLES[0];

const NEGRO = { frame: { modo: 'negro', contenido: null } };
const LOGO = { frame: { modo: 'logo', contenido: null } };

export function cargaParaRol(rol, { modo, contenido, siguiente }) {
  if (rol === 'escenario') return { vista: 'escenario', actual: contenido, siguiente, modo };
  if (rol === 'logo') return LOGO;
  if (rol === 'negro') return NEGRO;
  if (rol === 'principal') return { frame: { modo, contenido } };
  if (modo !== 'contenido') return { frame: { modo, contenido: null } };
  if (rol === 'letras') return contenido && contenido.tipo === 'letra' ? { frame: { modo, contenido } } : NEGRO;
  if (rol === 'biblia') return contenido && contenido.tipo === 'versiculo' ? { frame: { modo, contenido } } : NEGRO;
  if (rol === 'avisos') return contenido && ['texto', 'imagen', 'temporizador'].includes(contenido.tipo) ? { frame: { modo, contenido } } : LOGO;
  return { frame: { modo, contenido } };
}
