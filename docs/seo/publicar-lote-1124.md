# Publicar lote SEO 24-nov (contenido p1 + calculadoras + 5 giros)

Rama `seo/publicar-lote-1124`: une `seo/contenido-p1` (824fd27), `seo/herramientas-gratis` (6cfe014) y `seo/pseo-giros` (ba8175f) sobre `main`, con:
- links internos de texto desde /sigue-disponible/ (menú «Por tipo de negocio», sección de giros, nota de ManyChat, link «Ver la calculadora completa»), /marketing/ (nota de precios), /bazar/ (FAQ de comisión) y /en/bazar/ (FAQ «How does it compare…»);
- llms.txt con las 11 páginas nuevas;
- giros: «Comparar con ManyChat» → /sigue-disponible/mejores-bots-instagram/; título de salones ≤65 caracteres;
- precios revisados 23-nov (ManyChat 14-nov): válidos hasta el 7-dic; después, revalidar en scripts/seo-contenido-p1.py.

ESTADO: lista, SIN unir. Los 3 items de diseño tienen hold (24-nov 09:21: Ricardo hace el diseño él mismo).

## Checklist de encendido (1 minuto, solo con el OK de Ricardo)
1. `git fetch origin && git checkout main && git pull && git merge --no-ff origin/seo/publicar-lote-1124`
2. `python3 scripts/seo-geo.py $(TZ=America/Phoenix date +%F) && python3 scripts/csp-meta.py && python3 scripts/seo.py`
3. `node scripts/seo-test.mjs && node scripts/jsonld-test.mjs && node scripts/t19-hreflang-test.mjs && node scripts/t28-seo-cabeza-test.mjs && node scripts/basicos.mjs`
4. `git push origin main` → GitHub Pages; IndexNow avisa solo.
5. Verificar en vivo 390/1280: /sigue-disponible/mejores-bots-instagram/, /sigue-disponible/calculadora-dms/, /sigue-disponible/boutiques/, /en/bazar/antique-mall/, /bazar/calculadora-renta-comision/.
Para revertir: `git revert -m 1 <commit del merge>`.
