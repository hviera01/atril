import Escenario from '../../compartido/Escenario';
import { fuenteCss, completarTema } from '../../compartido/temas';
import Icono from './Iconos';

function fondoMuestra(t) {
  const f = t.fondo;
  if (f.tipo === 'imagen' && f.medio) return `center / cover url(${f.medio})`;
  if (f.tipo === 'color' || f.tipo === 'video') return f.color;
  return `linear-gradient(${f.angulo}deg, ${f.color}, ${f.color2})`;
}

function titulo(contenido, vivo) {
  if (!contenido) return 'Nada proyectado';
  if (contenido.tipo === 'versiculo') return contenido.referencia;
  if (contenido.tipo === 'letra') return contenido.titulo || 'Canción';
  if (contenido.tipo === 'texto') return contenido.titulo || 'Texto';
  if (contenido.tipo === 'imagen') return 'Imagen';
  if (contenido.tipo === 'temporizador') return contenido.titulo || 'Cuenta regresiva';
  return '';
}

export default function PanelVivo({ modo, contenido, tema, vivo, siguiente, temas, temaId, proy, acciones }) {
  const enVivo = modo === 'contenido' && !!contenido;
  const etiquetaModo = modo === 'negro' ? 'Pantalla en negro' : modo === 'logo' ? 'Logo de la iglesia' : enVivo ? 'En vivo' : 'Sin proyectar';
  const progreso = vivo && vivo.origen === 'elemento' && vivo.total ? `${vivo.indice + 1} / ${vivo.total}` : '';

  return (
    <div className="vivo">
      <div className="proy-franja">
        <span className={`proy-punto${proy && proy.abierta ? ' on' : ''}`} />
        <span className="proy-texto">
          {proy && proy.abierta ? 'Proyección abierta' : 'Proyección cerrada'}
          {proy && proy.abierta && proy.pantallas.length > 1 ? <small> · {proy.pantallas.find((p) => p.id === proy.pantallaId)?.nombre}</small> : null}
        </span>
        {proy && proy.abierta
          ? <button className="btn chico" onClick={acciones.cerrarProyeccion}>Cerrar</button>
          : <button className="btn btn-lleno chico" onClick={acciones.abrirProyeccion}><Icono n="pantalla" t={15} /> Abrir proyección</button>}
      </div>

      <div className={`pant-marco${modo === 'negro' ? ' negro' : enVivo ? ' en-vivo' : ''}`}>
        <Escenario frame={{ modo, contenido }} tema={tema} />
        <div className="pant-pie">
          <span className="pant-estado"><i />{etiquetaModo}</span>
          <span className="pant-titulo">{modo === 'contenido' ? titulo(contenido, vivo) : ''}</span>
          <span className="pant-prog">{progreso}</span>
        </div>
      </div>

      <div className="mandos">
        <button className="mando" onClick={acciones.anterior} title="Anterior (←)"><Icono n="anterior" t={22} /><span>Anterior</span></button>
        <button className="mando principal" onClick={acciones.siguiente} title="Siguiente (→ o Espacio)"><span>Siguiente</span><Icono n="siguiente" t={22} /></button>
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
                <span className="tema-muestra" style={{ background: fondoMuestra(c), color: c.texto.color, fontFamily: fuenteCss(c.texto.fuente), fontWeight: c.texto.peso }}>Aa</span>
                <span className="tema-nombre">{c.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
