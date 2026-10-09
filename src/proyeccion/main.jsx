import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import '../compartido/fuentes';
import Escenario from '../compartido/Escenario';

function Pantalla() {
  const [estado, setEstado] = useState({ frame: null, tema: null });
  useEffect(() => {
    const quitar = window.atril.pantalla.alRecibir(setEstado);
    window.atril.pantalla.listo();
    return quitar;
  }, []);
  return (
    <div
      onDoubleClick={() => window.atril.pantalla.alternar()}
      style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}
    >
      <div style={{ width: 'min(100vw, calc(100vh * 16 / 9))' }}>
        <Escenario frame={estado.frame} tema={estado.tema} />
      </div>
    </div>
  );
}

createRoot(document.getElementById('raiz')).render(<Pantalla />);
