import { useEffect, useState } from 'react';
import Icono from './Iconos';
import LogoOpciones from './LogoOpciones';
import { IGLESIA } from '../../compartido/iglesia';
import { nombreReferencia, corridas, rangoTexto } from '../../compartido/diapositivas';
import logoRedondo from '../../compartido/logo-redondo.png';

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function Resaltado({ texto, consulta }) {
  const palabras = norm(consulta).replace(/[^a-z0-9ñ ]+/g, ' ').split(/\s+/).filter((p) => p.length >= 2);
  if (!palabras.length) return texto;
  const base = Array.from(texto).map((c) => c.normalize('NFD')[0].toLowerCase()).join('');
  const marcas = new Array(texto.length).fill(false);
  for (const p of palabras) {
    let i = base.indexOf(p);
    while (i !== -1) {
      for (let k = i; k < i + p.length; k++) marcas[k] = true;
      i = base.indexOf(p, i + p.length);
    }
  }
  const trozos = [];
  let inicio = 0;
  for (let i = 1; i <= texto.length; i++) {
    if (i === texto.length || marcas[i] !== marcas[inicio]) {
      const t = texto.slice(inicio, i);
      trozos.push(marcas[inicio] ? <mark key={inicio}>{t}</mark> : t);
      inicio = i;
    }
  }
  return trozos;
}

function Atajos() {
  const filas = [
    ['/', 'Buscar pasaje, palabra o canción'],
    ['→  o  Espacio', 'Siguiente diapositiva'],
    ['←', 'Diapositiva anterior'],
    ['↓  /  ↑', 'Versículo siguiente / anterior, aunque no esté en el culto'],
    ['Av Pág  /  Re Pág', 'Siguiente / anterior elemento del culto'],
    ['1 – 9', 'Proyectar esa diapositiva del elemento'],
    ['B', 'Pantalla en negro'],
    ['L', 'Logo de la iglesia'],
    ['C', 'Limpiar pantalla'],
  ];
  return (
    <div className="bienvenida">
      <img src={logoRedondo} alt="" className="bienvenida-logo" />
      <h1>{IGLESIA.nombre}</h1>
      <p className="bienvenida-sub">Escribe arriba cualquier pasaje —<em> jn 3 16</em>, <em>salmo 23</em>, <em>1 co 13:4-7</em>— o una palabra del versículo, y presiona Enter para proyectarlo al instante.</p>
      <div className="atajos">
        {filas.map(([k, t]) => (
          <div key={k} className="atajo"><kbd>{k}</kbd><span>{t}</span></div>
        ))}
      </div>
    </div>
  );
}

function VistaFoco({ foco, diaps, vivo, acciones }) {
  const esTemp = foco.id.startsWith('tmp-');
  const vivoAqui = vivo && vivo.origen === 'elemento' && vivo.elemento.id === foco.id ? vivo.indice : -1;
  const titulo = foco.tipo === 'biblia'
    ? nombreReferencia(acciones.libros, foco.libro, foco.capitulo, foco.desde, foco.hasta)
    : foco.titulo || foco.nombre || 'Elemento';
  const editable = ['texto', 'temporizador', 'seccion'].includes(foco.tipo) && !esTemp;
  return (
    <div className="foco">
      <div className="foco-cab">
        <div className="foco-titulos">
          <span className="foco-tipo">{{ biblia: 'Pasaje bíblico · RVR1960', cancion: 'Canción', imagen: 'Imagen', video: 'Video', texto: 'Anuncio o texto', temporizador: 'Cuenta regresiva' }[foco.tipo]}</span>
          <h2>{titulo}</h2>
        </div>
        <div className="foco-acciones">
          {(foco.tipo === 'imagen' || foco.tipo === 'video') && <LogoOpciones medio={foco} alCambiar={(logo, comoDefecto) => acciones.cambiarLogo(foco, logo, comoDefecto)} />}
          {foco.tipo === 'biblia' && !esTemp && (
            <div className="agrupar" title="Versículos por diapositiva">
              <span>Por diapositiva</span>
              {[1, 2, 3, 4].map((n) => (
                <button key={n} className={(foco.agrupar || 1) === n ? 'on' : ''} onClick={() => acciones.cambiarAgrupar(foco, n)}>{n}</button>
              ))}
            </div>
          )}
          {foco.tipo === 'cancion' && <button className="btn" onClick={() => acciones.editarCancion(foco.cancionId)}><Icono n="editar" t={16} /> Editar letra</button>}
          {editable && <button className="btn" onClick={() => acciones.editarElemento(foco)}><Icono n="editar" t={16} /> Editar</button>}
          {esTemp && <button className="btn btn-lleno" onClick={() => acciones.agregarFoco(foco)}><Icono n="mas" t={16} /> Agregar al culto</button>}
        </div>
      </div>
      {diaps.length === 0 ? (
        <div className="vacio-panel"><p>Este elemento no tiene diapositivas.</p></div>
      ) : (
        <div className="diaps">
          {diaps.map((d, i) => (
            <button key={i} className={`diap${vivoAqui === i ? ' vivo' : ''}${vivoAqui >= 0 && vivoAqui + 1 === i ? ' sigue' : ''}`} onClick={() => acciones.proyectarDiap(i)}>
              <span className="diap-cab">
                <span className="diap-n">{i < 9 ? i + 1 : ''}</span>
                <span className="diap-et">{d.etiqueta}</span>
                {vivoAqui === i && <span className="diap-vivo">en vivo</span>}
              </span>
              {d.imagen ? (d.esVideo ? <video src={`${d.imagen}#t=0.1`} muted preload="metadata" /> : <img src={d.imagen} alt="" />) : <span className="diap-texto">{d.contenido.tipo === 'letra' ? d.contenido.lineas.map((l, k) => <span key={k}>{l}</span>) : d.resumen}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Capitulo({ res, libros, vivo, acciones }) {
  const { libro, capitulo, desde, hasta } = res.referencia;
  const [ancla, setAncla] = useState(null);
  const [marcados, setMarcados] = useState([]);
  const [anclaMarca, setAnclaMarca] = useState(null);
  const l = libros[libro - 1];
  const vivoBiblia = vivo && vivo.origen === 'biblia' && vivo.libro === libro && vivo.capitulo === capitulo ? vivo : null;

  useEffect(() => {
    setAncla(null);
    if (desde) {
      const el = document.getElementById(`v-${desde}`);
      if (el) el.scrollIntoView({ block: 'center' });
    }
  }, [libro, capitulo, desde]);

  useEffect(() => {
    setMarcados([]);
    setAnclaMarca(null);
  }, [libro, capitulo]);

  const alternar = (v, e) => {
    if (e.shiftKey && anclaMarca !== null) {
      const a = Math.min(anclaMarca, v);
      const b = Math.max(anclaMarca, v);
      const rango = Array.from({ length: b - a + 1 }, (_, i) => a + i);
      setMarcados([...new Set([...marcados, ...rango])].sort((x, y) => x - y));
      return;
    }
    setAnclaMarca(v);
    setMarcados(marcados.includes(v) ? marcados.filter((x) => x !== v) : [...marcados, v].sort((x, y) => x - y));
  };

  const agregarMarcados = () => acciones.agregarVarios(corridas(marcados).map(([a, b]) => ({ tipo: 'biblia', libro, capitulo, desde: a, hasta: b, agrupar: 1 })));

  const irA = (cap) => {
    let lb = libro;
    let c = cap;
    if (c < 1) { if (lb === 1) return; lb -= 1; c = libros[lb - 1].capitulos; }
    if (c > libros[lb - 1].capitulos) { if (lb === 66) return; lb += 1; c = 1; }
    acciones.irA(`${libros[lb - 1].nombre} ${c}`);
  };

  const clic = (v, e) => {
    if (e.shiftKey && ancla) {
      const a = Math.min(ancla, v);
      const b = Math.max(ancla, v);
      acciones.proyectarVersiculo(libro, capitulo, a, b);
    } else {
      setAncla(v);
      acciones.proyectarVersiculo(libro, capitulo, v);
    }
  };

  const sel = vivoBiblia ? `${vivoBiblia.desde}${vivoBiblia.hasta !== vivoBiblia.desde ? `-${vivoBiblia.hasta}` : ''}` : null;

  return (
    <div className="capitulo">
      <div className="foco-cab">
        <div className="foco-titulos">
          <span className="foco-tipo">Biblia · Reina-Valera 1960</span>
          <h2>{l.nombre} {capitulo}</h2>
        </div>
        <div className="foco-acciones">
          <button className="icono-btn borde" title="Capítulo anterior" onClick={() => irA(capitulo - 1)}><Icono n="anterior" /></button>
          <button className="icono-btn borde" title="Capítulo siguiente" onClick={() => irA(capitulo + 1)}><Icono n="siguiente" /></button>
          {sel && <button className="btn" onClick={() => acciones.agregarPasaje(libro, capitulo, vivoBiblia.desde, vivoBiblia.hasta)}><Icono n="mas" t={16} /> Agregar {l.nombre} {capitulo}:{sel}</button>}
          <button className="btn" onClick={() => acciones.agregarPasaje(libro, capitulo, null, null)}><Icono n="mas" t={16} /> Capítulo completo</button>
        </div>
      </div>
      <div className="pista-fila">
        <p className="tenue chico-texto pista">Clic en el versículo lo proyecta. Marca varios con las casillas, aunque no estén seguidos (Shift para un rango).</p>
        <button className="btn chico" onClick={() => { setMarcados(res.versiculos.map((v) => v.v)); setAnclaMarca(null); }}>Marcar todos</button>
      </div>
      <div className="versos">
        {res.versiculos.map((v) => {
          const enVivo = vivoBiblia && v.v >= vivoBiblia.desde && v.v <= vivoBiblia.hasta;
          const pedido = desde && v.v >= desde && v.v <= (hasta || desde);
          const marcado = marcados.includes(v.v);
          return (
            <div key={v.v} className="verso-fila">
              <button className={`verso-check${marcado ? ' on' : ''}`} aria-pressed={marcado} title="Marcar este versículo" onClick={(e) => alternar(v.v, e)}>
                <span className={`caja${marcado ? ' on' : ''}`}>{marcado && <Icono n="check" t={14} />}</span>
              </button>
              <button id={`v-${v.v}`} className={`verso${enVivo ? ' vivo' : ''}${pedido && !enVivo ? ' pedido' : ''}${marcado ? ' marcado' : ''}`} onClick={(e) => clic(v.v, e)}>
                <span className="verso-n">{v.v}</span>
                <span className="verso-t">{v.t}</span>
              </button>
            </div>
          );
        })}
      </div>
      {marcados.length > 0 && (
        <div className="barra-seleccion">
          <span className="barra-sel-txt"><b>{marcados.length}</b> {marcados.length === 1 ? 'versículo' : 'versículos'} · {l.nombre} {capitulo}:{rangoTexto(marcados)}</span>
          <span className="relleno" />
          <button className="btn" onClick={() => { setMarcados([]); setAnclaMarca(null); }}>Quitar marcas</button>
          <button className="btn" onClick={agregarMarcados}><Icono n="mas" t={16} /> Agregar al culto</button>
          <button className="btn btn-lleno" onClick={() => acciones.proyectarVersiculos(libro, capitulo, marcados)}><Icono n="play" t={14} /> Proyectar</button>
        </div>
      )}
    </div>
  );
}

function Libros({ res, libros, acciones }) {
  return (
    <div className="libros-sug">
      {res.libros.slice(0, 6).map((id) => {
        const l = libros[id - 1];
        return (
          <div key={id} className="libro-sug">
            <h3>{l.nombre}<span> · {l.capitulos} {l.capitulos === 1 ? 'capítulo' : 'capítulos'}</span></h3>
            <div className="caps">
              {Array.from({ length: l.capitulos }, (_, i) => i + 1).map((c) => (
                <button key={c} onClick={() => acciones.irA(`${l.nombre} ${c}`)}>{c}</button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VistaBusqueda({ consulta, res, libros, vivo, acciones }) {
  if (!res) return <div className="vacio-panel"><p>Buscando…</p></div>;
  const hayLibros = !res.referencia && res.libros.length > 0;
  const nada = !res.referencia && !hayLibros && res.palabras.length === 0 && res.canciones.length === 0;
  return (
    <div className="busqueda">
      {res.referencia && <Capitulo res={res} libros={libros} vivo={vivo} acciones={acciones} />}
      {hayLibros && <Libros res={res} libros={libros} acciones={acciones} />}
      {res.palabras.length > 0 && (
        <section>
          <h3 className="seccion-tit">Versículos que contienen «{consulta.trim()}»<span>{res.palabras.length >= 80 ? ' · primeros 80' : ` · ${res.palabras.length}`}</span></h3>
          <div className="versos">
            {res.palabras.map((v) => (
              <button key={`${v.libro}-${v.capitulo}-${v.versiculo}`} className="verso con-ref" onClick={() => acciones.proyectarVersiculo(v.libro, v.capitulo, v.versiculo)}>
                <span className="verso-ref">{libros[v.libro - 1].nombre} {v.capitulo}:{v.versiculo}</span>
                <span className="verso-t"><Resaltado texto={v.texto} consulta={consulta} /></span>
                <span className="verso-mas" onClick={(e) => { e.stopPropagation(); acciones.irA(`${libros[v.libro - 1].nombre} ${v.capitulo}:${v.versiculo}`); }}>Ver capítulo</span>
              </button>
            ))}
          </div>
        </section>
      )}
      {res.canciones.length > 0 && (
        <section>
          <h3 className="seccion-tit">Canciones</h3>
          <div className="lista-canciones">
            {res.canciones.map((c) => (
              <div key={c.id} className="fila-cancion" onClick={() => acciones.vistaPreviaCancion(c)}>
                <span className="item-tipo"><Icono n="cancion" t={17} /></span>
                <span className="item-texto"><span className="item-titulo">{c.titulo}</span>{c.autor ? <span className="item-sub">{c.autor}</span> : null}</span>
                <span className="fila-botones">
                  <button className="btn chico" onClick={(e) => { e.stopPropagation(); acciones.proyectarCancion(c); }}><Icono n="play" t={13} /> Proyectar</button>
                  <button className="btn chico" onClick={(e) => { e.stopPropagation(); acciones.agregarCancion(c); }}><Icono n="mas" t={14} /> Al culto</button>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
      {nada && <div className="vacio-panel"><p>No encontré nada para «{consulta.trim()}».</p><p className="tenue">Prueba con otra palabra o escribe el pasaje, por ejemplo «romanos 8:28».</p></div>}
    </div>
  );
}

export default function Mesa({ consulta, res, libros, foco, diaps, vivo, acciones }) {
  return (
    <div className="mesa">
      {consulta.trim()
        ? <VistaBusqueda consulta={consulta} res={res} libros={libros} vivo={vivo} acciones={acciones} />
        : foco
          ? <VistaFoco foco={foco} diaps={diaps} vivo={vivo} acciones={acciones} />
          : <Atajos />}
    </div>
  );
}
