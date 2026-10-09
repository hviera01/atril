import { useEffect, useMemo, useRef, useState } from 'react';
import Icono from './componentes/Iconos';
import PanelCulto from './componentes/PanelCulto';
import { PanelCanciones, PanelMedios, PanelBiblia } from './componentes/PanelBiblioteca';
import SelectorPasaje from './componentes/SelectorPasaje';
import HistorialCultos from './componentes/HistorialCultos';
import Mesa from './componentes/Mesa';
import PanelVivo from './componentes/PanelVivo';
import EditorCancion from './componentes/EditorCancion';
import EditorTema from './componentes/EditorTema';
import { Ajustes, Remoto } from './componentes/Ajustes';
import { FormCulto, SECCIONES_BASE, FormTexto, FormTemporizador, FormNombre, Confirmar } from './componentes/FormulariosCulto';
import { hoy } from '../compartido/fechas';
import { TEMAS_INTEGRADOS, completarTema } from '../compartido/temas';
import { IGLESIA } from '../compartido/iglesia';
import { capituloBiblia, construirDiapositivas, contenidoVersiculos, resumenElemento } from '../compartido/diapositivas';
import logoRedondo from '../compartido/logo-redondo.png';

const uid = () => crypto.randomUUID();
const enCampoDeTexto = (t) => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);

function textoDe(c) {
  if (!c) return '';
  if (c.tipo === 'versiculo') return c.partes.map((p) => p.t).join(' ');
  if (c.tipo === 'letra' || c.tipo === 'texto') return c.lineas.join(' / ');
  if (c.tipo === 'temporizador') return `${c.titulo || 'Cuenta regresiva'} · ${c.minutos} min`;
  if (c.tipo === 'imagen') return 'Imagen';
  return '';
}

export default function App() {
  const [libros, setLibros] = useState([]);
  const [version, setVersion] = useState('');
  const [servicios, setServicios] = useState([]);
  const [servicioId, setServicioId] = useState(null);
  const [elementos, setElementos] = useState([]);
  const [elementosDe, setElementosDe] = useState(null);
  const [focoId, setFocoId] = useState(null);
  const [focoTmp, setFocoTmp] = useState(null);
  const [diapsFoco, setDiapsFoco] = useState([]);
  const [vivo, setVivo] = useState(null);
  const [modo, setModo] = useState('contenido');
  const [contenido, setContenido] = useState(null);
  const [siguiente, setSiguiente] = useState(null);
  const [temas, setTemas] = useState([]);
  const [temaId, setTemaId] = useState('madrugada');
  const [consulta, setConsulta] = useState('');
  const [res, setRes] = useState(null);
  const [pestana, setPestana] = useState('culto');
  const [modal, setModal] = useState(null);
  const [maxLineas, setMaxLineas] = useState(4);
  const [proy, setProy] = useState(null);
  const [nueva, setNueva] = useState(null);
  const [aviso, setAviso] = useState('');
  const [versionDatos, setVersionDatos] = useState(0);
  const [listo, setListo] = useState(false);
  const [destinoId, setDestinoId] = useState(null);
  const buscador = useRef(null);
  const acc = useRef({});
  const ultimoUso = useRef(null);

  const todosTemas = useMemo(() => [...TEMAS_INTEGRADOS, ...temas], [temas]);
  const tema = useMemo(() => completarTema(todosTemas.find((t) => t.id === temaId) || todosTemas[0]), [todosTemas, temaId]);
  const focoEl = focoTmp || elementos.find((e) => e.id === focoId) || null;

  const avisar = (t) => {
    setAviso(t);
    clearTimeout(avisar.h);
    avisar.h = setTimeout(() => setAviso(''), 3600);
  };

  const cargarServicio = async (id) => {
    const els = await window.atril.servicios.elementos(id);
    setElementos(els);
    setElementosDe(id);
    setServicioId(id);
    setFocoId(null);
    setFocoTmp(null);
    setDestinoId(null);
    window.atril.guardarAjuste('servicioActivo', id);
  };

  const recargarServicios = async () => {
    const lista = await window.atril.servicios.listar();
    setServicios(lista);
    return lista;
  };

  useEffect(() => {
    (async () => {
      setLibros(await window.atril.libros());
      setVersion(await window.atril.version());
      setMaxLineas(await window.atril.ajuste('maxLineas', 4));
      setTemas(await window.atril.ajuste('temasPersonalizados', []));
      setTemaId(await window.atril.ajuste('temaActivo', 'madrugada'));
      let lista = await window.atril.servicios.listar();
      if (!lista.length) {
        await window.atril.servicios.crear('Culto', hoy());
        lista = await window.atril.servicios.listar();
      }
      setServicios(lista);
      const activo = await window.atril.ajuste('servicioActivo', null);
      await cargarServicio((lista.find((s) => s.id === activo) || lista[0]).id);
      setProy(await window.atril.proyeccion.estado());
      setListo(true);
    })();
    const quitarProy = window.atril.proyeccion.alCambiar(setProy);
    const quitarAct = window.atril.actualizar.alDisponible(setNueva);
    const quitarRemoto = window.atril.remoto.alComando((c) => acc.current.comandoRemoto(c));
    return () => { quitarProy(); quitarAct(); quitarRemoto(); };
  }, []);

  useEffect(() => {
    if (!listo || elementosDe !== servicioId || !servicioId) return;
    const h = setTimeout(() => window.atril.servicios.guardar(servicioId, elementos), 350);
    return () => clearTimeout(h);
  }, [elementos, elementosDe, servicioId, listo]);

  useEffect(() => {
    if (!listo) return;
    window.atril.proyeccion.enviar({ frame: { modo, contenido }, tema });
  }, [modo, contenido, tema, listo]);

  useEffect(() => {
    if (!listo) return;
    const nombre = (servicios.find((s) => s.id === servicioId) || {}).nombre || '';
    const els = elementos.map((e) => {
      const r = resumenElemento(e, libros, {});
      return { id: e.id, tipo: e.tipo, titulo: r.titulo, sub: r.sub };
    });
    const v = contenido ? {
      elementoId: vivo && vivo.origen === 'elemento' ? vivo.elemento.id : null,
      ref: contenido.tipo === 'versiculo' ? contenido.referencia : contenido.titulo || '',
      titulo: contenido.titulo || '',
      texto: textoDe(contenido),
    } : null;
    window.atril.remoto.publicar({ servicio: nombre, elementos: els, vivo: v, modo });
  }, [servicios, servicioId, elementos, vivo, modo, contenido, libros, listo]);

  useEffect(() => {
    if (!consulta.trim()) { setRes(null); return; }
    let activo = true;
    const h = setTimeout(async () => {
      const r = await window.atril.buscar(consulta);
      if (activo) setRes(r);
    }, 110);
    return () => { activo = false; clearTimeout(h); };
  }, [consulta, versionDatos]);

  useEffect(() => {
    if (!focoEl || !libros.length) { setDiapsFoco([]); return; }
    let activo = true;
    construirDiapositivas(focoEl, { libros, maxLineas }).then((d) => { if (activo) setDiapsFoco(d); });
    return () => { activo = false; };
  }, [focoEl, libros, maxLineas, versionDatos]);

  useEffect(() => {
    if (!libros.length) return;
    let activo = true;
    (async () => {
      let c = null;
      if (vivo && vivo.origen === 'biblia') {
        const sig = await versiculoVecino(vivo.libro, vivo.capitulo, vivo.hasta, 1);
        if (sig) c = contenidoVersiculos(libros, sig.libro, sig.capitulo, [sig.verso]);
      } else if (vivo && vivo.origen === 'elemento') {
        const diaps = await construirDiapositivas(vivo.elemento, { libros, maxLineas });
        if (vivo.indice + 1 < diaps.length) c = diaps[vivo.indice + 1].contenido;
        else {
          const i = elementos.findIndex((e) => e.id === vivo.elemento.id);
          const prox = i >= 0 ? elementos.slice(i + 1).find((e) => e.tipo !== 'seccion') : null;
          if (prox) {
            const d = await construirDiapositivas(prox, { libros, maxLineas });
            c = d[0] ? d[0].contenido : null;
          }
        }
      } else if (diapsFoco[0]) c = diapsFoco[0].contenido;
      if (c && c.tipo === 'temporizador') c = { ...c, finEn: Date.now() + c.minutos * 60000 };
      if (activo) setSiguiente(c);
    })();
    return () => { activo = false; };
  }, [vivo, elementos, diapsFoco, libros, maxLineas]);

  async function versiculoVecino(libro, capitulo, verso, dir) {
    const caps = await capituloBiblia(libro, capitulo);
    let l = libro;
    let c = capitulo;
    let v = verso + dir;
    if (v > caps.length) {
      c += 1;
      v = 1;
      if (c > libros[l - 1].capitulos) { if (l === 66) return null; l += 1; c = 1; }
    } else if (v < 1) {
      c -= 1;
      if (c < 1) { if (l === 1) return null; l -= 1; c = libros[l - 1].capitulos; }
      const prev = await capituloBiblia(l, c);
      v = prev.length;
    }
    const lista = await capituloBiblia(l, c);
    const dato = lista.find((x) => x.v === v);
    return dato ? { libro: l, capitulo: c, verso: dato } : null;
  }

  const proyectarDiap = async (el, indice, diapsPrevias) => {
    const diaps = diapsPrevias || await construirDiapositivas(el, { libros, maxLineas });
    const d = diaps[indice];
    if (!d) return;
    let c = d.contenido;
    if (c.tipo === 'temporizador') c = { ...c, finEn: Date.now() + c.minutos * 60000 };
    setContenido(c);
    setModo('contenido');
    setVivo({ origen: 'elemento', elemento: el, indice, total: diaps.length });
    if (el.tipo === 'cancion' && ultimoUso.current !== el.id) {
      ultimoUso.current = el.id;
      window.atril.canciones.uso(el.cancionId);
    }
  };

  const proyectarVersiculo = async (libro, capitulo, desde, hasta, anclaId = null) => {
    const todos = await capituloBiblia(libro, capitulo);
    const fin = hasta || desde;
    const sel = todos.filter((x) => x.v >= desde && x.v <= fin);
    if (!sel.length) return;
    setContenido(contenidoVersiculos(libros, libro, capitulo, sel));
    setModo('contenido');
    setVivo({ origen: 'biblia', libro, capitulo, desde: sel[0].v, hasta: sel[sel.length - 1].v, anclaId });
  };

  const versiculoActual = () => {
    if (!vivo) return null;
    if (vivo.origen === 'biblia') return vivo;
    if (vivo.elemento.tipo === 'biblia' && contenido && contenido.tipo === 'versiculo') {
      return { libro: vivo.elemento.libro, capitulo: vivo.elemento.capitulo, desde: contenido.partes[0].n, hasta: contenido.partes[contenido.partes.length - 1].n };
    }
    return null;
  };

  const versoNav = async (dir) => {
    const v = versiculoActual();
    if (!v) { if (dir > 0) await irSiguiente(); else await irAnterior(); return; }
    const vec = await versiculoVecino(v.libro, v.capitulo, dir > 0 ? v.hasta : v.desde, dir);
    if (vec) await proyectarVersiculo(vec.libro, vec.capitulo, vec.verso.v, null, vivo.origen === 'elemento' ? vivo.elemento.id : vivo.anclaId);
  };

  const irAElemento = async (el, ultima) => {
    setFocoTmp(null);
    setFocoId(el.id);
    const diaps = await construirDiapositivas(el, { libros, maxLineas });
    await proyectarDiap(el, ultima ? diaps.length - 1 : 0, diaps);
  };

  const irSiguiente = async () => {
    if (!vivo) {
      if (focoEl && diapsFoco.length) await proyectarDiap(focoEl, 0, diapsFoco);
      return;
    }
    if (vivo.origen === 'biblia') { await versoNav(1); return; }
    const diaps = await construirDiapositivas(vivo.elemento, { libros, maxLineas });
    if (vivo.indice + 1 < diaps.length) { await proyectarDiap(vivo.elemento, vivo.indice + 1, diaps); return; }
    const i = elementos.findIndex((e) => e.id === vivo.elemento.id);
    if (i < 0) return;
    const prox = elementos.slice(i + 1).find((e) => e.tipo !== 'seccion');
    if (prox) await irAElemento(prox, false);
  };

  const irAnterior = async () => {
    if (!vivo) return;
    if (vivo.origen === 'biblia') { await versoNav(-1); return; }
    if (vivo.indice > 0) { await proyectarDiap(vivo.elemento, vivo.indice - 1); return; }
    const i = elementos.findIndex((e) => e.id === vivo.elemento.id);
    if (i <= 0) return;
    const prev = elementos.slice(0, i).reverse().find((e) => e.tipo !== 'seccion');
    if (prev) await irAElemento(prev, true);
  };

  const elementoVecino = async (dir) => {
    const idDe = vivo && vivo.origen === 'elemento' ? vivo.elemento.id : vivo && vivo.anclaId ? vivo.anclaId : focoId;
    const base = elementos.findIndex((e) => e.id === idDe);
    const lista = dir > 0 ? elementos.slice(base + 1) : elementos.slice(0, Math.max(0, base)).reverse();
    const el = lista.find((e) => e.tipo !== 'seccion');
    if (el) await irAElemento(el, false);
  };

  const alternarModo = (m) => setModo((actual) => (actual === m ? 'contenido' : m));
  const limpiar = () => { setContenido(null); setVivo(null); setModo('contenido'); };

  const indiceInsercion = (lista, tipo) => {
    if (!destinoId || tipo === 'seccion') return lista.length;
    const i = lista.findIndex((e) => e.id === destinoId && e.tipo === 'seccion');
    if (i < 0) return lista.length;
    let j = i + 1;
    while (j < lista.length && lista[j].tipo !== 'seccion') j++;
    return j;
  };

  const agregar = (parcial, seleccionar = true) => {
    const el = { id: uid(), ...parcial };
    setElementos((prev) => {
      const copia = [...prev];
      copia.splice(indiceInsercion(copia, parcial.tipo), 0, el);
      return copia;
    });
    if (seleccionar) { setFocoTmp(null); setFocoId(el.id); setPestana('culto'); }
    avisar('Agregado al culto.');
    return el;
  };

  const actualizarElemento = (id, cambios) => setElementos((prev) => prev.map((e) => (e.id === id ? { ...e, ...cambios } : e)));

  const agregarCancion = (c) => agregar({ tipo: 'cancion', cancionId: c.id, titulo: c.titulo });
  const agregarPasaje = (libro, capitulo, desde, hasta) => agregar({ tipo: 'biblia', libro, capitulo, desde: desde || null, hasta: hasta || null, agrupar: 1 });

  const vistaPreviaCancion = (c) => { setFocoId(null); setFocoTmp({ id: `tmp-cancion-${c.id}`, tipo: 'cancion', cancionId: c.id, titulo: c.titulo }); setConsulta(''); };
  const proyectarCancion = async (c) => {
    const tmp = { id: `tmp-cancion-${c.id}`, tipo: 'cancion', cancionId: c.id, titulo: c.titulo };
    setFocoId(null);
    setFocoTmp(tmp);
    setConsulta('');
    await proyectarDiap(tmp, 0);
  };
  const vistaPreviaMedio = (m) => { setFocoId(null); setFocoTmp({ id: `tmp-imagen-${m.archivo}`, tipo: 'imagen', src: m.url, nombre: m.nombre }); setConsulta(''); };
  const agregarFoco = (tmp) => {
    if (tmp.tipo === 'cancion') agregar({ tipo: 'cancion', cancionId: tmp.cancionId, titulo: tmp.titulo });
    else if (tmp.tipo === 'imagen') agregar({ tipo: 'imagen', src: tmp.src, nombre: tmp.nombre });
  };

  const quitar = (id) => {
    setElementos((prev) => prev.filter((e) => e.id !== id));
    if (focoId === id) setFocoId(null);
    if (destinoId === id) setDestinoId(null);
  };

  const mover = (de, a) => setElementos((prev) => {
    const copia = [...prev];
    const [x] = copia.splice(de, 1);
    copia.splice(Math.max(0, Math.min(a, copia.length)), 0, x);
    return copia;
  });

  const abrirEditorElemento = (el) => {
    if (el.tipo === 'texto') setModal({ tipo: 'texto', inicial: el });
    else if (el.tipo === 'temporizador') setModal({ tipo: 'temporizador', inicial: el });
    else if (el.tipo === 'seccion') setModal({ tipo: 'nombre', titulo: 'Nombre de la sección', etiqueta: 'Nombre', inicial: el.titulo, boton: 'Guardar', alAceptar: (n) => { actualizarElemento(el.id, { titulo: n }); setModal(null); } });
  };

  const agregarTipo = (tipo) => {
    if (tipo === 'biblia') setModal({ tipo: 'pasaje' });
    else if (tipo === 'cancion') setPestana('canciones');
    else if (tipo === 'imagen') setPestana('medios');
    else if (tipo === 'texto') setModal({ tipo: 'texto' });
    else if (tipo === 'temporizador') setModal({ tipo: 'temporizador' });
    else if (tipo === 'seccion') setModal({ tipo: 'nombre', titulo: 'Nueva sección', etiqueta: 'Nombre de la sección', boton: 'Agregar', alAceptar: (n) => { agregar({ tipo: 'seccion', titulo: n }, false); setModal(null); } });
  };

  const servicioActual = servicios.find((s) => s.id === servicioId);

  const accionesCulto = {
    nuevoServicio: () => setModal({ tipo: 'culto' }),
    editarServicio: () => setModal({ tipo: 'culto', inicial: { nombre: servicioActual ? servicioActual.nombre : '', fecha: servicioActual ? servicioActual.fecha : hoy() } }),
    historial: () => setModal({ tipo: 'historial' }),
    fijarDestino: setDestinoId,
    duplicarServicio: async () => { const id = await window.atril.servicios.duplicar(servicioId, servicioActual.nombre, hoy()); await recargarServicios(); await cargarServicio(id); avisar('Culto duplicado para hoy.'); },
    borrarServicio: () => setModal({ tipo: 'confirmar', titulo: 'Eliminar culto', mensaje: `Se eliminará «${servicioActual ? servicioActual.nombre : ''}» con todo su orden. Las canciones no se borran.`, alAceptar: async () => {
      await window.atril.servicios.borrar(servicioId);
      let lista = await recargarServicios();
      if (!lista.length) { await window.atril.servicios.crear('Culto', hoy()); lista = await recargarServicios(); }
      await cargarServicio(lista[0].id);
      setModal(null);
    } }),
    seleccionar: (el) => { setFocoTmp(null); setFocoId(el.id); setConsulta(''); },
    proyectar: (el) => { setFocoTmp(null); setFocoId(el.id); setConsulta(''); proyectarDiap(el, 0); },
    quitar,
    mover,
    agregarTipo,
    editarElemento: abrirEditorElemento,
  };

  const accionesMesa = {
    libros,
    proyectarDiap: (i) => proyectarDiap(focoEl, i, diapsFoco),
    proyectarVersiculo,
    agregarPasaje,
    agregarCancion,
    agregarFoco,
    proyectarCancion,
    vistaPreviaCancion,
    irA: (t) => setConsulta(t),
    cambiarAgrupar: (el, n) => actualizarElemento(el.id, { agrupar: n }),
    editarCancion: (id) => setModal({ tipo: 'cancion', id }),
    editarElemento: abrirEditorElemento,
  };

  const accionesVivo = {
    anterior: irAnterior,
    siguiente: irSiguiente,
    negro: () => alternarModo('negro'),
    logo: () => alternarModo('logo'),
    limpiar,
    abrirDiseno: () => setModal({ tipo: 'diseno' }),
    elegirTema: (id) => { setTemaId(id); window.atril.guardarAjuste('temaActivo', id); },
    abrirProyeccion: () => window.atril.proyeccion.abrir(),
    cerrarProyeccion: () => window.atril.proyeccion.cerrar(),
    activarPantalla: (id, encendida) => window.atril.proyeccion.activar(id, encendida),
    identificar: () => window.atril.proyeccion.identificar(),
    versoAnterior: () => versoNav(-1),
    versoSiguiente: () => versoNav(1),
    elementoAnterior: () => elementoVecino(-1),
    elementoSiguiente: () => elementoVecino(1),
  };

  const enterBuscador = async () => {
    const r = await window.atril.buscar(consulta);
    if (r.referencia) await proyectarVersiculo(r.referencia.libro, r.referencia.capitulo, r.referencia.desde || 1, r.referencia.hasta);
    else if (r.palabras.length) await proyectarVersiculo(r.palabras[0].libro, r.palabras[0].capitulo, r.palabras[0].versiculo);
    else if (r.canciones.length) await proyectarCancion(r.canciones[0]);
    else return;
    if (buscador.current) buscador.current.blur();
  };

  acc.current = {
    comandoRemoto: async (c) => {
      if (c.tipo === 'siguiente') await irSiguiente();
      else if (c.tipo === 'anterior') await irAnterior();
      else if (c.tipo === 'negro') alternarModo('negro');
      else if (c.tipo === 'logo') alternarModo('logo');
      else if (c.tipo === 'limpiar') limpiar();
      else if (c.tipo === 'versoSig') await versoNav(1);
      else if (c.tipo === 'versoAnt') await versoNav(-1);
      else if (c.tipo === 'elementoSig') await elementoVecino(1);
      else if (c.tipo === 'elementoAnt') await elementoVecino(-1);
      else if (c.tipo === 'elemento') { const el = elementos.find((e) => e.id === c.id); if (el) await irAElemento(el, false); }
      else if (c.tipo === 'versiculo') await proyectarVersiculo(c.libro, c.capitulo, c.versiculo);
      else if (c.tipo === 'cancion') {
        const cancion = await window.atril.canciones.obtener(c.id);
        if (cancion) { const el = agregar({ tipo: 'cancion', cancionId: cancion.id, titulo: cancion.titulo }); await proyectarDiap(el, 0); }
      }
    },
    teclado: (e) => {
      if (modal) return;
      const enCampo = enCampoDeTexto(e.target);
      if ((e.key === '/' && !enCampo) || (e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        if (buscador.current) { buscador.current.focus(); buscador.current.select(); }
        return;
      }
      if (e.key === 'Escape') {
        if (consulta) setConsulta('');
        if (enCampo) e.target.blur();
        return;
      }
      if (enCampo || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (k === 'ArrowRight' || k === ' ') { e.preventDefault(); irSiguiente(); }
      else if (k === 'ArrowLeft') { e.preventDefault(); irAnterior(); }
      else if (k === 'ArrowDown') { e.preventDefault(); versoNav(1); }
      else if (k === 'ArrowUp') { e.preventDefault(); versoNav(-1); }
      else if (k === 'PageDown') { e.preventDefault(); elementoVecino(1); }
      else if (k === 'PageUp') { e.preventDefault(); elementoVecino(-1); }
      else if (k.toLowerCase() === 'b') alternarModo('negro');
      else if (k.toLowerCase() === 'l') alternarModo('logo');
      else if (k.toLowerCase() === 'c') limpiar();
      else if (/^[1-9]$/.test(k) && focoEl && diapsFoco[Number(k) - 1]) proyectarDiap(focoEl, Number(k) - 1, diapsFoco);
    },
  };

  useEffect(() => {
    const f = (e) => acc.current.teclado(e);
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, []);

  const cancionGuardada = (id, titulo) => {
    setElementos((prev) => prev.map((e) => (e.tipo === 'cancion' && e.cancionId === id ? { ...e, titulo } : e)));
    setVersionDatos((v) => v + 1);
    setModal(null);
    avisar('Canción guardada.');
  };

  const cancionBorrada = async (id) => {
    await window.atril.canciones.borrar(id);
    setElementos((prev) => prev.filter((e) => !(e.tipo === 'cancion' && e.cancionId === id)));
    setFocoTmp(null);
    setVersionDatos((v) => v + 1);
    setModal(null);
    avisar('Canción eliminada.');
  };

  const libroActual = res ? (res.referencia ? res.referencia.libro : res.libros && res.libros.length === 1 ? res.libros[0] : null) : null;
  const destinoEl = elementos.find((e) => e.id === destinoId && e.tipo === 'seccion') || null;

  const guardarCulto = async ({ nombre, fecha, secciones }) => {
    if (modal && modal.inicial) {
      await window.atril.servicios.actualizar(servicioId, nombre, fecha);
      await recargarServicios();
    } else {
      const id = await window.atril.servicios.crear(nombre, fecha);
      if (secciones) await window.atril.servicios.guardar(id, SECCIONES_BASE.map((t) => ({ id: uid(), tipo: 'seccion', titulo: t })));
      await recargarServicios();
      await cargarServicio(id);
      setPestana('culto');
    }
    setModal(null);
  };

  const abrirCulto = async (id) => {
    await cargarServicio(id);
    setPestana('culto');
    setModal(null);
  };

  const usarComoBase = async (s) => {
    const id = await window.atril.servicios.duplicar(s.id, s.nombre, hoy());
    await recargarServicios();
    await cargarServicio(id);
    setPestana('culto');
    setModal(null);
    avisar(`Culto nuevo para hoy con el orden de «${s.nombre}».`);
  };

  const borrarDelHistorial = async (s) => {
    await window.atril.servicios.borrar(s.id);
    let lista = await recargarServicios();
    if (!lista.length) {
      await window.atril.servicios.crear('Culto', hoy());
      lista = await recargarServicios();
    }
    if (s.id === servicioId) await cargarServicio(lista[0].id);
  };

  const cambiarMaxLineas = (n) => { setMaxLineas(n); window.atril.guardarAjuste('maxLineas', n); };

  if (!listo) return <div className="cargando"><img src={logoRedondo} alt="" /></div>;

  return (
    <div className="app">
      <header className="barra">
        <div className="marca">
          <img src={logoRedondo} alt="" />
          <div className="marca-texto">
            <b>{IGLESIA.nombre}</b>
            <span>{IGLESIA.sufijo} · Atril</span>
          </div>
        </div>
        <div className="buscador">
          <Icono n="busqueda" t={19} />
          <input
            ref={buscador}
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); enterBuscador(); } }}
            placeholder="Busca un pasaje, una palabra o una canción…   jn 3 16 · salmo 23 · amor de Dios"
            spellCheck={false}
          />
          {consulta ? <button className="icono-btn" onClick={() => setConsulta('')} title="Limpiar búsqueda (Esc)"><Icono n="cerrar" t={16} /></button> : <kbd>/</kbd>}
        </div>
        <div className="barra-der">
          {nueva && <button className="pildora" onClick={() => setModal({ tipo: 'ajustes' })}><Icono n="actualizar" t={15} /> Versión {nueva.version} disponible</button>}
          <button className="btn" onClick={() => setModal({ tipo: 'remoto' })} title="Controlar desde el celular"><Icono n="telefono" t={17} /> Celular</button>
          <button className="icono-btn borde" onClick={() => setModal({ tipo: 'ajustes' })} title="Ajustes"><Icono n="ajustes" /></button>
        </div>
      </header>

      <div className="cuerpo">
        <aside className="izq">
          <div className="pestanas">
            {[['culto', 'Culto', 'culto'], ['biblia', 'Biblia', 'biblia'], ['canciones', 'Canciones', 'cancion'], ['medios', 'Imágenes', 'imagen']].map(([id, t, ic]) => (
              <button key={id} className={pestana === id ? 'on' : ''} onClick={() => setPestana(id)}><Icono n={ic} t={16} />{t}</button>
            ))}
          </div>
          {pestana === 'culto' && (
            <PanelCulto servicios={servicios} servicioId={servicioId} elementos={elementos} foco={focoEl} vivoId={vivo && vivo.origen === 'elemento' ? vivo.elemento.id : null} libros={libros} titulos={{}} destino={destinoEl} acciones={accionesCulto} />
          )}
          {pestana === 'biblia' && <PanelBiblia libros={libros} actual={libroActual} alElegir={(l) => setConsulta(l.nombre)} />}
          {pestana === 'canciones' && (
            <PanelCanciones destinoTitulo={destinoEl ? destinoEl.titulo : null} version={versionDatos} focoId={focoTmp ? focoTmp.id : null} alVistaPrevia={vistaPreviaCancion} alProyectar={proyectarCancion} alAgregar={agregarCancion} alEditar={(id) => setModal({ tipo: 'cancion', id })} alNueva={() => setModal({ tipo: 'cancion', id: null })} alImportar={async () => { const n = await window.atril.canciones.importar(); if (n) { setVersionDatos((v) => v + 1); avisar(`${n} ${n === 1 ? 'canción importada' : 'canciones importadas'}.`); } }} />
          )}
          {pestana === 'medios' && (
            <PanelMedios destinoTitulo={destinoEl ? destinoEl.titulo : null} version={versionDatos} focoId={focoTmp ? focoTmp.id : null} alVistaPrevia={vistaPreviaMedio} alAgregar={(m) => agregar({ tipo: 'imagen', src: m.url, nombre: m.nombre })} alCambio={() => setVersionDatos((v) => v + 1)} />
          )}
        </aside>

        <main className="centro">
          <Mesa consulta={consulta} res={res} libros={libros} foco={focoEl} diaps={diapsFoco} vivo={vivo} acciones={accionesMesa} />
        </main>

        <aside className="der">
          <PanelVivo modo={modo} contenido={contenido} tema={tema} vivo={vivo} siguiente={siguiente} temas={todosTemas} temaId={tema.id} proy={proy} esVerso={!!versiculoActual()} acciones={accionesVivo} />
        </aside>
      </div>

      {modal && modal.tipo === 'pasaje' && <SelectorPasaje libros={libros} alCerrar={() => setModal(null)} alAceptar={(r) => { agregarPasaje(r.libro, r.capitulo, r.desde, r.hasta); setModal(null); }} />}
      {modal && modal.tipo === 'culto' && <FormCulto inicial={modal.inicial} alCerrar={() => setModal(null)} alAceptar={guardarCulto} />}
      {modal && modal.tipo === 'historial' && <HistorialCultos servicios={servicios} servicioId={servicioId} alAbrir={abrirCulto} alUsarComoBase={usarComoBase} alBorrar={borrarDelHistorial} alNuevo={() => setModal({ tipo: 'culto' })} alCerrar={() => setModal(null)} />}
      {modal && modal.tipo === 'texto' && <FormTexto inicial={modal.inicial} alCerrar={() => setModal(null)} alAceptar={(d) => { if (modal.inicial) actualizarElemento(modal.inicial.id, d); else agregar({ tipo: 'texto', ...d }); setModal(null); }} />}
      {modal && modal.tipo === 'temporizador' && <FormTemporizador inicial={modal.inicial} alCerrar={() => setModal(null)} alAceptar={(d) => { if (modal.inicial) actualizarElemento(modal.inicial.id, d); else agregar({ tipo: 'temporizador', ...d }); setModal(null); }} />}
      {modal && modal.tipo === 'nombre' && <FormNombre titulo={modal.titulo} etiqueta={modal.etiqueta} inicial={modal.inicial} boton={modal.boton} alCerrar={() => setModal(null)} alAceptar={modal.alAceptar} />}
      {modal && modal.tipo === 'confirmar' && <Confirmar titulo={modal.titulo} mensaje={modal.mensaje} alCerrar={() => setModal(null)} alAceptar={modal.alAceptar} />}
      {modal && modal.tipo === 'cancion' && <EditorCancion id={modal.id} maxLineas={maxLineas} alCerrar={() => setModal(null)} alGuardar={cancionGuardada} alBorrar={cancionBorrada} />}
      {modal && modal.tipo === 'diseno' && <EditorTema personalizados={temas} temaId={tema.id} alElegir={accionesVivo.elegirTema} alGuardar={(lista) => { setTemas(lista); window.atril.guardarAjuste('temasPersonalizados', lista); }} alCerrar={() => setModal(null)} />}
      {modal && modal.tipo === 'ajustes' && <Ajustes proy={proy} maxLineas={maxLineas} alMaxLineas={cambiarMaxLineas} version={version} nueva={nueva} avisar={avisar} alDatosCambiados={async () => { await recargarServicios(); setVersionDatos((v) => v + 1); }} alCerrar={() => setModal(null)} />}
      {modal && modal.tipo === 'remoto' && <Remoto alCerrar={() => setModal(null)} />}
      {aviso && <div className="aviso">{aviso}</div>}
    </div>
  );
}
