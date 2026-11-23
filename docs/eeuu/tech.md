# D-10 · EE. UU. primero en neuri.tech — auditoría del equipo tech

Directiva D-10 (Ricardo, 22-nov-2026 18:21): «quiero que el 99 % de los clientes vengan de Estados Unidos… inglés
primero (español como segunda opción para hispanos en EE. UU.); precios y cobros en USD para visitantes de EE. UU.;
nada que diga México o MXN a un visitante de EE. UU.»

Alcance de tech: lo común de neuri.tech (portada, idioma por defecto, redirecciones, hreflang, sitemap, encabezado
y pie de las páginas generales, 404, legal general, afiliados, novedades, ventures, llms.txt). Las landings de cada
app (`/sigue-disponible/`, `/bazar/`, `/marketing/`, `/consultoria/` y sus pares en `/en/`) las cambian sus equipos
en paralelo; tech no las editó (ver «Qué falta»).

## Qué había (auditoría 22-nov)

| Dónde | Hallazgo |
|---|---|
| `/` | Portada **en español** (`<html lang="es">`, `og:locale es_MX`, `inLanguage es`, reloj `es-MX`, cinta «Pesos y dólares»). El inglés vivía en `/en/home/`. |
| hreflang (todas las páginas y sitemap) | `es`, `en` y **x-default = español**. Un buscador en EE. UU. sin idioma claro recibía español. |
| `/en/home/` | Montos de demo con escala de pesos ($1,800 un ropero, corte de caja $18,420, renta $300 a la semana) y «Pesos and dollars». |
| `404.html` | Español por defecto; solo bajo `/en/` cambiaba a inglés. Un visitante de EE. UU. con un link roto veía español. |
| `/afiliados/` y `/en/affiliates/` | Ejemplo de comisión en MXN (marketing «$599 MXN», «MX$119.80») y «Igual en pesos / Same in pesos». |
| `llms.txt` | Precios MXN primero en los 4 productos y «founders' price for the first 10 paying businesses in Mexico». |
| `/legal/` y `/en/legal/` | «Peso prices include 16 % VAT» y «If you are a consumer in Mexico, you keep your rights before PROFECO». |
| Encabezado/pie de páginas generales | El logo y «Volver al inicio» de las páginas en español apuntaban a `/` (que ahora es inglés); las inglesas a `/en/home/`. |
| schema.org | Organization con dirección de Phoenix, AZ, US — correcto. Sin teléfonos +52 ni CDMX en lo común. |
| Español | Algunos mexicanismos en la portada ES: «tianguis», «platicando». |

## Qué cambió

1. **Inglés por defecto en `/`.** La portada en inglés (antes `/en/home/`) ahora es `index.html`; la portada en
   español se movió a `/es/` (mismo diseño, `git mv`, solo cambian cabecera y textos). `<html lang="en">` en `/`.
2. **Redirecciones, sin romper URLs:**
   - `/en/home/` → `/` (meta refresh + `location.replace`, conserva `?query` y `#ancla`; `noindex`, canonical `/`).
   - `/en/` → `/` (antes iba a `/en/home/`; los `#prueba|#precios…` de bazar siguen yendo a `/en/bazar/`).
   - `/?lang=es` → `/es/` (lo hace `assets/lang.js`; los links viejos «Español» de las landings siguen funcionando).
   - Anclas viejas de la portada española (`/#sistemas`, `#red`, `#consola`, `#principios`, `#laboratorio`, `#inicio`)
     → `/es/#…`.
3. **hreflang:** `en-US` (inglés), `es-US` (español) y **x-default = inglés**, en ese orden, en la portada y en todas
   las páginas comunes, y en `sitemap.xml` (regenerado con `scripts/seo.py`). `og:locale en_US` / `es_US` con
   `og:locale:alternate`. `assets/lang.js` ahora entiende hreflang regionales (`en-US` → `en`) y viejos.
4. **Idioma:** en `/` un teléfono en español (o en zona horaria de México) ve la barra «¡Hola! Esta página también
   habla español» con un toque a `/es/`; en `/es/` un navegador en inglés ve «Switch to English». No hay redirección
   automática por zona horaria (regla QA #8 vigente).
5. **USD:** montos de demo de la portada (EN y ES) en escala de dólares ($180, $45, $120, $1,842, $75/semana); cinta
   «Priced in US dollars» / «Precios en dólares»; afiliados con marketing Start **US$49 → US$9.80/mes, hasta
   US$117.60**; sin la línea de pesos; `llms.txt` reescrito en inglés primero y solo USD.
6. **404 en inglés por defecto**; en español solo bajo rutas en español (`/es/`, `/sigue-disponible/`, `/bazar/`,
   `/marketing/`, `/consultoria/`, `/legal/`, `/novedades/`, `/afiliados/`, `/ventures/`).
7. **Encabezado y pie de páginas generales:** en español el logo y «Volver al inicio» van a `/es/`; en inglés a `/`.
8. **Español neutro** en la portada `/es/`: «mercados de pulgas» en vez de «tianguis», «conversando» en vez de
   «platicando»; `es-US` en reloj y JSON-LD.
9. **Prueba nueva `scripts/d10-eeuu-test.mjs`:** `/` en inglés con hreflang/og:locale correctos, `/es/` en español,
   `/en/home/` y `/en/` redirigen, y nada de México/MXN/pesos/IVA/+52/CDMX en lo común (salvo lo legal en
   borrador); en navegador con Accept-Language en-US a 390 y 1280 la portada sale en inglés sin barra de español, y
   con el teléfono en español sale la barra que lleva a `/es/`. Se comprobó que falla si vuelve un «MX$».
10. **Candados:** `scripts/t19-hreflang-test.mjs` exige el formato nuevo en todo lo común (no puede volver a
   `x-default` en español) y acepta el viejo solo en las landings mientras sus equipos migran.
   `scripts/t19-hreflang.py` reescribe lo común; con `--todo` también las landings. Pruebas de portada, idioma y 404
   actualizadas a la nueva estructura (`/` inglés, `/es/` español).

## Qué falta y por qué

| Pendiente | Dueño | Por qué no lo hizo tech |
|---|---|---|
| **Legal:** quitar «Peso prices include 16 % VAT» y la frase de PROFECO de `/legal/` y `/en/legal/`, y el «US$25 / MX$500» de los términos de afiliados | Abogado (vía Gloria) | Cambia una promesa al cliente y la jurisdicción. Borrador listo en `docs/legal/tech/d10-eeuu-borrador.md` (puntos 1–3); no publicado. |
| hreflang `en-US`/`es-US` con x-default en inglés en las landings (34 páginas) | Equipos bots, bazar, marketing, consulting | No se tocan sus carpetas hoy. Un comando lo deja listo cuando terminen: `python3 scripts/t19-hreflang.py --todo && python3 scripts/seo.py && node scripts/t19-hreflang-test.mjs`. |
| `og:locale es_MX` → `es_US` en 17 páginas de landings | Equipos de cada landing | Mismas carpetas. |
| Logo/«inicio» de las landings en español apunta a `/` (16 archivos) → debería ir a `/es/` | Equipos de cada landing | Funciona (cae en la portada en inglés con barra «también habla español»), pero lo ideal es `/es/`. |
| Links `/en/home/` en las landings en inglés | Equipos de cada landing | Funcionan por la redirección; cambiar a `/` ahorra un salto. |
| México/MXN/pesos en el cuerpo de las landings (~168 menciones en 25 archivos, p. ej. precios MXN por zona horaria en `/sigue-disponible/`) | Equipos de cada landing | Es el contenido de cada app; lo están cambiando hoy. |
| `/legal/`, `/afiliados/`, `/novedades/`, `/ventures/` siguen en español en su URL sin prefijo y el inglés bajo `/en/` | tech (siguiente paso, opcional) | Ya tienen x-default al inglés y toggle; mover URLs ahora rompería links impresos y de Meta/Google sin ganancia clara. |
| Portada `tech-premium-v1` (chat de diseño) | Diseño | Al rebasar, sus cambios a la portada española deben ir a `es/index.html` (git suele detectar el `git mv`; si no, aplicar el diff ahí) y los de la inglesa a `index.html`. |
| «tianguis» en una entrada vieja de `/novedades/` | — | Es historial fechado; no se reescribe. |
