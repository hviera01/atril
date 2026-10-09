import { useId } from 'react';

const Lienzo = ({ children }) => (
  <svg className="esc-arte-svg" viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true">{children}</svg>
);

function Libro({ u }) {
  const pagina = 'M960 96 C 760 70 420 78 136 98 L136 970 C 420 952 760 960 960 990 Z';
  const paginaDer = 'M960 96 C 1160 70 1500 78 1784 98 L1784 970 C 1500 952 1160 960 960 990 Z';
  return (
    <Lienzo>
      <defs>
        <linearGradient id={`${u}izq`} x1="0" x2="1">
          <stop offset="0" stopColor="#e6d3ab" />
          <stop offset=".08" stopColor="#f3e6c8" />
          <stop offset=".6" stopColor="#f8eed8" />
          <stop offset=".94" stopColor="#dcc79c" />
          <stop offset="1" stopColor="#b99f72" />
        </linearGradient>
        <linearGradient id={`${u}der`} x1="1" x2="0">
          <stop offset="0" stopColor="#e6d3ab" />
          <stop offset=".08" stopColor="#f3e6c8" />
          <stop offset=".6" stopColor="#f8eed8" />
          <stop offset=".94" stopColor="#dcc79c" />
          <stop offset="1" stopColor="#b99f72" />
        </linearGradient>
        <linearGradient id={`${u}canal`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset=".5" stopColor="#000" stopOpacity=".42" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${u}vi`} cx="50%" cy="48%" r="75%">
          <stop offset=".55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".62" />
        </radialGradient>
        <filter id={`${u}ruido`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 .36  0 0 0 0 .26  0 0 0 0 .13  0 0 0 .2 0" />
        </filter>
        <filter id={`${u}suave`}><feGaussianBlur stdDeviation="16" /></filter>
        <clipPath id={`${u}hojas`}><path d={pagina} /><path d={paginaDer} /></clipPath>
      </defs>
      <ellipse cx="960" cy="1040" rx="880" ry="30" fill="#000" opacity=".55" filter={`url(#${u}suave)`} />
      <rect x="84" y="56" width="1752" height="972" rx="24" fill="#26110a" />
      <rect x="96" y="66" width="1728" height="952" rx="18" fill="#4d2918" />
      <rect x="96" y="66" width="1728" height="952" rx="18" fill="none" stroke="#7a4a2a" strokeOpacity=".5" strokeWidth="2" />
      {[10, 20, 30].map((d) => (
        <path key={d} d={`M${130 + d / 2} ${984 + d / 3} Q 545 ${1006 + d / 3} 960 ${989 + d / 3} Q 1375 ${1006 + d / 3} ${1790 - d / 2} ${984 + d / 3}`} fill="none" stroke="#bda276" strokeOpacity={0.75 - d / 60} strokeWidth="2" />
      ))}
      <path d={pagina} fill={`url(#${u}izq)`} />
      <path d={paginaDer} fill={`url(#${u}der)`} />
      <rect x="120" y="70" width="1680" height="940" filter={`url(#${u}ruido)`} clipPath={`url(#${u}hojas)`} />
      <rect x="860" y="88" width="200" height="904" fill={`url(#${u}canal)`} />
      <rect x="176" y="150" width="738" height="792" fill="none" stroke="#7d5c30" strokeOpacity=".55" strokeWidth="2.5" />
      <rect x="188" y="162" width="714" height="768" fill="none" stroke="#7d5c30" strokeOpacity=".3" strokeWidth="1.2" />
      <rect x="1006" y="150" width="738" height="792" fill="none" stroke="#7d5c30" strokeOpacity=".55" strokeWidth="2.5" />
      <rect x="1018" y="162" width="714" height="768" fill="none" stroke="#7d5c30" strokeOpacity=".3" strokeWidth="1.2" />
      <path d="M936 958 L988 958 L996 1066 L962 1046 L928 1066 Z" fill="#8e1f19" />
      <path d="M962 958 L988 958 L996 1066 L962 1046 Z" fill="#6c1410" opacity=".55" />
      <rect width="1920" height="1080" fill={`url(#${u}vi)`} />
    </Lienzo>
  );
}

function Rollo({ u }) {
  const cil = (y) => (
    <g>
      <rect x="236" y={y + 14} width="1448" height="30" rx="15" fill={`url(#${u}palo)`} />
      <circle cx="236" cy={y + 29} r="24" fill="#3d2410" />
      <circle cx="1684" cy={y + 29} r="24" fill="#3d2410" />
      <rect x="300" y={y} width="1320" height="76" rx="38" fill={`url(#${u}cil)`} />
      {[300, 1620].map((x) => (
        <g key={x}>
          <circle cx={x} cy={y + 38} r="38" fill="#e3cc98" stroke="#7a5a30" strokeWidth="3" />
          <circle cx={x} cy={y + 38} r="26" fill="none" stroke="#9a7a48" strokeWidth="3" />
          <circle cx={x} cy={y + 38} r="14" fill="none" stroke="#9a7a48" strokeWidth="3" />
          <circle cx={x} cy={y + 38} r="5" fill="#7a5a30" />
        </g>
      ))}
    </g>
  );
  return (
    <Lienzo>
      <defs>
        <linearGradient id={`${u}hoja`} x1="0" x2="1">
          <stop offset="0" stopColor="#cfb585" />
          <stop offset=".07" stopColor="#efe0bc" />
          <stop offset=".5" stopColor="#f7ecd0" />
          <stop offset=".93" stopColor="#efe0bc" />
          <stop offset="1" stopColor="#cfb585" />
        </linearGradient>
        <linearGradient id={`${u}cil`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#8a6a3c" />
          <stop offset=".28" stopColor="#ecd8a6" />
          <stop offset=".55" stopColor="#c8aa70" />
          <stop offset="1" stopColor="#6e4f28" />
        </linearGradient>
        <linearGradient id={`${u}palo`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#6b4423" />
          <stop offset=".5" stopColor="#a8723b" />
          <stop offset="1" stopColor="#45290f" />
        </linearGradient>
        <linearGradient id={`${u}sombra`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".38" />
          <stop offset=".12" stopColor="#000" stopOpacity="0" />
          <stop offset=".88" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".38" />
        </linearGradient>
        <filter id={`${u}ruido`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 .4  0 0 0 0 .28  0 0 0 0 .12  0 0 0 .2 0" />
        </filter>
        <filter id={`${u}suave`}><feGaussianBlur stdDeviation="20" /></filter>
      </defs>
      <ellipse cx="960" cy="1030" rx="760" ry="26" fill="#000" opacity=".55" filter={`url(#${u}suave)`} />
      <rect x="338" y="140" width="1244" height="800" fill={`url(#${u}hoja)`} />
      <rect x="338" y="140" width="1244" height="800" filter={`url(#${u}ruido)`} />
      <rect x="338" y="140" width="1244" height="800" fill={`url(#${u}sombra)`} />
      {cil(98)}
      {cil(906)}
    </Lienzo>
  );
}

function Vitral({ u }) {
  const arco = 'M340 1080 V 560 A 620 490 0 0 1 1580 560 V 1080 Z';
  return (
    <Lienzo>
      <defs>
        <clipPath id={`${u}arco`}><path d={arco} /></clipPath>
        <radialGradient id={`${u}rubi`}><stop offset="0" stopColor="#d6402f" stopOpacity=".85" /><stop offset="1" stopColor="#d6402f" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${u}ambar`}><stop offset="0" stopColor="#f4a431" stopOpacity=".8" /><stop offset="1" stopColor="#f4a431" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${u}mar`}><stop offset="0" stopColor="#1f8a86" stopOpacity=".75" /><stop offset="1" stopColor="#1f8a86" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${u}azul`}><stop offset="0" stopColor="#2352a0" stopOpacity=".75" /><stop offset="1" stopColor="#2352a0" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${u}centro`} cx="50%" cy="46%" r="50%"><stop offset="0" stopColor="#000" stopOpacity=".62" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <pattern id={`${u}celosia`} width="96" height="96" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0H96M0 0V96" fill="none" stroke="#080404" strokeWidth="6" />
        </pattern>
      </defs>
      <path d={arco} fill="#1b0d0a" />
      <g clipPath={`url(#${u}arco)`}>
        <circle cx="720" cy="330" r="520" fill={`url(#${u}rubi)`} />
        <circle cx="1240" cy="470" r="560" fill={`url(#${u}ambar)`} />
        <circle cx="1180" cy="930" r="560" fill={`url(#${u}mar)`} />
        <circle cx="640" cy="860" r="520" fill={`url(#${u}azul)`} />
        <rect width="1920" height="1080" fill={`url(#${u}celosia)`} opacity=".55" />
        <rect width="1920" height="1080" fill={`url(#${u}centro)`} />
      </g>
      <path d={arco} fill="none" stroke="#d8a24a" strokeWidth="12" />
      <path d="M362 1080 V 560 A 598 468 0 0 1 1558 560 V 1080" fill="none" stroke="#d8a24a" strokeOpacity=".5" strokeWidth="2.5" />
    </Lienzo>
  );
}

function Montanas({ u, t }) {
  const f = t.fondo;
  return (
    <Lienzo>
      <defs>
        <linearGradient id={`${u}cielo`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={f.color} />
          <stop offset=".62" stopColor="#2c6a72" />
          <stop offset=".8" stopColor={f.color2} />
        </linearGradient>
        <radialGradient id={`${u}sol`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff0c4" stopOpacity=".95" />
          <stop offset=".35" stopColor="#ffd08a" stopOpacity=".45" />
          <stop offset="1" stopColor="#ffd08a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}bruma`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity=".28" />
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill={`url(#${u}cielo)`} />
      <circle cx="960" cy="760" r="520" fill={`url(#${u}sol)`} />
      <circle cx="960" cy="750" r="86" fill="#fff3d0" opacity=".92" />
      <path d="M0 780 L170 660 L320 740 L520 610 L700 720 L890 630 L1070 740 L1270 600 L1460 720 L1650 640 L1810 720 L1920 670 L1920 1080 L0 1080 Z" fill="#2c5663" />
      <rect x="0" y="700" width="1920" height="200" fill={`url(#${u}bruma)`} />
      <path d="M0 870 L150 790 L300 850 L470 760 L650 850 L840 780 L1010 860 L1200 770 L1400 860 L1590 790 L1760 850 L1920 800 L1920 1080 L0 1080 Z" fill="#183843" />
      <path d="M0 960 L130 910 L280 950 L450 890 L620 950 L800 905 L980 960 L1160 900 L1340 955 L1520 905 L1700 950 L1920 910 L1920 1080 L0 1080 Z" fill="#0b1f27" />
    </Lienzo>
  );
}

function Rayos({ u }) {
  const rayos = Array.from({ length: 13 }, (_, i) => {
    const centro = 960 + (i - 6) * 190;
    const ancho = i % 2 === 0 ? 70 : 38;
    return `M960 -140 L${centro - ancho} 1200 L${centro + ancho} 1200 Z`;
  });
  return (
    <Lienzo>
      <defs>
        <linearGradient id={`${u}rayo`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1080">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity=".42" />
          <stop offset=".6" stopColor="#ffe9a8" stopOpacity=".1" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${u}halo`} cx="50%" cy="0%" r="70%">
          <stop offset="0" stopColor="#fff0c0" stopOpacity=".6" />
          <stop offset="1" stopColor="#fff0c0" stopOpacity="0" />
        </radialGradient>
        <filter id={`${u}suave`} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7" /></filter>
      </defs>
      <g filter={`url(#${u}suave)`}>
        {rayos.map((d, i) => <path key={i} d={d} fill={`url(#${u}rayo)`} />)}
      </g>
      <ellipse cx="960" cy="-20" rx="860" ry="520" fill={`url(#${u}halo)`} />
    </Lienzo>
  );
}

function Cruz({ u }) {
  return (
    <Lienzo>
      <defs>
        <radialGradient id={`${u}luz`} cx="50%" cy="38%" r="55%">
          <stop offset="0" stopColor="#d8a24a" stopOpacity=".24" />
          <stop offset="1" stopColor="#d8a24a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill={`url(#${u}luz)`} />
      <path d="M902 60 H1018 V316 H1308 V418 H1018 V1030 H902 V418 H612 V316 H902 Z" fill="#d8a24a" fillOpacity=".07" stroke="#d8a24a" strokeOpacity=".3" strokeWidth="2.5" />
      <path d="M922 84 H998 V336 H1288 V398 H998 V1006 H922 V398 H632 V336 H922 Z" fill="none" stroke="#d8a24a" strokeOpacity=".16" strokeWidth="1.5" />
    </Lienzo>
  );
}

function Manuscrito({ u }) {
  const esquina = (
    <g fill="none" stroke="#7a4524" strokeWidth="3">
      <path d="M58 168 A110 110 0 0 1 168 58" />
      <path d="M58 140 A82 82 0 0 1 140 58" strokeOpacity=".55" strokeWidth="1.8" />
      <rect x="44" y="44" width="22" height="22" transform="rotate(45 55 55)" fill="#9a2a18" stroke="none" />
    </g>
  );
  return (
    <Lienzo>
      <defs>
        <filter id={`${u}ruido`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="11" />
          <feColorMatrix values="0 0 0 0 .4  0 0 0 0 .27  0 0 0 0 .12  0 0 0 .22 0" />
        </filter>
        <radialGradient id={`${u}borde`} cx="50%" cy="50%" r="75%">
          <stop offset=".6" stopColor="#7a4a22" stopOpacity="0" />
          <stop offset="1" stopColor="#7a4a22" stopOpacity=".38" />
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" filter={`url(#${u}ruido)`} />
      <rect width="1920" height="1080" fill={`url(#${u}borde)`} />
      <rect x="56" y="56" width="1808" height="968" fill="none" stroke="#7a4524" strokeWidth="3.5" />
      <rect x="72" y="72" width="1776" height="936" fill="none" stroke="#7a4524" strokeOpacity=".5" strokeWidth="1.5" />
      <g>{esquina}</g>
      <g transform="translate(1920 0) scale(-1 1)">{esquina}</g>
      <g transform="translate(0 1080) scale(1 -1)">{esquina}</g>
      <g transform="translate(1920 1080) scale(-1 -1)">{esquina}</g>
    </Lienzo>
  );
}

const ARTE = { libro: Libro, rollo: Rollo, vitral: Vitral, montanas: Montanas, rayos: Rayos, cruz: Cruz, manuscrito: Manuscrito };

export default function EstiloFondo({ estilo, t, visible }) {
  const u = useId().replace(/:/g, '');
  const Arte = ARTE[estilo];
  if (!Arte) return null;
  return (
    <div className="esc-arte" style={{ opacity: visible ? 1 : 0 }}>
      <Arte u={u} t={t} />
    </div>
  );
}
