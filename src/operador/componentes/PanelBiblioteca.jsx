import { useEffect, useMemo, useState } from 'react';
import Icono from './Iconos';

export function PanelCanciones({ destinoTitulo, version, focoId, alVistaPrevia, alProyectar, alAgregar, alEditar, alNueva, alImportar }) {
  const [q, setQ] = useState('');
  const [lista, setLista] = useState([]);

  useEffect(() => {
    let vivo = true;
    const h = setTimeout(async () => {
      const r = await window.atril.canciones.listar(q);
      if (vivo) setLista(r);
    }, 120);
    return () => { vivo = false; clearTimeout(h); };
  }, [q, version]);

  return (
    <div className="biblio">
      <div className="biblio-cab">
        {destinoTitulo && <p className="destino-nota">Se agregarán en <b>{destinoTitulo}</b></p>}
        <div className="filtro">
          <Icono n="busqueda" t={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar canciones" />
        </div>
        <div className="biblio-botones">
          <button className="btn btn-lleno" onClick={alNueva}><Icono n="mas" t={16} /> Nueva canción</button>
          <button className="btn" onClick={alImportar} title="Importar letras desde archivos .txt"><Icono n="subir" t={16} /> Importar</button>
        </div>
      </div>
      <div className="biblio-lista">
        {lista.length === 0 && (
          <div className="vacio-panel">
            <p>{q ? 'Ninguna canción coincide.' : 'Aún no hay canciones.'}</p>
            {!q && <p className="tenue">Pega una letra y Atril la divide sola en estrofas y coros. También puedes importar archivos .txt.</p>}
          </div>
        )}
        {lista.map((c) => (
          <div key={c.id} className={`fila-cancion${focoId === `tmp-cancion-${c.id}` ? ' enfocado' : ''}`} onClick={() => alVistaPrevia(c)} onDoubleClick={() => alProyectar(c)}>
            <span className="item-tipo"><Icono n="cancion" t={17} /></span>
            <span className="item-texto">
              <span className="item-titulo">{c.titulo}</span>
              {c.autor ? <span className="item-sub">{c.autor}</span> : null}
            </span>
            <span className="item-acciones">
              <button className="icono-btn chico" title="Agregar al culto" onClick={(e) => { e.stopPropagation(); alAgregar(c); }}><Icono n="mas" t={16} /></button>
              <button className="icono-btn chico" title="Editar letra" onClick={(e) => { e.stopPropagation(); alEditar(c.id); }}><Icono n="editar" t={15} /></button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PanelMedios({ destinoTitulo, version, focoId, alVistaPrevia, alAgregar, alUsarFondo, alCambio }) {
  const [medios, setMedios] = useState([]);

  const cargar = async () => setMedios(await window.atril.medios.listar());
  useEffect(() => { cargar(); }, [version]);

  const importar = async () => {
    const nuevos = await window.atril.medios.importar('todos');
    if (nuevos.length) { await cargar(); alCambio(); }
  };
  const borrar = async (m) => {
    await window.atril.medios.borrar(m.archivo);
    await cargar();
    alCambio();
  };

  return (
    <div className="biblio">
      <div className="biblio-cab">
        {destinoTitulo && <p className="destino-nota">Se agregarán en <b>{destinoTitulo}</b></p>}
        <div className="biblio-botones">
          <button className="btn btn-lleno" onClick={importar}><Icono n="subir" t={16} /> Agregar archivos</button>
        </div>
        <p className="tenue chico-texto">Imágenes y videos para proyectar. También sirven de fondo: toca el pincel en cualquiera.</p>
      </div>
      <div className="medios-grilla">
        {medios.length === 0 && <div className="vacio-panel"><p>Sin archivos todavía.</p></div>}
        {medios.map((m) => (
          <div key={m.archivo} className={`medio${focoId === `tmp-${m.tipo}-${m.archivo}` ? ' enfocado' : ''}`} onClick={() => alVistaPrevia(m)} onDoubleClick={() => alAgregar(m)}>
            {m.tipo === 'imagen' ? <img src={m.url} alt="" loading="lazy" /> : <video src={m.url} muted preload="metadata" />}
            {m.tipo === 'video' ? <span className="medio-video"><Icono n="video" t={14} /></span> : null}
            <span className="medio-nombre">{m.nombre}</span>
            <span className="medio-acciones">
              <button className="icono-btn chico" title="Usar como fondo de la proyección" onClick={(e) => { e.stopPropagation(); alUsarFondo(m); }}><Icono n="paleta" t={15} /></button>
              <button className="icono-btn chico" title="Agregar al culto" onClick={(e) => { e.stopPropagation(); alAgregar(m); }}><Icono n="mas" t={16} /></button>
              <button className="icono-btn chico" title="Eliminar" onClick={(e) => { e.stopPropagation(); borrar(m); }}><Icono n="borrar" t={15} /></button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const normalizar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function PanelBiblia({ libros, actual, alElegir }) {
  const [filtro, setFiltro] = useState('');
  const visibles = useMemo(() => {
    const f = normalizar(filtro.trim());
    return libros.filter((l) => !f || normalizar(l.nombre).includes(f));
  }, [libros, filtro]);

  const grupo = (titulo, lista) => lista.length > 0 && (
    <>
      <div className="sel-grupo">{titulo}</div>
      {lista.map((l) => (
        <button key={l.id} className={`sel-libro${actual === l.id ? ' on' : ''}`} onClick={() => alElegir(l)}>
          <span>{l.nombre}</span><small>{l.capitulos} {l.capitulos === 1 ? 'cap.' : 'caps.'}</small>
        </button>
      ))}
    </>
  );

  return (
    <div className="biblio">
      <div className="biblio-cab">
        <div className="filtro">
          <Icono n="busqueda" t={16} />
          <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Filtrar libros" />
        </div>
        <p className="tenue chico-texto">Elige un libro, luego el capítulo y toca el versículo para proyectarlo.</p>
      </div>
      <div className="biblio-lista">
        {grupo('Antiguo Testamento', visibles.filter((l) => l.testamento === 'AT'))}
        {grupo('Nuevo Testamento', visibles.filter((l) => l.testamento === 'NT'))}
      </div>
    </div>
  );
}
