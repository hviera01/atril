import { dividirLetra, dividirTexto } from './letras.mjs';

const VERSION = 'RVR1960';
const capitulos = new Map();

export async function capituloBiblia(libro, capitulo) {
  const clave = `${libro}:${capitulo}`;
  if (!capitulos.has(clave)) capitulos.set(clave, window.atril.capitulo(libro, capitulo));
  return capitulos.get(clave);
}

export function nombreReferencia(libros, libro, capitulo, desde, hasta) {
  let r = `${libros[libro - 1].nombre} ${capitulo}`;
  if (desde) r += `:${desde}`;
  if (hasta && hasta !== desde) r += `-${hasta}`;
  return r;
}

export function contenidoVersiculos(libros, libro, capitulo, versos, version = VERSION) {
  const primero = versos[0].v;
  const ultimo = versos[versos.length - 1].v;
  return {
    tipo: 'versiculo',
    partes: versos.map((x) => ({ n: x.v, t: x.t })),
    referencia: nombreReferencia(libros, libro, capitulo, primero, ultimo),
    libroNombre: libros[libro - 1].nombre,
    capitulo,
    rango: primero === ultimo ? String(primero) : `${primero}-${ultimo}`,
    version,
  };
}

const recorte = (s, n = 120) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export async function construirDiapositivas(el, ctx) {
  const { libros, maxLineas } = ctx;
  if (el.tipo === 'biblia') {
    const todos = await capituloBiblia(el.libro, el.capitulo);
    const desde = el.desde || 1;
    const hasta = el.hasta || (el.desde ? el.desde : todos.length);
    const versos = todos.filter((x) => x.v >= desde && x.v <= hasta);
    const n = Math.max(1, el.agrupar || 1);
    const grupos = [];
    for (let i = 0; i < versos.length; i += n) grupos.push(versos.slice(i, i + n));
    return grupos.map((g) => {
      const c = contenidoVersiculos(libros, el.libro, el.capitulo, g);
      return { etiqueta: g.length > 1 ? `${g[0].v}-${g[g.length - 1].v}` : String(g[0].v), resumen: recorte(g.map((x) => x.t).join(' ')), contenido: c };
    });
  }
  if (el.tipo === 'cancion') {
    const c = await window.atril.canciones.obtener(el.cancionId);
    if (!c) return [];
    return dividirLetra(c.letra, maxLineas).map((s, i) => ({
      etiqueta: s.etiqueta || String(i + 1),
      resumen: recorte(s.lineas.join(' / ')),
      contenido: { tipo: 'letra', lineas: s.lineas, titulo: c.titulo },
    }));
  }
  if (el.tipo === 'imagen') {
    return [{ etiqueta: '1', resumen: el.nombre || 'Imagen', imagen: el.src, contenido: { tipo: 'imagen', src: el.src } }];
  }
  if (el.tipo === 'texto') {
    const partes = dividirTexto(el.cuerpo);
    return partes.map((s, i) => ({
      etiqueta: String(i + 1),
      resumen: recorte(s.lineas.join(' / ')),
      contenido: { tipo: 'texto', titulo: el.titulo || '', lineas: s.lineas },
    }));
  }
  if (el.tipo === 'temporizador') {
    return [{ etiqueta: `${el.minutos} min`, resumen: el.titulo || 'Cuenta regresiva', contenido: { tipo: 'temporizador', titulo: el.titulo || '', minutos: el.minutos, finEn: null } }];
  }
  return [];
}

export function resumenElemento(el, libros, cancionTitulos) {
  if (el.tipo === 'biblia') {
    return { titulo: nombreReferencia(libros, el.libro, el.capitulo, el.desde, el.hasta), sub: `${VERSION}${el.agrupar > 1 ? ` · ${el.agrupar} por diapositiva` : ''}` };
  }
  if (el.tipo === 'cancion') return { titulo: el.titulo || cancionTitulos[el.cancionId] || 'Canción', sub: 'Canción' };
  if (el.tipo === 'imagen') return { titulo: el.nombre || 'Imagen', sub: 'Imagen' };
  if (el.tipo === 'texto') return { titulo: el.titulo || 'Texto', sub: 'Anuncio o texto' };
  if (el.tipo === 'temporizador') return { titulo: el.titulo || 'Cuenta regresiva', sub: `${el.minutos} min` };
  if (el.tipo === 'seccion') return { titulo: el.titulo, sub: '' };
  return { titulo: '', sub: '' };
}
