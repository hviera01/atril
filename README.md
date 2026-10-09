# Atril

Programa de escritorio (Windows) para proyectar versículos, canciones, anuncios e imágenes en el culto. Hecho para la Iglesia Lirio de los Valles - AD.

Funciona 100% sin internet. Solo usa la conexión, si hay, para avisar que existe una versión nueva.

## Qué hace

- Biblia Reina-Valera 1960 completa y local: se busca por referencia (`jn 3 16`, `salmo 23`, `1 co 13:4-7`) o por palabra.
- Culto armado de antemano (pasajes, canciones, imágenes, anuncios, cuenta regresiva) y navegación en vivo con flechas, o saltando a cualquier otro pasaje sin perder el lugar.
- Biblioteca de canciones: se pega la letra y se divide sola en estrofas y coros.
- Pantalla de proyección en una ventana aparte para el datashow, con diseños intercambiables y editables (fondos de color, degradado, imagen o video).
- Proyección en todas las pantallas que haya conectadas, con un rol distinto en cada una (principal, escenario para el pastor, solo canciones, solo versículos, avisos, logo fijo o apagada) y un diseño propio por pantalla.
- Control remoto desde el celular por la red WiFi local.
- Respaldo y restauración de canciones y cultos.

## Instalar en otra computadora

Descargar el instalador (siempre la versión más reciente) y ejecutarlo. No hace falta nada más: trae todo lo necesario (incluida la Biblia) y no pide permisos de administrador ni internet.

https://github.com/hviera01/atril/releases/latest/download/Atril-Setup.exe

Requiere Windows 10 u 11 de 64 bits. Como el instalador no está firmado digitalmente, Windows puede mostrar «Windows protegió su PC»: pulsar «Más información» y luego «Ejecutar de todas formas». La primera vez que se usa el control desde el celular, Windows pregunta por el firewall: permitir en redes privadas.

## Desarrollo

```
npm install
npm run biblia      # descarga el texto bíblico a data/rvr1960.json (no se sube al repo)
npm run dev         # interfaz con recarga en caliente + Electron
npm test
```

## Instalador y actualizaciones

```
npm run instalador
```

Genera `instalador/Atril-Setup-<versión>.exe` (Inno Setup, instalación por usuario, sin permisos de administrador).

Para publicar una versión nueva:

1. Subir `version` en `package.json`.
2. `npm run instalador`.
3. Crear un release en GitHub con la etiqueta `v<versión>` y adjuntar el `Atril-Setup-<versión>.exe` (lo usa el actualizador) y una copia con el nombre fijo `Atril-Setup.exe` (para el enlace de descarga directa de arriba).

Las copias instaladas consultan `releases/latest` de este repositorio, avisan en la barra superior y se actualizan en silencio cuando el operador lo confirma.
