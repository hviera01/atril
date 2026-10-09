import Escenario from '../../compartido/Escenario';
import { completarTema } from '../../compartido/temas';
import Icono from './Iconos';

const MUESTRA = {
  modo: 'contenido',
  contenido: {
    tipo: 'versiculo',
    partes: [{ n: 1, t: 'Jehová es mi pastor; nada me faltará.' }],
    referencia: 'Salmos 23:1',
    libroNombre: 'Salmos',
    capitulo: 23,
    rango: '1',
    version: 'RVR1960',
  },
};

function titulo(contenido, vivo) {
  if (!contenido) return 'Nada proyectado';
  if (contenido.tipo === 'versiculo') return contenido.referencia;
  if (contenido.tipo === 'letra') return contenido.titulo || 'Canción';
  if (contenido.tipo === 'texto') return contenido.titulo || 'Texto';
  if (contenido.tipo === 'imagen') return 'Imagen';
  if (contenido.tipo === 'temporizador') return contenido.titulo || 'Cuenta regresiva';
  return '';
}

export default function PanelVivo({ modo, contenido, tema, vivo, siguiente, temas, temaId, proy, esVerso, videoCtl, acciones }) {
  const activas = proy ? proy.pantallas.filter((p) => p.activa).length : 0;
  const enVivo = modo === 'contenido' && !!contenido;
  const etiquetaModo = modo === 'negro' ? 'Pantalla en negro' : modo === 'logo' ? 'Logo de la iglesia' : enVivo ? 'En vivo' : 'Sin proyectar';
  const progreso = vivo && vivo.origen === 'elemento' && vivo.total ? `${vivo.indice + 1} / ${vivo.total}` : '';

  return (
    <div className="vivo">
      <div className="proy-franja">
        <span className={`proy-punto${proy && proy.abierta ? ' on' : ''}`} />
        <span className="proy-texto">
          {proy && proy.abierta ? 'Proyección abierta' : 'Proyección cerrada'}
          {proy && proy.abierta && activas > 1 ? <small> · {activas} pantallas</small> : null}
        </span>
        {proy && proy.abierta
          ? <button className="btn chico" onClick={acciones.cerrarProyeccion}>Cerrar</button>
          : <button className="btn btn-lleno chico" onClick={acciones.abrirProyeccion}><Icono n="pantalla" t={15} /> Abrir proyección</button>}
      </div>

      {proy && proy.pantallas.length > 1 && (
        <div className="pantallas-fila">
          {proy.pantallas.map((p) => {
            const encendida = proy.abierta ? p.activa : p.elegida;
            return (
              <button key={p.id} className={`pantalla-chip${encendida ? ' on' : ''}`} title={`${p.nombre} · ${p.ancho}×${p.alto}`} onClick={() => acciones.activarPantalla(p.id, !encendida)}>
                <Icono n="pantalla" t={15} />{p.numero}
              </button>
            );
          })}
          <button className="btn chico" onClick={acciones.identificar} title="Muestra el número en cada pantalla">Identificar</button>
        </div>
      )}

      <div className={`pant-marco${modo === 'negro' ? ' negro' : enVivo ? ' en-vivo' : ''}`}>
        <Escenario frame={{ modo, contenido, video: videoCtl }} tema={tema} silenciar />
        <div className="pant-pie">
          <span className="pant-estado"><i />{etiquetaModo}</span>
          <span className="pant-titulo">{modo === 'contenido' ? titulo(contenido, vivo) : ''}</span>
          <span className="pant-prog">{progreso}</span>
        </div>
      </div>

      {contenido && contenido.tipo === 'video' && modo === 'contenido' && (
        <div className="video-ctl">
          <button className="btn" onClick={acciones.videoPausa}><Icono n={videoCtl.pausa ? 'play' : 'pausa'} t={15} /> {videoCtl.pausa ? 'Reproducir' : 'Pausar'}</button>
          <button className="btn" onClick={acciones.videoReiniciar}><Icono n="actualizar" t={15} /> Reiniciar</button>
          <button className={`btn${videoCtl.silencio ? ' btn-oro' : ''}`} onClick={acciones.videoSilencio}><Icono n={videoCtl.silencio ? 'silencio' : 'sonido'} t={16} /> {videoCtl.silencio ? 'Sin sonido' : 'Sonido'}</button>
        </div>
      )}

      <div className="mandos">
        <button className="mando" onClick={acciones.anterior} title="Anterior (←)"><Icono n="anterior" t={22} /><span>Anterior</span></button>
        <button className="mando principal" onClick={acciones.siguiente} title="Siguiente (→ o Espacio)"><span>Siguiente</span><Icono n="siguiente" t={22} /></button>
      </div>

      <div className="navegar">
        {esVerso && (
          <>
            <button onClick={acciones.versoAnterior} title="Versículo anterior (↑)"><span>Versículo anterior</span><kbd>↑</kbd></button>
            <button onClick={acciones.versoSiguiente} title="Versículo siguiente (↓)"><span>Versículo siguiente</span><kbd>↓</kbd></button>
          </>
        )}
        <button onClick={acciones.elementoAnterior} title="Elemento anterior del culto (Re Pág)"><span>Elemento anterior</span><kbd>Re Pág</kbd></button>
        <button onClick={acciones.elementoSiguiente} title="Elemento siguiente del culto (Av Pág)"><span>Elemento siguiente</span><kbd>Av Pág</kbd></button>
      </div>

      <div className="extras">
        <button className={`extra${modo === 'negro' ? ' on' : ''}`} onClick={acciones.negro} title="Pantalla en negro (B)"><Icono n="negro" t={16} />Negro<kbd>B</kbd></button>
        <button className={`extra${modo === 'logo' ? ' on' : ''}`} onClick={acciones.logo} title="Logo de la iglesia (L)"><Icono n="logo" t={16} />Logo<kbd>L</kbd></button>
        <button className="extra" onClick={acciones.limpiar} title="Limpiar pantalla (C)"><Icono n="limpiar" t={16} />Limpiar<kbd>C</kbd></button>
      </div>

      <div className="sigue">
        <span className="rotulo">Sigue</span>
        {siguiente
          ? <div className="sigue-vista"><Escenario frame={{ modo: 'contenido', contenido: siguiente }} tema={tema} estatico /></div>
          : <div className="sigue-vacio">Fin del elemento</div>}
      </div>

      <div className="temas">
        <div className="temas-cab">
          <span className="rotulo">Diseño</span>
          <button className="btn chico" onClick={acciones.abrirDiseno}><Icono n="paleta" t={15} /> Editar diseños</button>
        </div>
        <div className="temas-fila">
          {temas.map((t) => {
            const c = completarTema(t);
            return (
              <button key={c.id} className={`tema-chip${c.id === temaId ? ' on' : ''}`} onClick={() => acciones.elegirTema(c.id)} title={c.nombre}>
                <span className="tema-muestra"><Escenario frame={MUESTRA} tema={c} estatico /></span>
                <span className="tema-nombre">{c.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
