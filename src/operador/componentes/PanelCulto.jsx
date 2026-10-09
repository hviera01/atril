import { useEffect, useRef, useState } from 'react';
import Icono from './Iconos';
import { resumenElemento } from '../../compartido/diapositivas';

const ICONO_TIPO = { biblia: 'biblia', cancion: 'cancion', imagen: 'imagen', texto: 'texto', temporizador: 'reloj', seccion: 'seccion' };

const OPCIONES_AGREGAR = [
  { tipo: 'biblia', t: 'Pasaje bíblico', d: 'Juan 3:16-18, Salmo 23…' },
  { tipo: 'cancion', t: 'Canción', d: 'Elegir de la biblioteca' },
  { tipo: 'imagen', t: 'Imagen', d: 'Ilustración o fondo' },
  { tipo: 'texto', t: 'Anuncio o texto', d: 'Mensaje libre' },
  { tipo: 'temporizador', t: 'Cuenta regresiva', d: 'Para iniciar el culto o un receso' },
  { tipo: 'seccion', t: 'Sección', d: 'Separador: Alabanza, Predicación…' },
];

export default function PanelCulto({ servicios, servicioId, elementos, foco, vivoId, libros, titulos, acciones }) {
  const [menu, setMenu] = useState(false);
  const [arrastrando, setArrastrando] = useState(null);
  const [sobre, setSobre] = useState(null);
  const refMenu = useRef(null);

  useEffect(() => {
    if (!menu) return;
    const f = (e) => { if (refMenu.current && !refMenu.current.contains(e.target)) setMenu(false); };
    window.addEventListener('mousedown', f);
    return () => window.removeEventListener('mousedown', f);
  }, [menu]);

  const soltar = (hasta) => {
    if (arrastrando !== null && arrastrando !== hasta) acciones.mover(arrastrando, hasta);
    setArrastrando(null);
    setSobre(null);
  };

  return (
    <div className="culto">
      <div className="culto-cab">
        <div className="servicio-fila">
          <select className="servicio-sel" value={servicioId || ''} onChange={(e) => acciones.elegirServicio(Number(e.target.value))}>
            {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
          <button className="icono-btn" title="Nuevo culto" onClick={acciones.nuevoServicio}><Icono n="mas" /></button>
          <button className="icono-btn" title="Cambiar nombre" onClick={acciones.renombrarServicio}><Icono n="editar" /></button>
          <button className="icono-btn" title="Duplicar culto" onClick={acciones.duplicarServicio}><Icono n="duplicar" /></button>
          <button className="icono-btn" title="Eliminar culto" onClick={acciones.borrarServicio}><Icono n="borrar" /></button>
        </div>
      </div>

      <div className="culto-lista">
        {elementos.length === 0 && (
          <div className="vacio-panel">
            <p>Este culto está vacío.</p>
            <p className="tenue">Agrega pasajes, canciones o anuncios en el orden en que los vas a proyectar.</p>
          </div>
        )}
        {elementos.map((el, i) => {
          const r = resumenElemento(el, libros, titulos);
          const vivo = vivoId === el.id;
          const enfocado = foco && foco.id === el.id;
          if (el.tipo === 'seccion') {
            return (
              <div
                key={el.id}
                className={`seccion-item${sobre === i ? ' sobre' : ''}`}
                draggable
                onDragStart={() => setArrastrando(i)}
                onDragOver={(e) => { e.preventDefault(); setSobre(i); }}
                onDrop={() => soltar(i)}
                onDragEnd={() => { setArrastrando(null); setSobre(null); }}
              >
                <span className="seccion-nombre">{r.titulo}</span>
                <span className="item-acciones">
                  <button className="icono-btn chico" title="Cambiar nombre" onClick={() => acciones.editarElemento(el)}><Icono n="editar" t={15} /></button>
                  <button className="icono-btn chico" title="Quitar" onClick={() => acciones.quitar(el.id)}><Icono n="cerrar" t={15} /></button>
                </span>
              </div>
            );
          }
          return (
            <div
              key={el.id}
              className={`item${vivo ? ' vivo' : ''}${enfocado ? ' enfocado' : ''}${sobre === i ? ' sobre' : ''}`}
              draggable
              onDragStart={() => setArrastrando(i)}
              onDragOver={(e) => { e.preventDefault(); setSobre(i); }}
              onDrop={() => soltar(i)}
              onDragEnd={() => { setArrastrando(null); setSobre(null); }}
              onClick={() => acciones.seleccionar(el)}
              onDoubleClick={() => acciones.proyectar(el)}
            >
              <span className="item-grip"><Icono n="grip" t={16} /></span>
              <span className="item-tipo"><Icono n={ICONO_TIPO[el.tipo]} t={17} /></span>
              <span className="item-texto">
                <span className="item-titulo">{r.titulo}</span>
                {r.sub ? <span className="item-sub">{r.sub}</span> : null}
              </span>
              {vivo ? <span className="item-vivo">en vivo</span> : null}
              <span className="item-acciones">
                <button className="icono-btn chico" title="Proyectar" onClick={(e) => { e.stopPropagation(); acciones.proyectar(el); }}><Icono n="play" t={14} /></button>
                <button className="icono-btn chico" title="Quitar del culto" onClick={(e) => { e.stopPropagation(); acciones.quitar(el.id); }}><Icono n="cerrar" t={15} /></button>
              </span>
            </div>
          );
        })}
        <div className="culto-fin" onDragOver={(e) => { e.preventDefault(); setSobre(elementos.length - 1); }} onDrop={() => soltar(elementos.length - 1)} />
      </div>

      <div className="culto-pie" ref={refMenu}>
        {menu && (
          <div className="menu-agregar">
            {OPCIONES_AGREGAR.map((o) => (
              <button key={o.tipo} onClick={() => { setMenu(false); acciones.agregarTipo(o.tipo); }}>
                <Icono n={ICONO_TIPO[o.tipo]} t={18} />
                <span><b>{o.t}</b><small>{o.d}</small></span>
              </button>
            ))}
          </div>
        )}
        <button className="btn btn-lleno ancho" onClick={() => setMenu((m) => !m)}>
          <Icono n="mas" t={17} /> Agregar al culto
        </button>
      </div>
    </div>
  );
}
