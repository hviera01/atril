import { useState } from 'react';
import { Modal, Campo, Interruptor } from './Modal';
import { hoy } from '../../compartido/fechas';

export const SECCIONES_BASE = ['Bienvenida', 'Alabanza', 'Ofrenda', 'Palabra', 'Cierre'];

export function FormCulto({ inicial, alAceptar, alCerrar }) {
  const [nombre, setNombre] = useState(inicial ? inicial.nombre : 'Culto');
  const [fecha, setFecha] = useState(inicial ? inicial.fecha : hoy());
  const [secciones, setSecciones] = useState(true);
  const aceptar = () => nombre.trim() && fecha && alAceptar({ nombre: nombre.trim(), fecha, secciones: !inicial && secciones });
  return (
    <Modal titulo={inicial ? 'Datos del culto' : 'Nuevo culto'} ancho={500} alCerrar={alCerrar} pie={(<><span className="relleno" /><button className="btn" onClick={alCerrar}>Cancelar</button><button className="btn btn-lleno" disabled={!nombre.trim() || !fecha} onClick={aceptar}>{inicial ? 'Guardar' : 'Crear culto'}</button></>)}>
      <Campo etiqueta="Nombre"><input autoFocus value={nombre} onChange={(e) => setNombre(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && aceptar()} placeholder="Culto dominical, Vigilia, Culto de jóvenes…" /></Campo>
      <Campo etiqueta="Fecha"><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></Campo>
      {!inicial && <Interruptor valor={secciones} alCambiar={setSecciones} etiqueta={`Empezar con secciones: ${SECCIONES_BASE.join(', ')}`} />}
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
