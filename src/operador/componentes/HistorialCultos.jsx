import { useMemo, useState } from 'react';
import { Modal } from './Modal';
import Icono from './Iconos';
import { PRESETS_FECHA, diaMes, diaSemanaCorto, mesAnio, rangoPreset } from '../../compartido/fechas';

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function HistorialCultos({ servicios, servicioId, alAbrir, alUsarComoBase, alBorrar, alNuevo, alCerrar }) {
  const [filtro, setFiltro] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [preset, setPreset] = useState('todos');
  const [confirmando, setConfirmando] = useState(null);

  const elegirPreset = (id) => {
    const [d, h] = rangoPreset(id);
    setPreset(id);
    setDesde(d);
    setHasta(h);
  };

  const cambiarFecha = (campo, valor) => {
    setPreset('');
    if (campo === 'desde') setDesde(valor); else setHasta(valor);
  };

  const filtrados = useMemo(() => {
    const f = norm(filtro.trim());
    return servicios.filter((s) => {
      if (desde && s.fecha < desde) return false;
      if (hasta && s.fecha > hasta) return false;
      if (f && !norm(s.nombre).includes(f) && !norm(mesAnio(s.fecha)).includes(f)) return false;
      return true;
    });
  }, [servicios, filtro, desde, hasta]);

  const grupos = useMemo(() => {
    const mapa = new Map();
    for (const s of filtrados) {
      const clave = mesAnio(s.fecha);
      if (!mapa.has(clave)) mapa.set(clave, []);
      mapa.get(clave).push(s);
    }
    return [...mapa.entries()];
  }, [filtrados]);

  const hayFiltro = !!(desde || hasta || filtro);
  const limpiar = () => { setFiltro(''); elegirPreset('todos'); };

  return (
    <Modal
      titulo="Historial de cultos"
      ancho={720}
      alCerrar={alCerrar}
      pie={(
        <>
          <span className="tenue">{hayFiltro ? `${filtrados.length} de ${servicios.length}` : servicios.length} {servicios.length === 1 ? 'culto guardado' : 'cultos guardados'}</span>
          <span className="relleno" />
          <button className="btn btn-lleno" onClick={alNuevo}><Icono n="mas" t={16} /> Nuevo culto</button>
        </>
      )}
    >
      <div className="filtro">
        <Icono n="busqueda" t={16} />
        <input autoFocus value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Buscar por nombre o mes (octubre, domingo…)" />
      </div>
      <div className="filtros-fecha">
        <label className="campo">
          <span className="campo-et">Desde</span>
          <input type="date" value={desde} max={hasta || undefined} onChange={(e) => cambiarFecha('desde', e.target.value)} />
        </label>
        <label className="campo">
          <span className="campo-et">Hasta</span>
          <input type="date" value={hasta} min={desde || undefined} onChange={(e) => cambiarFecha('hasta', e.target.value)} />
        </label>
        <div className="presets">
          {PRESETS_FECHA.map((p) => (
            <button key={p.id} className={preset === p.id ? 'on' : ''} onClick={() => elegirPreset(p.id)}>{p.t}</button>
          ))}
          {hayFiltro && <button className="limpiar" onClick={limpiar}>Quitar filtros</button>}
        </div>
      </div>
      <div className="historial">
        {servicios.length === 0 && <p className="tenue">Todavía no hay cultos guardados. Crea el primero con «Nuevo culto».</p>}
        {servicios.length > 0 && grupos.length === 0 && <p className="tenue">Ningún culto coincide con esas fechas.</p>}
        {grupos.map(([mes, lista]) => (
          <section key={mes}>
            <h3 className="seccion-tit">{mes}</h3>
            {lista.map((s) => (
              <div key={s.id} className={`culto-fila${s.id === servicioId ? ' actual' : ''}`} onClick={() => alAbrir(s.id)}>
                <span className="culto-dia"><small>{diaSemanaCorto(s.fecha)}</small><b>{diaMes(s.fecha)}</b></span>
                <span className="culto-info">
                  <span className="culto-info-nombre">{s.nombre}</span>
                  <span className="culto-info-sub">{s.cantidad} {s.cantidad === 1 ? 'elemento' : 'elementos'}{s.id === servicioId ? ' · abierto ahora' : ''}</span>
                </span>
                <span className="culto-acciones" onClick={(e) => e.stopPropagation()}>
                  {confirmando === s.id ? (
                    <>
                      <button className="btn chico peligro" onClick={() => { setConfirmando(null); alBorrar(s); }}>Eliminar</button>
                      <button className="btn chico" onClick={() => setConfirmando(null)}>No</button>
                    </>
                  ) : (
                    <>
                      <button className="btn chico" title="Crea un culto nuevo para hoy con el mismo orden" onClick={() => alUsarComoBase(s)}><Icono n="duplicar" t={14} /> Usar de base</button>
                      <button className="icono-btn chico" title="Eliminar" onClick={() => setConfirmando(s.id)}><Icono n="borrar" t={15} /></button>
                    </>
                  )}
                </span>
              </div>
            ))}
          </section>
        ))}
      </div>
    </Modal>
  );
}
