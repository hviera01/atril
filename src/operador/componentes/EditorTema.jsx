import { useEffect, useState } from 'react';
import { Modal, Campo, Segmentos, Interruptor } from './Modal';
import Icono from './Iconos';
import Escenario from '../../compartido/Escenario';
import { FUENTES, ESTILOS, TIPOS_FONDO, PATRONES, ANIMACIONES, TEMAS_INTEGRADOS, completarTema, temaNuevoDesde, temaEnBlanco } from '../../compartido/temas';

const MUESTRA = {
  modo: 'contenido',
  contenido: {
    tipo: 'versiculo',
    partes: [{ n: 16, t: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.' }],
    referencia: 'Juan 3:16',
    libroNombre: 'Juan',
    capitulo: 3,
    rango: '16',
    version: 'RVR1960',
  },
};

const MUESTRA_CANCION = {
  modo: 'contenido',
  contenido: { tipo: 'letra', lineas: ['Santo, santo, santo', 'Señor omnipotente', 'Siempre los labios míos', 'loores te dirán'], titulo: 'Santo, santo, santo' },
};

function Rango({ etiqueta, valor, min, max, paso = 1, alCambiar, sufijo = '' }) {
  return (
    <label className="campo rango">
      <span className="campo-et">{etiqueta}<b>{typeof valor === 'number' ? Math.round(valor * 100) / 100 : valor}{sufijo}</b></span>
      <input type="range" min={min} max={max} step={paso} value={valor} onChange={(e) => alCambiar(Number(e.target.value))} />
    </label>
  );
}

function Color({ etiqueta, valor, alCambiar }) {
  return (
    <label className="campo color">
      <span className="campo-et">{etiqueta}</span>
      <span className="color-caja"><input type="color" value={valor} onChange={(e) => alCambiar(e.target.value)} /><code>{valor}</code></span>
    </label>
  );
}

export default function EditorTema({ personalizados, temaId, alGuardar, alElegir, alCerrar }) {
  const todos = [...TEMAS_INTEGRADOS, ...personalizados];
  const inicial = completarTema(todos.find((t) => t.id === temaId) || todos[0]);
  const [lista, setLista] = useState(personalizados);
  const [editando, setEditando] = useState(inicial);
  const [muestraCancion, setMuestraCancion] = useState(false);
  const [medios, setMedios] = useState([]);

  useEffect(() => { window.atril.medios.listar().then(setMedios); }, []);

  const integrado = !!editando.integrado;
  const cambiar = (grupo, campo, valor) => {
    let base = editando;
    let lista2 = lista;
    if (integrado) {
      base = temaNuevoDesde(editando, `${editando.nombre} (propio)`);
      lista2 = [...lista, base];
      alElegir(base.id);
    }
    const nuevo = grupo ? { ...base, [grupo]: { ...base[grupo], [campo]: valor } } : { ...base, [campo]: valor };
    setEditando(nuevo);
    setLista(lista2.map((t) => (t.id === nuevo.id ? nuevo : t)));
  };

  const cambiarVarios = (cambios) => {
    let base = editando;
    let lista2 = lista;
    if (integrado) {
      base = temaNuevoDesde(editando, `${editando.nombre} (propio)`);
      lista2 = [...lista, base];
      alElegir(base.id);
    }
    const nuevo = { ...base, fondo: { ...base.fondo, ...cambios } };
    setEditando(nuevo);
    setLista(lista2.map((t) => (t.id === nuevo.id ? nuevo : t)));
  };

  const enBlanco = () => {
    const nuevo = temaEnBlanco();
    setLista((l) => [...l, nuevo]);
    setEditando(nuevo);
    alElegir(nuevo.id);
  };

  const elegir = (t) => {
    const c = completarTema(t);
    setEditando(c);
    alElegir(c.id);
  };

  const duplicar = () => {
    const nuevo = temaNuevoDesde(editando, `${editando.nombre} (copia)`);
    setLista((l) => [...l, nuevo]);
    setEditando(nuevo);
    alElegir(nuevo.id);
  };

  const borrar = () => {
    const resto = lista.filter((t) => t.id !== editando.id);
    setLista(resto);
    const siguiente = TEMAS_INTEGRADOS[0];
    setEditando(completarTema(siguiente));
    alElegir(siguiente.id);
  };

  const agregarMedio = async () => {
    const nuevos = await window.atril.medios.importar('todos');
    if (nuevos.length) setMedios(await window.atril.medios.listar());
  };

  const fondo = editando.fondo;
  const texto = editando.texto;
  const ref = editando.referencia;

  return (
    <Modal
      titulo="Diseños de proyección"
      ancho={1180}
      alCerrar={() => { alGuardar(lista); alCerrar(); }}
      pie={(<><span className="relleno" />{integrado ? <span className="tenue">Si cambias algo de un diseño de fábrica, se guarda como copia propia.</span> : null}<button className="btn btn-lleno" onClick={() => { alGuardar(lista); alCerrar(); }}>Listo</button></>)}
    >
      <div className="editor-tema">
        <div className="tema-lista">
          <span className="rotulo">Diseños</span>
          {[...TEMAS_INTEGRADOS, ...lista].map((t) => (
            <button key={t.id} className={`tema-fila${t.id === editando.id ? ' on' : ''}`} onClick={() => elegir(t)}>
              <span>{t.nombre}</span>
              {!t.integrado && <small>propio</small>}
            </button>
          ))}
          <button className="btn btn-lleno ancho" onClick={enBlanco}><Icono n="mas" t={16} /> Nuevo desde cero</button>
          <button className="btn ancho" onClick={duplicar}><Icono n="duplicar" t={16} /> Duplicar este diseño</button>
          {!integrado && <button className="btn ancho" onClick={borrar}><Icono n="borrar" t={16} /> Eliminar</button>}
        </div>

        <div className="tema-centro">
          <div className="tema-vista">
            <Escenario frame={muestraCancion ? MUESTRA_CANCION : MUESTRA} tema={editando} />
          </div>
          <Segmentos valor={muestraCancion ? 'c' : 'v'} opciones={[{ v: 'v', t: 'Probar con versículo' }, { v: 'c', t: 'Probar con canción' }]} alCambiar={(v) => setMuestraCancion(v === 'c')} />
          {(
            <Campo etiqueta="Nombre del diseño"><input value={editando.nombre} onChange={(e) => cambiar(null, 'nombre', e.target.value)} /></Campo>
          )}
        </div>

        <fieldset className="tema-controles">
          <h3>Fondo</h3>
          <Campo etiqueta="Tipo de fondo">
            <select value={fondo.tipo} onChange={(e) => cambiar('fondo', 'tipo', e.target.value)}>
              {TIPOS_FONDO.map((x) => <option key={x.v} value={x.v}>{x.t}</option>)}
            </select>
          </Campo>
          {fondo.tipo === 'color' && <Color etiqueta="Color" valor={fondo.color} alCambiar={(v) => cambiar('fondo', 'color', v)} />}
          {fondo.tipo === 'degradado' && (
            <>
              <Color etiqueta="Color de arriba" valor={fondo.color} alCambiar={(v) => cambiar('fondo', 'color', v)} />
              <Color etiqueta="Color de abajo" valor={fondo.color2} alCambiar={(v) => cambiar('fondo', 'color2', v)} />
              <Rango etiqueta="Ángulo" valor={fondo.angulo} min={0} max={360} alCambiar={(v) => cambiar('fondo', 'angulo', v)} sufijo="°" />
            </>
          )}
          {fondo.tipo === 'radial' && (
            <>
              <Color etiqueta="Color del centro" valor={fondo.color} alCambiar={(v) => cambiar('fondo', 'color', v)} />
              <Color etiqueta="Color de los bordes" valor={fondo.color2} alCambiar={(v) => cambiar('fondo', 'color2', v)} />
            </>
          )}
          {fondo.tipo === 'patron' && (
            <>
              <Color etiqueta="Color de base" valor={fondo.color} alCambiar={(v) => cambiar('fondo', 'color', v)} />
              <Color etiqueta="Segundo color de base" valor={fondo.color2} alCambiar={(v) => cambiar('fondo', 'color2', v)} />
              <Campo etiqueta="Patrón">
                <select value={fondo.patron} onChange={(e) => cambiar('fondo', 'patron', e.target.value)}>
                  {PATRONES.map((x) => <option key={x.v} value={x.v}>{x.t}</option>)}
                </select>
              </Campo>
              <Color etiqueta="Color del patrón" valor={fondo.color3} alCambiar={(v) => cambiar('fondo', 'color3', v)} />
              <Rango etiqueta="Intensidad del patrón" valor={fondo.patronOpacidad} min={0.03} max={0.6} paso={0.01} alCambiar={(v) => cambiar('fondo', 'patronOpacidad', v)} />
            </>
          )}
          {fondo.tipo === 'animado' && (
            <>
              <Campo etiqueta="Animación">
                <select value={fondo.animacion} onChange={(e) => cambiar('fondo', 'animacion', e.target.value)}>
                  {ANIMACIONES.map((x) => <option key={x.v} value={x.v}>{x.t}</option>)}
                </select>
              </Campo>
              <Color etiqueta="Color principal" valor={fondo.color} alCambiar={(v) => cambiar('fondo', 'color', v)} />
              <Color etiqueta="Color secundario" valor={fondo.color2} alCambiar={(v) => cambiar('fondo', 'color2', v)} />
              <Color etiqueta="Color de la luz" valor={fondo.color3} alCambiar={(v) => cambiar('fondo', 'color3', v)} />
              <Rango etiqueta="Velocidad" valor={fondo.velocidad} min={0.25} max={3} paso={0.05} alCambiar={(v) => cambiar('fondo', 'velocidad', v)} sufijo="×" />
              <p className="tenue chico-texto">Movimiento suave dibujado por la app: no usa videos ni pesa nada.</p>
            </>
          )}
          {(fondo.tipo === 'imagen' || fondo.tipo === 'video') && (
            <>
              <div className="medios-mini">
                {medios.filter((m) => m.tipo === fondo.tipo).map((m) => (
                  <button key={m.archivo} className={fondo.medio === m.url ? 'on' : ''} onClick={() => cambiar('fondo', 'medio', m.url)} title={m.nombre}>
                    {m.tipo === 'imagen' ? <img src={m.url} alt="" /> : <video src={m.url} muted preload="metadata" />}
                  </button>
                ))}
                <button className="medios-mas" onClick={agregarMedio} title="Agregar desde tu computadora"><Icono n="mas" /></button>
              </div>
              {!medios.some((m) => m.tipo === fondo.tipo) && <p className="tenue chico-texto">Aún no hay {fondo.tipo === 'imagen' ? 'imágenes' : 'videos'}. Agrega uno con el botón +.</p>}
              <Color etiqueta="Color de respaldo" valor={fondo.color} alCambiar={(v) => cambiar('fondo', 'color', v)} />
              <Rango etiqueta="Oscurecer" valor={fondo.oscurecer} min={0} max={0.9} paso={0.05} alCambiar={(v) => cambiar('fondo', 'oscurecer', v)} />
              <Rango etiqueta="Desenfoque" valor={fondo.desenfoque} min={0} max={24} alCambiar={(v) => cambiar('fondo', 'desenfoque', v)} sufijo=" px" />
              <Rango etiqueta="Brillo" valor={fondo.brillo} min={40} max={170} alCambiar={(v) => cambiar('fondo', 'brillo', v)} sufijo="%" />
              <Rango etiqueta="Color (0 = blanco y negro)" valor={fondo.saturacion} min={0} max={200} alCambiar={(v) => cambiar('fondo', 'saturacion', v)} sufijo="%" />
              <Rango etiqueta="Acercar" valor={fondo.zoom} min={100} max={250} alCambiar={(v) => cambiar('fondo', 'zoom', v)} sufijo="%" />
              <Rango etiqueta="Mover a los lados" valor={fondo.posX} min={0} max={100} alCambiar={(v) => cambiar('fondo', 'posX', v)} sufijo="%" />
              <Rango etiqueta="Mover arriba y abajo" valor={fondo.posY} min={0} max={100} alCambiar={(v) => cambiar('fondo', 'posY', v)} sufijo="%" />
              <Color etiqueta="Tinte de color" valor={fondo.tinte} alCambiar={(v) => cambiar('fondo', 'tinte', v)} />
              <Rango etiqueta="Intensidad del tinte" valor={fondo.tinteOpacidad} min={0} max={0.8} paso={0.02} alCambiar={(v) => cambiar('fondo', 'tinteOpacidad', v)} />
              <button type="button" className="btn chico" onClick={() => cambiarVarios({ oscurecer: 0.4, desenfoque: 0, brillo: 100, saturacion: 100, zoom: 100, posX: 50, posY: 50, tinteOpacidad: 0 })}>Restablecer ajustes</button>
            </>
          )}

          <h3>Texto</h3>
          <Campo etiqueta="Letra">
            <select value={texto.fuente} onChange={(e) => cambiar('texto', 'fuente', e.target.value)}>
              {FUENTES.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
            </select>
          </Campo>
          <Segmentos valor={texto.peso} opciones={[{ v: 400, t: 'Normal' }, { v: 500, t: 'Medio' }, { v: 700, t: 'Negrita' }, { v: 800, t: 'Extra' }]} alCambiar={(v) => cambiar('texto', 'peso', v)} />
          <Color etiqueta="Color del texto" valor={texto.color} alCambiar={(v) => cambiar('texto', 'color', v)} />
          <Rango etiqueta="Tamaño máximo" valor={texto.max} min={60} max={200} alCambiar={(v) => cambiar('texto', 'max', v)} sufijo=" px" />
          <Rango etiqueta="Sombra" valor={texto.sombra} min={0} max={1} paso={0.05} alCambiar={(v) => cambiar('texto', 'sombra', v)} />
          <Rango etiqueta="Interlineado" valor={texto.interlineado} min={0.95} max={1.6} paso={0.01} alCambiar={(v) => cambiar('texto', 'interlineado', v)} />
          <Segmentos valor={texto.alinear} opciones={[{ v: 'center', t: 'Centrado' }, { v: 'left', t: 'Izquierda' }]} alCambiar={(v) => cambiar('texto', 'alinear', v)} />
          <div className="interruptores">
            <Interruptor valor={texto.mayus} alCambiar={(v) => cambiar('texto', 'mayus', v)} etiqueta="MAYÚSCULAS" />
            <Interruptor valor={texto.cursiva} alCambiar={(v) => cambiar('texto', 'cursiva', v)} etiqueta="Cursiva" />
          </div>

          <h3>Cita bíblica</h3>
          <Interruptor valor={ref.mostrar} alCambiar={(v) => cambiar('referencia', 'mostrar', v)} etiqueta="Mostrar la cita (Juan 3:16)" />
          <Segmentos valor={ref.posicion} opciones={[{ v: 'abajo', t: 'Debajo' }, { v: 'arriba', t: 'Arriba' }]} alCambiar={(v) => cambiar('referencia', 'posicion', v)} />
          <Color etiqueta="Color de la cita" valor={ref.color} alCambiar={(v) => cambiar('referencia', 'color', v)} />
          <Rango etiqueta="Tamaño de la cita" valor={ref.tam} min={28} max={80} alCambiar={(v) => cambiar('referencia', 'tam', v)} sufijo=" px" />

          <h3>Composición</h3>
          <Campo etiqueta="Estilo del escenario" ayuda={editando.estilo !== 'plano' ? 'Este estilo dibuja su propio arte; los colores de fondo ajustan la base.' : null}>
            <select value={editando.estilo} onChange={(e) => cambiar(null, 'estilo', e.target.value)}>
              {ESTILOS.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Adorno">
            <select value={editando.adorno} onChange={(e) => cambiar(null, 'adorno', e.target.value)}>
              <option value="ninguno">Ninguno</option>
              <option value="linea">Línea sobre la cita</option>
              <option value="marco">Marco doble</option>
              <option value="barra">Barra lateral</option>
            </select>
          </Campo>
          <Rango etiqueta="Margen lateral" valor={editando.margen.x} min={60} max={320} alCambiar={(v) => cambiar('margen', 'x', v)} sufijo=" px" />
          <Rango etiqueta="Margen vertical" valor={editando.margen.y} min={40} max={260} alCambiar={(v) => cambiar('margen', 'y', v)} sufijo=" px" />
          <Interruptor valor={editando.marca.mostrar} alCambiar={(v) => cambiar('marca', 'mostrar', v)} etiqueta="Logo de la iglesia en una esquina" />
          {editando.marca.mostrar && (
            <>
              <Segmentos valor={editando.marca.esquina} opciones={[{ v: 'sup-izq', t: '↖' }, { v: 'sup-der', t: '↗' }, { v: 'inf-izq', t: '↙' }, { v: 'inf-der', t: '↘' }]} alCambiar={(v) => cambiar('marca', 'esquina', v)} />
              <Rango etiqueta="Tamaño del logo" valor={editando.marca.tam} min={70} max={240} alCambiar={(v) => cambiar('marca', 'tam', v)} sufijo=" px" />
            </>
          )}
        </fieldset>
      </div>
    </Modal>
  );
}
