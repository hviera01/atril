const ETIQUETA = /^\s*[\[(]\s*([^\])]{1,30}?)\s*[\])]\s*:?\s*$/;
const ETIQUETA_SUELTA = /^\s*(coro|estribillo|verso\s*\d*|estrofa\s*\d*|puente|intro|final|pre-?coro|precoro)\s*:?\s*$/i;

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

export { dividirLetra, dividirTexto };
