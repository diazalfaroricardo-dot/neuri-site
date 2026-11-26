# Encender «Mejores programas para bazar» (ES + EN)

Rama: `build/seo-bazar-mejores` · Generador: `scripts/seo-bazar-mejores.py` · Hecho el 26-nov-2026 (equipo crecer).
Páginas: `/bazar/mejores-programas-bazar/` y `/en/bazar/best-vendor-mall-software/` (par hreflang, Article + ItemList + FAQPage).
Estado: vista previa. No se publica sin el «sí» de Ricardo (hub: `items/seo-bazar-mejores-diseno`).

## Checklist de 1 minuto (tras el «sí»)

1. Precios: volver a abrir las 6 fuentes de la sección «Fuentes» de la página. Si algo cambió, editar
   `scripts/seo-bazar-mejores.py` (ISO/FECHA y el dato) y correr
   `python3 scripts/seo-bazar-mejores.py && python3 scripts/csp-meta.py` (revertir lo que csp-meta toque fuera de estas 2 páginas).
2. Sin confirmar: ConsignPro (precio US$1,495 de pago único, renta, portal y español) sigue marcado «Sin confirmar».
   Si alguien lo confirma en consignpro.com, cambiar la fila y la ficha; si no, se publica así.
3. Enlace a `/en/bazar/vs-simpleconsign/`: esa página vive en la rama `seo/contenido-p1` (backlog/publicar-contenido-p1).
   Publicar esta guía junto con ella o después. Si va antes, quitar ese enlace (2 lugares, ES y EN) para no dar 404.
4. Fusionar la rama a main (sin --force) y esperar el deploy de GitHub Pages.
5. `python3 scripts/seo.py` en main si el sitemap necesita lastmod (la rama ya trae las 2 URLs con su par hreflang).
6. IndexNow: avisar las 2 URLs (mismo procedimiento que las otras páginas de contenido).
7. Verificar en vivo: 200 en las 2 URLs, `node scripts/seo-test.mjs`, `node scripts/brand-check.mjs mejores-programas`,
   y el JSON-LD en la prueba de resultados enriquecidos de Google.

## Pruebas corridas el 26-nov-2026 (rama)

- 390 y 1280 px, ES y EN: sin scroll horizontal; axe (wcag2a/aa, 21a/aa, best-practice): 0 violaciones.
- brand-check (paleta y tipografía bazar, 390/1280, claro/oscuro): verde en las 2.
- seo-test: verde (canonical, título, descripción, sitemap). csp-meta-test: verde.
- JSON-LD: JSON válido; Article con headline, image, author, publisher y fechas; ItemList de 5 con anclas que existen;
  FAQPage = las 6 preguntas visibles, mismo texto.
