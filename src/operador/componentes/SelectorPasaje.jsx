import { useEffect, useMemo, useState } from 'react';
import { Modal } from './Modal';
import Icono from './Iconos';
import { nombreReferencia } from '../../compartido/diapositivas';

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function SelectorPasaje({ libros, alAceptar, alCerrar }) {
  const [libro, setLibro] = useState(null);
  const [cap, setCap] = useState(null);
  const [versos, setVersos] = useState([]);
  const [desde, setDesde] = useState(null);
  const [hasta, setHasta] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [palabra, setPalabra] = useState('');
  const [encontrados, setEncontrados] = useState(null);

  useEffect(() => {
    if (!libro || !cap) { setVersos([]); return; }
    let activo = true;
    window.atril.capitulo(libro, cap).then((v) => { if (activo) setVersos(v); });
    return () => { activo = false; };
  }, [libro, cap]);

  useEffect(() => {
    if (!palabra.trim()) { setEncontrados(null); return; }
    let activo = true;
    const h = setTimeout(async () => {
      const r = await window.atril.buscar(palabra);
      if (!activo) return;
      if (r.referencia) {
        setLibro(r.referencia.libro);
        setCap(r.referencia.capitulo);
        setDesde(r.referencia.desde);
        setHasta(r.referencia.hasta);
        setEncontrados(null);
      } else {
        setEncontrados(r.palabras);
      }
    }, 200);
    return () => { activo = false; clearTimeout(h); };
  }, [palabra]);

  const visibles = useMemo(() => {
    const f = norm(filtro.trim());
    return libros.filter((l) => !f || norm(l.nombre).includes(f));
  }, [libros, filtro]);

  const elegirLibro = (l) => {
    setLibro(l.id);
    setCap(l.capitulos === 1 ? 1 : null);
    setDesde(null);
    setHasta(null);
  };

  const elegirCap = (c) => {
    setCap(c);
    setDesde(null);
    setHasta(null);
  };

  const clicVerso = (v, e) => {
    if (desde === null) { setDesde(v); setHasta(v); return; }
    if (e.shiftKey || hasta === desde) {
      if (v === desde && hasta === desde) { setDesde(null); setHasta(null); return; }
      setDesde(Math.min(desde, v));
      setHasta(Math.max(desde, v));
      return;
    }
    setDesde(v);
    setHasta(v);
  };

  const elegirResultado = (r) => {
    setLibro(r.libro);
    setCap(r.capitulo);
    setDesde(r.versiculo);
    setHasta(r.versiculo);
    setEncontrados(null);
    setPalabra('');
  };

  const etiqueta = libro && cap
    ? nombreReferencia(libros, libro, cap, desde, hasta)
    : libro ? libros[libro - 1].nombre : 'Elige un libro';

  const grupo = (titulo, lista) => lista.length > 0 && (
    <>
      <div className="sel-grupo">{titulo}</div>
      {lista.map((l) => (
        <button key={l.id} className={`sel-libro${libro === l.id ? ' on' : ''}`} onClick={() => elegirLibro(l)}>
          <span>{l.nombre}</span><small>{l.capitulos}</small>
        </button>
      ))}
    </>
  );

  return (
    <Modal
      titulo="Agregar pasaje bíblico"
      ancho={1080}
      alCerrar={alCerrar}
      pie={(
        <>
          <span className="sel-etiqueta">{etiqueta}</span>
          <span className="relleno" />
          <button className="btn" onClick={alCerrar}>Cancelar</button>
          <button className="btn" disabled={!libro || !cap} onClick={() => alAceptar({ libro, capitulo: cap, desde: null, hasta: null })}>Capítulo completo</button>
          <button className="btn btn-lleno" disabled={desde === null} onClick={() => alAceptar({ libro, capitulo: cap, desde, hasta })}><Icono n="mas" t={16} /> Agregar versículos</button>
        </>
      )}
    >
      <div className="sel-palabra">
        <Icono n="busqueda" t={16} />
        <input value={palabra} onChange={(e) => setPalabra(e.target.value)} placeholder="Opcional: buscar por palabra o escribir el pasaje (amor, jn 3:16…)" spellCheck={false} />
        {palabra && <button className="icono-btn chico" onClick={() => setPalabra('')}><Icono n="cerrar" t={15} /></button>}
      </div>
      <div className="selector-pasaje">
        <div className="sel-col">
          <span className="rotulo">Libro</span>
          <input className="sel-filtro" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Filtrar libros" />
          <div className="sel-lista">
            {grupo('Antiguo Testamento', visibles.filter((l) => l.testamento === 'AT'))}
            {grupo('Nuevo Testamento', visibles.filter((l) => l.testamento === 'NT'))}
          </div>
        </div>
        <div className="sel-col">
          <span className="rotulo">Capítulo</span>
          {libro ? (
            <div className="sel-caps">
              {Array.from({ length: libros[libro - 1].capitulos }, (_, i) => i + 1).map((c) => (
                <button key={c} className={cap === c ? 'on' : ''} onClick={() => elegirCap(c)}>{c}</button>
              ))}
            </div>
          ) : <p className="tenue chico-texto">Primero elige un libro.</p>}
        </div>
        <div className="sel-col ancha">
          <span className="rotulo">{encontrados ? `Versículos con «${palabra.trim()}»` : 'Versículos'}</span>
          {encontrados ? (
            <div className="sel-lista">
              {encontrados.length === 0 && <p className="tenue chico-texto">Nada encontrado.</p>}
              {encontrados.map((r) => (
                <button key={`${r.libro}-${r.capitulo}-${r.versiculo}`} className="sel-verso" onClick={() => elegirResultado(r)}>
                  <b>{libros[r.libro - 1].nombre} {r.capitulo}:{r.versiculo}</b>
                  <span>{r.texto}</span>
                </button>
              ))}
            </div>
          ) : cap ? (
            <>
              <p className="tenue chico-texto sel-pista">Toca un versículo. Toca otro para completar el rango.</p>
              <div className="sel-lista">
                {versos.map((v) => {
                  const dentro = desde !== null && v.v >= desde && v.v <= hasta;
                  return (
                    <button key={v.v} className={`sel-verso${dentro ? ' on' : ''}`} onClick={(e) => clicVerso(v.v, e)}>
                      <b>{v.v}</b>
                      <span>{v.t}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : <p className="tenue chico-texto">Elige un capítulo para ver sus versículos.</p>}
        </div>
      </div>
    </Modal>
  );
}
