const { contextBridge, ipcRenderer } = require('electron');

const invocar = (canal) => (...args) => ipcRenderer.invoke(canal, ...args);
const escuchar = (canal) => (cb) => {
  const f = (_e, ...a) => cb(...a);
  ipcRenderer.on(canal, f);
  return () => ipcRenderer.removeListener(canal, f);
};

contextBridge.exposeInMainWorld('atril', {
  version: invocar('app:version'),
  libros: invocar('libros'),
  buscar: invocar('buscar'),
  capitulo: invocar('biblia:capitulo'),
  canciones: {
    listar: invocar('canciones:listar'),
    obtener: invocar('canciones:obtener'),
    guardar: invocar('canciones:guardar'),
    borrar: invocar('canciones:borrar'),
    importar: invocar('canciones:importar'),
    uso: invocar('canciones:uso'),
  },
  servicios: {
    listar: invocar('servicios:listar'),
    crear: invocar('servicios:crear'),
    actualizar: invocar('servicios:actualizar'),
    borrar: invocar('servicios:borrar'),
    duplicar: invocar('servicios:duplicar'),
    elementos: invocar('servicios:elementos'),
    guardar: invocar('servicios:guardar'),
  },
  ajuste: invocar('ajustes:leer'),
  guardarAjuste: invocar('ajustes:guardar'),
  medios: {
    listar: invocar('medios:listar'),
    importar: invocar('medios:importar'),
    borrar: invocar('medios:borrar'),
  },
  proyeccion: {
    estado: invocar('proyeccion:estado'),
    abrir: invocar('proyeccion:abrir'),
    cerrar: invocar('proyeccion:cerrar'),
    activar: invocar('proyeccion:activar'),
    identificar: invocar('proyeccion:identificar'),
    pantallaCompleta: invocar('proyeccion:pantallaCompleta'),
    enviar: (frame) => ipcRenderer.send('proyeccion:enviar', frame),
    alCambiar: escuchar('proyeccion:cambio'),
  },
  pantalla: {
    listo: () => ipcRenderer.send('pantalla:listo'),
    alRecibir: escuchar('pantalla'),
    alternar: () => ipcRenderer.send('pantalla:alternar'),
  },
  remoto: {
    info: invocar('remoto:info'),
    publicar: (estado) => ipcRenderer.send('remoto:publicar', estado),
    alComando: escuchar('remoto:comando'),
  },
  actualizar: {
    buscar: invocar('actualizar:buscar'),
    instalar: invocar('actualizar:instalar'),
    alDisponible: escuchar('actualizar:disponible'),
    alProgreso: escuchar('actualizar:progreso'),
  },
  respaldo: {
    exportar: invocar('respaldo:exportar'),
    importar: invocar('respaldo:importar'),
  },
});
