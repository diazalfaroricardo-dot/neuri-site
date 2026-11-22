# Anuncios: creativos alojados y trabajador de órdenes (diseño, APAGADO)

Estado: **diseño solamente**. No hay tarea programada ni código encendido. Se enciende con el permiso
del piloto automático de anuncios (decisión de Ricardo, item `ads-machine-v1` del hub).

## Qué hay hoy

- Creativos de la tanda 1 de neuri.bots en `ads/tanda-1/` → `https://neuri.tech/ads/tanda-1/…`
  (3 MP4 1080x1920 H.264 con pista silenciosa, 10 PNG 1080x1350 y 1080x1920).
- Inventario en `ads/manifest.json` (id, tipo, tamaño, url, gancho, duración). Meta toma cada pieza por URL.
- `/ads/` no tiene página índice, no está en `sitemap.xml` y ninguna página la enlaza.
- Fuentes para volver a renderizar en `tools/ads/` (no se publican; `_config.yml` excluye `tools`):
  - `gen-hyperframes.py`: arma los 3 proyectos HyperFrames (necesita `kit/fonts/Geist-Variable.woff2`
    = `assets/fonts/geist-latin-wght.woff2` y `kit/gsap.min.js` de gsap 3.12.5 junto al script).
    Luego en cada carpeta: `npx hyperframes check --json` (0 errores) y
    `npx hyperframes render --quality delivery --output out.mp4`; después ffmpeg agrega pista silenciosa
    y `+faststart`.
  - `static-ads.html` + `render-static.cjs`: 5 diseños × 2 tamaños con Playwright (`?d=lock|chat|repeat|question|offer&r=45|916`).
- Las imágenes nuevas se inventarían en `scripts/l10-imagenes-test.mjs` (carpeta `ads/tanda-N`, fuente «Neuri, generado en casa»).

## Trabajador de órdenes de producción (cuando se encienda)

1. **De dónde lee**: la base del hub (artifact de Gloria), colección de órdenes de producción de la vista
   Anuncios (`status: "pedida"`). Una orden = producto, ángulos/ganchos, formatos (9:16 video, 4:5 / 9:16 imagen), notas.
2. **Qué genera**: una tanda nueva `ads/tanda-N/` con el mismo método: ganchos con hook-writer sacados de lo
   que el producto sí hace (precios y promesas copiados de la página del producto, sin cifras ni testimonios
   inventados), videos HyperFrames (`check` sin errores) y PNG con la plantilla HTML en la paleta Neuri
   (Geist; tinta #0F1A14, menta #1F8A5B / #8FE0B4, durazno #B4581F, sol #FFC857, fondo #F5F7F5).
   Revisión a mano con contact sheet antes de subir.
3. **Dónde aloja**: este repo, `ads/tanda-N/` + entrada en `ads/manifest.json`, commit
   «tech: creativos de anuncios tanda N en /ads», `git fetch && git rebase origin/main` antes de cada push,
   nunca `--force`. Verifica en vivo con curl (200 y `video/mp4` / `image/png`).
4. **Qué devuelve**: actualiza la orden en el hub con las URLs verificadas y la pasa a «lista para revisar».
   **Nunca** crea ni publica nada en Meta: eso lo decide Ricardo.

Bandera: `ADS_WORKER_ON` (no existe aún = apagado). Sin bandera encendida, nada corre.

## Checklist de encendido (1 minuto)

1. Ricardo da su sí al piloto automático de anuncios (opción A en `ads-machine-v1`).
2. Gloria crea la tarea programada del trabajador con el prompt de esta página (no antes).
3. Probar con una orden de prueba: debe aparecer `ads/tanda-2/`, el manifest con sus URLs y curl en 200.
4. Si algo falla: apagar la tarea; los creativos ya alojados siguen sirviendo.
