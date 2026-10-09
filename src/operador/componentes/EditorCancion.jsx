import { useEffect, useMemo, useState } from 'react';
import { Modal } from './Modal';
import { dividirLetra } from '../../compartido/letras.mjs';

export default function EditorCancion({ id, tituloInicial = '', maxLineas, alGuardar, alBorrar, alCerrar }) {
  const [titulo, setTitulo] = useState(tituloInicial);
  const [autor, setAutor] = useState('');
  const [letra, setLetra] = useState('');
  const [cargando, setCargando] = useState(!!id);
  const [confirmar, setConfirmar] = useState(false);

  useEffect(() => {
    if (!id) return;
    window.atril.canciones.obtener(id).then((c) => {
      if (c) { setTitulo(c.titulo); setAutor(c.autor); setLetra(c.letra); }
      setCargando(false);
    });
  }, [id]);

  const secciones = useMemo(() => dividirLetra(letra, maxLineas), [letra, maxLineas]);
  const valido = titulo.trim() && letra.trim();

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
          <label className="campo estirar">
            <span className="campo-et">Letra</span>
            <textarea value={letra} onChange={(e) => setLetra(e.target.value)} spellCheck={false} placeholder={'Pega aquí la letra.\n\nSepara cada estrofa con una línea en blanco.\nPuedes escribir [Coro] o [Verso 1] solo en una línea para nombrar la estrofa.'} />
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
