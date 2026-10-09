import { useMemo, useState } from 'react';
import { Modal } from './Modal';
import Icono from './Iconos';
import { diaMes, diaSemanaCorto, mesAnio } from '../../compartido/fechas';

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function HistorialCultos({ servicios, servicioId, alAbrir, alUsarComoBase, alBorrar, alNuevo, alCerrar }) {
  const [filtro, setFiltro] = useState('');
  const [confirmando, setConfirmando] = useState(null);

  const grupos = useMemo(() => {
    const f = norm(filtro.trim());
    const mapa = new Map();
    for (const s of servicios) {
      if (f && !norm(s.nombre).includes(f) && !norm(mesAnio(s.fecha)).includes(f)) continue;
      const clave = mesAnio(s.fecha);
      if (!mapa.has(clave)) mapa.set(clave, []);
      mapa.get(clave).push(s);
    }
    return [...mapa.entries()];
  }, [servicios, filtro]);

  return (
    <Modal
      titulo="Historial de cultos"
      ancho={680}
      alCerrar={alCerrar}
      pie={(<><span className="tenue">{servicios.length} {servicios.length === 1 ? 'culto guardado' : 'cultos guardados'}</span><span className="relleno" /><button className="btn btn-lleno" onClick={alNuevo}><Icono n="mas" t={16} /> Nuevo culto</button></>)}
    >
      <div className="filtro">
        <Icono n="busqueda" t={16} />
        <input autoFocus value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Buscar por nombre o mes (octubre, domingo…)" />
      </div>
      <div className="historial">
        {grupos.length === 0 && <p className="tenue">No hay cultos que coincidan.</p>}
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
