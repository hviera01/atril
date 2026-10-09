import { useEffect, useState } from 'react';
import { Modal, Campo, Segmentos, Interruptor } from './Modal';
import Icono from './Iconos';
import { IGLESIA } from '../../compartido/iglesia';

export function Ajustes({ proy, maxLineas, alMaxLineas, version, nueva, avisar, alDatosCambiados, alCerrar }) {
  const [estadoAct, setEstadoAct] = useState('');
  const [progreso, setProgreso] = useState(null);

  useEffect(() => window.atril.actualizar.alProgreso((p) => setProgreso(p)), []);

  const buscar = async () => {
    setEstadoAct('Buscando…');
    const r = await window.atril.actualizar.buscar();
    if (!r.ok) setEstadoAct('No se pudo consultar (¿sin internet?). Atril sigue funcionando normal.');
    else if (!r.nueva) setEstadoAct('Ya tienes la versión más reciente.');
    else setEstadoAct(`Hay una versión nueva: ${r.nueva.version}`);
    return r;
  };

  const instalar = async () => {
    if (!nueva) { const r = await buscar(); if (!r.nueva) return; }
    setEstadoAct('Descargando e instalando…');
    const r = await window.atril.actualizar.instalar();
    if (!r.ok) setEstadoAct(r.error);
  };

  const exportar = async () => { if (await window.atril.respaldo.exportar()) avisar('Respaldo guardado.'); };
  const importar = async () => {
    const r = await window.atril.respaldo.importar();
    if (!r) return;
    if (r.ok) { avisar(`Restaurado: ${r.canciones} canciones nuevas y ${r.servicios} cultos.`); alDatosCambiados(); } else avisar(r.error);
  };

  return (
    <Modal titulo="Ajustes" ancho={600} alCerrar={alCerrar}>
      <section className="ajuste">
        <h3>Pantalla de proyección</h3>
        {proy && proy.pantallas.length > 1 ? (
          <>
            <p className="tenue">Marca las pantallas donde se proyecta. Todas muestran lo mismo.</p>
            <div className="pantallas-ajuste">
              {proy.pantallas.map((p) => (
                <Interruptor key={p.id} valor={proy.abierta ? p.activa : p.elegida} alCambiar={(on) => window.atril.proyeccion.activar(p.id, on)} etiqueta={`${p.nombre} · ${p.ancho}×${p.alto}`} />
              ))}
            </div>
            <div className="fila-botones">
              <button className="btn" onClick={() => window.atril.proyeccion.identificar()}>Identificar pantallas</button>
            </div>
          </>
        ) : (
          <p className="tenue">Solo hay una pantalla conectada. La proyección se abre en una ventana; al conectar el datashow o una TV se podrá enviar ahí.</p>
        )}
        {proy && proy.abierta && proy.enVentana && <button className="btn" onClick={() => window.atril.proyeccion.pantallaCompleta()}>{proy.pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}</button>}
      </section>

      <section className="ajuste">
        <h3>Canciones</h3>
        <Campo etiqueta="Líneas máximas por diapositiva" ayuda="Las estrofas largas se parten solas en partes parejas.">
          <Segmentos valor={maxLineas} opciones={[2, 3, 4, 5, 6].map((n) => ({ v: n, t: String(n) }))} alCambiar={alMaxLineas} />
        </Campo>
      </section>

      <section className="ajuste">
        <h3>Respaldo</h3>
        <p className="tenue">Guarda tus canciones y cultos en un archivo para llevarlos a otra computadora.</p>
        <div className="fila-botones">
          <button className="btn" onClick={exportar}><Icono n="descargar" t={16} /> Guardar respaldo</button>
          <button className="btn" onClick={importar}><Icono n="subir" t={16} /> Restaurar respaldo</button>
        </div>
      </section>

      <section className="ajuste">
        <h3>Actualizaciones</h3>
        <p className="tenue">Atril funciona sin internet. Solo usa la conexión para revisar si hay una versión nueva.</p>
        <div className="fila-botones">
          <button className="btn" onClick={buscar}><Icono n="actualizar" t={16} /> Buscar actualización</button>
          {nueva && <button className="btn btn-lleno" onClick={instalar}>Instalar versión {nueva.version}</button>}
        </div>
        {estadoAct && <p className="estado-act">{estadoAct}{progreso !== null ? ` ${Math.round(progreso * 100)}%` : ''}</p>}
      </section>

      <section className="ajuste acerca">
        <p><b>Atril</b> · versión {version}</p>
        <p className="tenue">{IGLESIA.completo}</p>
        <p className="tenue">Texto bíblico: Reina-Valera 1960. © Sociedades Bíblicas en América Latina.</p>
      </section>
    </Modal>
  );
}

export function Remoto({ alCerrar }) {
  const [info, setInfo] = useState(null);
  useEffect(() => { window.atril.remoto.info().then(setInfo); }, []);
  return (
    <Modal titulo="Control desde el celular" ancho={560} alCerrar={alCerrar}>
      <p>Conecta el celular a <b>la misma red WiFi</b> de esta computadora, escanea el código y tendrás los botones de siguiente, anterior, negro y búsqueda en la mano. No necesita internet.</p>
      {!info && <p className="tenue">Preparando…</p>}
      {info && info.urls.length === 0 && <p className="error-texto">No encontré una red local. Conecta esta computadora a un WiFi o a un cable de red.</p>}
      <div className="qr-lista">
        {info && info.urls.map((u) => (
          <div key={u.url} className="qr">
            <img src={u.qr} alt="Código QR" />
            <code>{u.url}</code>
          </div>
        ))}
      </div>
      <p className="tenue chico-texto">Si Windows pregunta por el firewall la primera vez, permite el acceso en redes privadas.</p>
    </Modal>
  );
}
