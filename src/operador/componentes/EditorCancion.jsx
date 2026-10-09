import { useEffect, useMemo, useState } from 'react';
import { Modal } from './Modal';
import { dividirLetra, organizarLetra } from '../../compartido/letras.mjs';
import Icono from './Iconos';

export default function EditorCancion({ id, tituloInicial = '', maxLineas, alGuardar, alBorrar, alCerrar }) {
  const [titulo, setTitulo] = useState(tituloInicial);
  const [autor, setAutor] = useState('');
  const [letra, setLetra] = useState('');
  const [cargando, setCargando] = useState(!!id);
  const [confirmar, setConfirmar] = useState(false);
  const [porEstrofa, setPorEstrofa] = useState(maxLineas);
  const [deshacer, setDeshacer] = useState(null);

  useEffect(() => {
    if (!id) return;
    window.atril.canciones.obtener(id).then((c) => {
      if (c) { setTitulo(c.titulo); setAutor(c.autor); setLetra(c.letra); }
      setCargando(false);
    });
  }, [id]);

  const secciones = useMemo(() => dividirLetra(letra, maxLineas), [letra, maxLineas]);
  const valido = titulo.trim() && letra.trim();

  const organizar = () => {
    setDeshacer(letra);
    setLetra(organizarLetra(letra, porEstrofa));
  };

  const alPegar = (e) => {
    const pegado = e.clipboardData.getData('text');
    if (!pegado || letra.trim()) return;
    e.preventDefault();
    setDeshacer(pegado);
    setLetra(organizarLetra(pegado, porEstrofa));
  };

  const guardar = async () => {
    const nuevo = await window.atril.canciones.guardar({ id, titulo: titulo.trim(), autor: autor.trim(), letra });
    alGuardar(id || nuevo, titulo.trim());
  };

  return (
    <Modal
      titulo={id ? 'Editar canción' : 'Nueva canción'}
      ancho={980}
      alCerrar={alCerrar}
      pie={(
        <>
          {id && (confirmar
            ? <button className="btn peligro" onClick={() => alBorrar(id)}>Sí, eliminar esta canción</button>
            : <button className="btn" onClick={() => setConfirmar(true)}>Eliminar</button>)}
          <span className="relleno" />
          <button className="btn" onClick={alCerrar}>Cancelar</button>
          <button className="btn btn-lleno" disabled={!valido || cargando} onClick={guardar}>Guardar</button>
        </>
      )}
    >
      <div className="editor-cancion">
        <div className="editor-izq">
          <div className="fila-campos">
            <label className="campo grande"><span className="campo-et">Título</span><input autoFocus={!id} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Nombre de la canción" /></label>
            <label className="campo"><span className="campo-et">Autor (opcional)</span><input value={autor} onChange={(e) => setAutor(e.target.value)} /></label>
          </div>
          <div className="letra-barra">
            <span className="campo-et">Letra</span>
            <span className="relleno" />
            <label className="por-estrofa">Líneas por estrofa
              <select value={porEstrofa} onChange={(e) => setPorEstrofa(Number(e.target.value))}>
                {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <button type="button" className="btn chico" disabled={!letra.trim()} onClick={organizar}><Icono n="culto" t={14} /> Organizar letra</button>
          </div>
          {deshacer !== null && (
            <div className="aviso-letra">
              <span>Letra organizada en estrofas: las que se repiten quedaron como coro y se quitaron los acordes. Revisa la vista de la derecha.</span>
              <button type="button" className="btn chico" onClick={() => { setLetra(deshacer); setDeshacer(null); }}>Deshacer</button>
            </div>
          )}
          <label className="campo estirar">
            <textarea value={letra} onChange={(e) => { setLetra(e.target.value); setDeshacer(null); }} onPaste={alPegar} spellCheck={false} placeholder={'Pega aquí la letra tal como la tengas, aunque sea un solo bloque o traiga acordes: Atril la organiza sola en versos y coros.'} />
          </label>
        </div>
        <div className="editor-der">
          <span className="campo-et">Así se dividirá · {secciones.length} {secciones.length === 1 ? 'diapositiva' : 'diapositivas'}</span>
          <div className="editor-prev">
            {secciones.length === 0 && <p className="tenue">La vista previa aparece al escribir la letra.</p>}
            {secciones.map((s, i) => (
              <div key={i} className="prev-diap">
                <span className="prev-et">{s.etiqueta || i + 1}</span>
                <p>{s.lineas.map((l, k) => <span key={k}>{l}</span>)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
