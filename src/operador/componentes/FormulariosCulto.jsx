import { useState } from 'react';
import { Modal, Campo } from './Modal';

export function FormPasaje({ alAceptar, alCerrar }) {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const aceptar = async () => {
    if (!texto.trim() || ocupado) return;
    setOcupado(true);
    const r = await window.atril.buscar(texto);
    setOcupado(false);
    if (!r.referencia) { setError('No reconozco ese pasaje. Prueba así: Juan 3:16-18, Salmo 23, 1 Co 13.'); return; }
    alAceptar(r.referencia);
  };

  return (
    <Modal titulo="Agregar pasaje bíblico" ancho={480} alCerrar={alCerrar} pie={(<><span className="relleno" /><button className="btn" onClick={alCerrar}>Cancelar</button><button className="btn btn-lleno" onClick={aceptar}>Agregar</button></>)}>
      <Campo etiqueta="Pasaje" ayuda="Un versículo, un rango (16-18) o un capítulo completo.">
        <input autoFocus value={texto} onChange={(e) => { setTexto(e.target.value); setError(''); }} onKeyDown={(e) => e.key === 'Enter' && aceptar()} placeholder="Juan 3:16-18" />
      </Campo>
      {error && <p className="error-texto">{error}</p>}
    </Modal>
  );
}

export function FormTexto({ inicial, alAceptar, alCerrar }) {
  const [titulo, setTitulo] = useState(inicial ? inicial.titulo : '');
  const [cuerpo, setCuerpo] = useState(inicial ? inicial.cuerpo : '');
  return (
    <Modal titulo={inicial ? 'Editar texto' : 'Anuncio o texto'} ancho={560} alCerrar={alCerrar} pie={(<><span className="relleno" /><button className="btn" onClick={alCerrar}>Cancelar</button><button className="btn btn-lleno" disabled={!cuerpo.trim()} onClick={() => alAceptar({ titulo: titulo.trim(), cuerpo })}>{inicial ? 'Guardar' : 'Agregar'}</button></>)}>
      <Campo etiqueta="Título (opcional)"><input autoFocus value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Anuncios, Bienvenida, Ofrenda…" /></Campo>
      <Campo etiqueta="Texto" ayuda="Una línea en blanco separa una diapositiva de la siguiente."><textarea rows={8} value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} /></Campo>
    </Modal>
  );
}

export function FormTemporizador({ inicial, alAceptar, alCerrar }) {
  const [titulo, setTitulo] = useState(inicial ? inicial.titulo : 'El culto comienza en');
  const [minutos, setMinutos] = useState(inicial ? inicial.minutos : 5);
  return (
    <Modal titulo="Cuenta regresiva" ancho={440} alCerrar={alCerrar} pie={(<><span className="relleno" /><button className="btn" onClick={alCerrar}>Cancelar</button><button className="btn btn-lleno" disabled={!(minutos > 0)} onClick={() => alAceptar({ titulo: titulo.trim(), minutos: Number(minutos) })}>{inicial ? 'Guardar' : 'Agregar'}</button></>)}>
      <Campo etiqueta="Texto sobre el reloj"><input value={titulo} onChange={(e) => setTitulo(e.target.value)} /></Campo>
      <Campo etiqueta="Minutos" ayuda="El reloj arranca cuando lo proyectas."><input type="number" min="1" max="180" value={minutos} onChange={(e) => setMinutos(e.target.value)} /></Campo>
    </Modal>
  );
}

export function FormNombre({ titulo, etiqueta, inicial = '', boton = 'Aceptar', alAceptar, alCerrar }) {
  const [nombre, setNombre] = useState(inicial);
  const aceptar = () => nombre.trim() && alAceptar(nombre.trim());
  return (
    <Modal titulo={titulo} ancho={440} alCerrar={alCerrar} pie={(<><span className="relleno" /><button className="btn" onClick={alCerrar}>Cancelar</button><button className="btn btn-lleno" disabled={!nombre.trim()} onClick={aceptar}>{boton}</button></>)}>
      <Campo etiqueta={etiqueta}><input autoFocus value={nombre} onChange={(e) => setNombre(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && aceptar()} /></Campo>
    </Modal>
  );
}

export function Confirmar({ titulo, mensaje, boton = 'Eliminar', alAceptar, alCerrar }) {
  return (
    <Modal titulo={titulo} ancho={440} alCerrar={alCerrar} pie={(<><span className="relleno" /><button className="btn" onClick={alCerrar}>Cancelar</button><button className="btn peligro" onClick={alAceptar}>{boton}</button></>)}>
      <p>{mensaje}</p>
    </Modal>
  );
}
