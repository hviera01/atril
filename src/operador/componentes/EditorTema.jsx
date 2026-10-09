import { useEffect, useState } from 'react';
import { Modal, Campo, Segmentos, Interruptor } from './Modal';
import Icono from './Iconos';
import Escenario from '../../compartido/Escenario';
import { FUENTES, TEMAS_INTEGRADOS, completarTema, temaNuevoDesde } from '../../compartido/temas';

const MUESTRA = {
  modo: 'contenido',
  contenido: {
    tipo: 'versiculo',
    partes: [{ n: 16, t: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.' }],
    referencia: 'Juan 3:16',
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
    if (integrado) return;
    const nuevo = grupo ? { ...editando, [grupo]: { ...editando[grupo], [campo]: valor } } : { ...editando, [campo]: valor };
    setEditando(nuevo);
    setLista((l) => l.map((t) => (t.id === nuevo.id ? nuevo : t)));
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
      pie={(<><span className="relleno" />{integrado ? <span className="tenue">Los diseños de fábrica no se modifican: duplica uno para personalizarlo.</span> : null}<button className="btn btn-lleno" onClick={() => { alGuardar(lista); alCerrar(); }}>Listo</button></>)}
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
          <button className="btn ancho" onClick={duplicar}><Icono n="duplicar" t={16} /> Duplicar este diseño</button>
          {!integrado && <button className="btn ancho" onClick={borrar}><Icono n="borrar" t={16} /> Eliminar</button>}
        </div>

        <div className="tema-centro">
          <div className="tema-vista">
            <Escenario frame={muestraCancion ? MUESTRA_CANCION : MUESTRA} tema={editando} />
          </div>
          <Segmentos valor={muestraCancion ? 'c' : 'v'} opciones={[{ v: 'v', t: 'Probar con versículo' }, { v: 'c', t: 'Probar con canción' }]} alCambiar={(v) => setMuestraCancion(v === 'c')} />
          {!integrado && (
            <Campo etiqueta="Nombre del diseño"><input value={editando.nombre} onChange={(e) => cambiar(null, 'nombre', e.target.value)} /></Campo>
          )}
        </div>

        <fieldset className="tema-controles" disabled={integrado}>
          <h3>Fondo</h3>
          <Segmentos valor={fondo.tipo} opciones={[{ v: 'color', t: 'Color' }, { v: 'degradado', t: 'Degradado' }, { v: 'imagen', t: 'Imagen' }, { v: 'video', t: 'Video' }]} alCambiar={(v) => cambiar('fondo', 'tipo', v)} />
          {(fondo.tipo === 'color' || fondo.tipo === 'degradado') && <Color etiqueta={fondo.tipo === 'color' ? 'Color' : 'Color de arriba'} valor={fondo.color} alCambiar={(v) => cambiar('fondo', 'color', v)} />}
          {fondo.tipo === 'degradado' && <><Color etiqueta="Color de abajo" valor={fondo.color2} alCambiar={(v) => cambiar('fondo', 'color2', v)} /><Rango etiqueta="Ángulo" valor={fondo.angulo} min={0} max={360} alCambiar={(v) => cambiar('fondo', 'angulo', v)} sufijo="°" /></>}
          {(fondo.tipo === 'imagen' || fondo.tipo === 'video') && (
            <>
              <div className="medios-mini">
                {medios.filter((m) => m.tipo === fondo.tipo).map((m) => (
                  <button key={m.archivo} className={fondo.medio === m.url ? 'on' : ''} onClick={() => cambiar('fondo', 'medio', m.url)} title={m.nombre}>
                    {m.tipo === 'imagen' ? <img src={m.url} alt="" /> : <video src={m.url} muted preload="metadata" />}
                  </button>
                ))}
                <button className="medios-mas" onClick={agregarMedio}><Icono n="mas" /></button>
              </div>
              <Rango etiqueta="Oscurecer" valor={fondo.oscurecer} min={0} max={0.9} paso={0.05} alCambiar={(v) => cambiar('fondo', 'oscurecer', v)} />
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
