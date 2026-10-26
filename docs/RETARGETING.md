# Retargeting (Meta Pixel) + consentimiento — APAGADO

Estado: construido y apagado (2026-10-26). Hoy neuri.tech solo usa PostHog anónimo sin cookies, y los
avisos de privacidad dicen exactamente eso. **No editar los avisos hasta el día que se encienda**: si se
cambian antes, prometerían cookies que no existen; si se enciende sin cambiarlos, prometerían "sin cookies"
cuando sí hay. Las dos cosas van en el mismo commit.

## Qué hace
- `assets/consent.js` (lo carga `assets/analytics.js` en todas las páginas). Con `ENABLED=false` o sin
  `PIXEL_ID` no hace nada.
- Encendido: banner en la paleta del producto de la página (home/bots/bazar/consulting/marketing), ES/EN,
  «Aceptar» y «Rechazar» con el mismo peso. Nada de Meta se carga antes de «Aceptar».
- Do Not Track o Global Privacy Control = rechazo automático, sin banner.
- Recuerda la respuesta 12 meses (localStorage `neuri_consent_v1`).
- Eventos al pixel (solo con consentimiento): `PageView` y `Lead` cuando se completa un alta
  (`signup_submitted` de analytics.js). Sin nombres, correos ni teléfonos.
- `window.neuriConsent.open()` y cualquier enlace con `data-consent-open` vuelven a abrir el banner.
- Vista previa sin pixel: cualquier página con `?consent_preview=1`.

## Para encenderlo (en un solo commit)
1. Ricardo: crear el dataset/pixel en Meta Events Manager (cuenta de anuncios 203976474044549; hoy no
   tiene ninguno) y dar el ID.
2. En `assets/consent.js`: `ENABLED = true` y `PIXEL_ID = '<id>'`.
3. Avisos de privacidad — en `legal/index.html` (sección `#sitio-h`), después del punto de PostHog:
   > **Anuncios de Neuri (Meta Pixel), solo si aceptas**: si pulsas «Aceptar» en el aviso del sitio,
   > cargamos el pixel de Meta, que usa cookies para recordar que visitaste neuri.tech y mostrarte anuncios
   > de Neuri en Facebook e Instagram. Le avisamos a Meta cuando terminas un registro, sin tu nombre,
   > correo ni teléfono. Si rechazas, o tu navegador pide «No rastrear», no se carga. Puedes cambiar tu
   > respuesta en <a href="#" data-consent-open>Preferencias de anuncios</a>.

   En `en/legal/index.html` (`#site-h`):
   > **Neuri ads (Meta Pixel), only if you accept**: if you click «Accept» on the site notice, we load
   > Meta's pixel, which uses cookies to remember you visited neuri.tech and show you Neuri ads on Facebook
   > and Instagram. We tell Meta when you finish a sign-up, without your name, email or phone. If you
   > decline, or your browser sends "Do Not Track", it doesn't load. You can change your answer in
   > <a href="#" data-consent-open>Ad preferences</a>.

   Ajustar también las tablas de terceros de los avisos de cada producto (`*/privacidad`, `*/privacy`):
   agregar fila «Meta Platforms — anuncios de Neuri en neuri.tech, solo con tu consentimiento — EE. UU.»
   y cambiar "sin cookies" por "sin cookies salvo que aceptes anuncios".
4. Pie de página: agregar `<a href="#" data-consent-open>Preferencias de anuncios</a>` /
   `Ad preferences` (fuente: `scripts/brand-chrome.py`, luego correrlo).
5. Correr `scripts/basicos.mjs`, axe y `scripts/brand-check.mjs`; probar Aceptar/Rechazar/DNT en móvil.
6. Revisión rápida del abogado (está en la lista de LEGAL.md).
