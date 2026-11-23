# IndexNow en neuri.tech

Backlog: `seo-indexnow`. IndexNow avisa a Bing (que alimenta ChatGPT Search), Yandex, Seznam y
Naver qué URLs cambiaron, sin esperar a que pase el rastreador.

## La llave (pública por diseño)

- Llave: `03f7fa0bb42ae6fc4ff35b88291c0e33`
- Archivo de verificación: `https://neuri.tech/03f7fa0bb42ae6fc4ff35b88291c0e33.txt`
  (contenido: la llave, sin salto de línea). Vive en la raíz de neuri-site.
- No es un secreto: IndexNow pide publicarla. Está en la lista blanca de `.gitleaks.toml`.

## Cómo funciona en neuri-site

- `.github/workflows/indexnow.yml`: en cada push a `main` que toque `*.html` o `sitemap.xml`, espera
  ~150 s a que GitHub Pages publique, saca los archivos cambiados del diff (`before..sha`), los pasa a
  URL (`x/index.html` → `https://neuri.tech/x/`) y manda solo las que están en `sitemap.xml`.
- `scripts/indexnow.mjs` hace el POST a `https://api.indexnow.org/indexnow`; sale con error si la
  respuesta no es 200/202.
  - `node scripts/indexnow.mjs --todo` → sitemap completo
  - `node scripts/indexnow.mjs --desde <sha> --hasta <sha>` → solo lo cambiado
  - `--dry` → imprime el JSON sin mandar
- A mano: Actions → IndexNow → Run workflow (casilla «Mandar el sitemap completo»).
- Apagar: variable del repo `INDEXNOW_APAGADO=1` o «Disable workflow».

## Para crecer-apps (consulting.neuri.tech y marketing.neuri.tech)

Reusar **la misma llave** (IndexNow permite una llave por host, y puede ser la misma):

1. Servir `GET /03f7fa0bb42ae6fc4ff35b88291c0e33.txt` → `200`, `text/plain`, cuerpo
   `03f7fa0bb42ae6fc4ff35b88291c0e33` en cada host (consulting.neuri.tech, marketing.neuri.tech).
2. Paso post-deploy en Railway: POST a `https://api.indexnow.org/indexnow` con
   `{"host":"consulting.neuri.tech","key":"03f7fa0bb42ae6fc4ff35b88291c0e33","keyLocation":"https://consulting.neuri.tech/03f7fa0bb42ae6fc4ff35b88291c0e33.txt","urlList":[...]}`.
   Cada host manda solo sus URLs (el host del cuerpo debe coincidir con el de cada URL).
3. Esperar `200` o `202`. `403` = la llave no se encontró en `keyLocation`; `422` = URL de otro host.

## Envíos

| Fecha | Qué | Respuesta |
|---|---|---|
| 2026-11-23 | Sitemap completo de neuri.tech (primer envío) | ver commit del primer envío en el backlog |

## Checklist de 1 minuto si algo falla

1. `curl -s https://neuri.tech/03f7fa0bb42ae6fc4ff35b88291c0e33.txt` → debe imprimir la llave.
2. `node scripts/indexnow.mjs --todo` desde la raíz → `IndexNow 200` o `202`.
3. En Actions → IndexNow, revisar el log de la última corrida.
