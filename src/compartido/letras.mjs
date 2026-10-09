const ETIQUETA = /^\s*[\[(]\s*([^\])]{1,30}?)\s*[\])]\s*:?\s*$/;
const ETIQUETA_SUELTA = /^\s*(coro|estribillo|verso\s*\d*|estrofa\s*\d*|puente|intro|final|pre-?coro|precoro)\s*:?\s*$/i;
const ACORDE = /^[A-G](#|b)?(maj|min|m|M|dim|aug|sus|add)?\d*(\/[A-G](#|b)?)?$/;
const TRAZO = /^[|\-x\d()\/.]+$/;

function dividirEnBloques(letra) {
  const lineas = String(letra || '').replace(/\r/g, '').split('\n');
  const bloques = [];
  let actual = [];
  const cerrar = () => {
    if (actual.length) bloques.push(actual);
    actual = [];
  };
  for (const crudo of lineas) {
    const linea = crudo.replace(/\s+$/, '');
    if (!linea.trim()) { cerrar(); continue; }
    actual.push(linea.trim());
  }
  cerrar();
  return bloques;
}

function partirBalanceado(lineas, maximo) {
  if (lineas.length <= maximo) return [lineas];
  const partes = Math.ceil(lineas.length / maximo);
  const base = Math.floor(lineas.length / partes);
  let extra = lineas.length % partes;
  const resultado = [];
  let i = 0;
  for (let p = 0; p < partes; p++) {
    const n = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra--;
    resultado.push(lineas.slice(i, i + n));
    i += n;
  }
  return resultado;
}

function dividirLetra(letra, maxLineas = 4) {
  const secciones = [];
  let etiquetaPendiente = '';
  for (const bloque of dividirEnBloques(letra)) {
    let etiqueta = etiquetaPendiente;
    let lineas = bloque;
    const m = ETIQUETA.exec(lineas[0]) || ETIQUETA_SUELTA.exec(lineas[0]);
    if (m) {
      etiqueta = m[1].trim();
      lineas = lineas.slice(1);
      if (!lineas.length) { etiquetaPendiente = etiqueta; continue; }
    }
    etiquetaPendiente = '';
    const partes = partirBalanceado(lineas, Math.max(1, maxLineas));
    partes.forEach((p, i) => secciones.push({
      etiqueta: etiqueta ? (partes.length > 1 ? `${etiqueta} ${i + 1}/${partes.length}` : etiqueta) : '',
      lineas: p,
    }));
  }
  return secciones;
}

function dividirTexto(cuerpo) {
  return dividirEnBloques(cuerpo).map((lineas) => ({ lineas }));
}

function esLineaDeAcordes(linea) {
  const fichas = linea.trim().split(/\s+/).filter(Boolean);
  if (!fichas.length) return false;
  if (fichas.length === 1 && /^[A-G]$/.test(fichas[0])) return false;
  return fichas.every((f) => ACORDE.test(f) || TRAZO.test(f));
}

const claveEstrofa = (lineas) => lineas.join(' ').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]+/g, '').replace(/\s+/g, ' ').trim();
const conEtiqueta = (bloque) => !!(ETIQUETA.exec(bloque[0]) || ETIQUETA_SUELTA.exec(bloque[0]));

function organizarLetra(texto, porEstrofa = 4) {
  const maximo = Math.max(2, porEstrofa);
  const limpias = String(texto || '').replace(/\r/g, '').split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l === '' || !esLineaDeAcordes(l));
  const bloques = dividirEnBloques(limpias.join('\n'));
  if (!bloques.length) return '';
  const estrofas = [];
  if (bloques.length === 1 && !conEtiqueta(bloques[0])) {
    estrofas.push(...partirBalanceado(bloques[0], maximo));
  } else {
    for (const b of bloques) {
      if (conEtiqueta(b) || b.length <= maximo + 3) estrofas.push(b);
      else estrofas.push(...partirBalanceado(b, maximo));
    }
  }
  const veces = new Map();
  for (const e of estrofas) if (!conEtiqueta(e)) veces.set(claveEstrofa(e), (veces.get(claveEstrofa(e)) || 0) + 1);
  let verso = 0;
  return estrofas.map((e) => {
    if (conEtiqueta(e)) return e.join('\n');
    const repetida = estrofas.length > 1 && veces.get(claveEstrofa(e)) > 1;
    return [repetida ? '[Coro]' : `[Verso ${++verso}]`, ...e].join('\n');
  }).join('\n\n');
}

export { dividirLetra, dividirTexto, organizarLetra };
