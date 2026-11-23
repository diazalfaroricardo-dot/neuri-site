# Idioma en la raíz de neuri.tech (copy-idioma-default, 23-nov-2026)

- `/` sigue siendo inglés: `canonical` = `https://neuri.tech/`, `hreflang` en-US = `/`, es-US = `/es/`, x-default = `/`. Nada de eso cambia.
- Script en línea en el `<head>` de `/index.html`: en la **primera visita a la raíz**, si el idioma preferido del navegador (`navigator.languages[0]`) es español, `location.replace("/es/")` (conserva `?` y `#`).
- No redirige nunca a: buscadores y bots (UA con bot/crawl/spider/headless/lighthouse/inspectiontool/prerender…, `navigator.webdriver`), `?lang=` o `?banner=`, links armados por Neuri (`src`, `ref`, `utm_source`, `utm_campaign`, `negocio`, `business`, `alta`, `moneda`, `giro`), quien ya eligió idioma (`localStorage["neuri-lang"]`, lo guarda `assets/lang.js` al tocar EN/ES), quien llega desde otra página de neuri.tech (el logo «neuri.tech» en inglés va a `/`) ni en visitas siguientes (`localStorage["neuri-lang-raiz"]`).
- Solo la raíz. Las demás URLs con idioma se quedan en su idioma y ofrecen la barra de `assets/lang.js` (QA #8).
- Google rastrea sin `Accept-Language` y con UA de Googlebot: ve siempre la versión en inglés en `/` y la española en `/es/` por hreflang.
- Prueba: `node scripts/copy-idioma-default-test.mjs` (Playwright, es-MX y en-US, 390 y 1280; `--live` contra neuri.tech).
- Apagar: borrar el `<script>` marcado `copy-idioma-default` en `/index.html`.
