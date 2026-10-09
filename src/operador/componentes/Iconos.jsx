const TRAZOS = {
  busqueda: <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" /></>,
  mas: <path d="M12 5v14M5 12h14" />,
  cerrar: <path d="M6 6l12 12M18 6L6 18" />,
  siguiente: <path d="M9 5l7 7-7 7" />,
  anterior: <path d="M15 5l-7 7 7 7" />,
  culto: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  cancion: <><path d="M9 18V6l10-2v12" /><circle cx="7" cy="18" r="2.5" /><circle cx="17" cy="16" r="2.5" /></>,
  imagen: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="M4 18l5-5 4 4 3-3 4 4" /></>,
  texto: <path d="M5 6h14M12 6v13M9 19h6" />,
  reloj: <><circle cx="12" cy="13.5" r="7.5" /><path d="M12 9.5v4l3 2M9.5 3h5" /></>,
  seccion: <path d="M6 4h12v16l-6-4-6 4z" />,
  biblia: <path d="M12 6c-2-1.5-5-2-8-1.6V18c3-.4 6 .1 8 1.6 2-1.5 5-2 8-1.6V4.4C17 4 14 4.5 12 6zM12 6v13.6" />,
  ajustes: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
  telefono: <><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></>,
  pantalla: <><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20h8M12 16v4" /></>,
  editar: <path d="M4 20l1-4L16 5l3 3L8 19l-4 1zM14 7l3 3" />,
  borrar: <path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13" />,
  duplicar: <><rect x="8" y="8" width="12" height="12" rx="1.5" /><path d="M16 8V5.5A1.5 1.5 0 0014.5 4h-9A1.5 1.5 0 004 5.5v9A1.5 1.5 0 005.5 16H8" /></>,
  paleta: <><path d="M12 3a9 9 0 100 18c1.5 0 2-1 1.5-2-.6-1.2.2-2.5 1.6-2.5H17a4 4 0 004-4 9 9 0 00-9-9z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></>,
  check: <path d="M5 12.5l5 5 9-10" />,
  subir: <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />,
  descargar: <path d="M12 4v12M7 11l5 5 5-5M5 20h14" />,
  video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3" /></>,
  actualizar: <path d="M20 12a8 8 0 10-2.5 5.8M20 5v5h-5" />,
  chevron: <path d="M7 10l5 5 5-5" />,
  pausa: <path d="M8 5v14M16 5v14" />,
  sonido: <><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11" /></>,
  silencio: <><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M17 9l5 6M22 9l-5 6" /></>,
};

export default function Icono({ n, t = 18, relleno = false, className = '' }) {
  if (n === 'grip') {
    return (
      <svg className={className} width={t} height={t} viewBox="0 0 24 24" fill="currentColor">
        {[6, 12, 18].map((y) => [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" />))}
      </svg>
    );
  }
  if (n === 'play') return <svg className={className} width={t} height={t} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5l11 7-11 7z" /></svg>;
  if (n === 'negro') return <svg className={className} width={t} height={t} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8" /></svg>;
  if (n === 'logo') return <svg className={className} width={t} height={t} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" /></svg>;
  if (n === 'limpiar') return <svg className={className} width={t} height={t} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M9 10l6 4M15 10l-6 4" /></svg>;
  return (
    <svg className={className} width={t} height={t} viewBox="0 0 24 24" fill={relleno ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {TRAZOS[n] || null}
    </svg>
  );
}
