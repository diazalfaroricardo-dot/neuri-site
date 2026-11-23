# sameAs de la entidad Neuri (neuri.tech)

Backlog: `seo-sameas-entidad`. Objetivo: que Google y los asistentes de IA reconozcan a
**Neuri (neuri.tech)** como una sola entidad y no la confundan con Neurons, TalkToNeura, etc.

## Qué hay hoy

- `docs/seo/perfiles.json` es la **única fuente** de perfiles oficiales.
- `scripts/seo-sameas.py` pone en cada nodo `Organization` de Neuri (en todas las páginas HTML de
  neuri-site) `"sameAs": [...]` con esos perfiles, en orden, y `"alternateName": "neuri.tech"`.
  Reconoce el nodo por `@id` `https://neuri.tech/#org`, por nombre `Neuri` / `Neuri LLC` o por
  `url` `https://neuri.tech/`. Las referencias `{"@id": ".../#org"}` no se tocan: apuntan al nodo completo.
- Perfiles al 23-nov-2026: Instagram `https://www.instagram.com/neuri.tech` y Facebook
  `https://www.facebook.com/neuri.tech`.
- Las apps de Railway (bots, bazar, consulting, marketing app) las lleva **crecer-apps** con la
  misma lista (que copien `perfiles.json`).

## Cómo sumar un perfil nuevo (2 minutos)

1. Confirma que el perfil **existe, es de Neuri y abre sin sesión** (curl o navegador). En el hub,
   colección `seo`, el doc del perfil debe estar en status «link vivo».
2. Agrega una línea a `docs/seo/perfiles.json`:
   `{"red": "LinkedIn", "url": "https://www.linkedin.com/company/<slug>", "desde": "AAAA-MM-DD"}`
   (URL canónica, https, sin parámetros ni `/` final sobrante).
3. Corre `python3 scripts/seo-sameas.py` y luego `python3 scripts/seo-sameas.py --check`
   (debe decir `pendientes: 0`), `node scripts/jsonld-test.mjs` y `node scripts/seo-test.mjs`.
4. Commit `seo: sameAs suma <red>` y push a main. Tras el deploy de Pages (1–3 min):
   `curl -s https://neuri.tech/ | grep -o '"sameAs": \[[^]]*\]'`.
5. Avisa a crecer-apps para que lo sumen en las apps de Railway.

Para quitar un perfil (cuenta cerrada o perdida): bórralo del JSON y repite 3–5.

## Reglas

- Solo perfiles nuestros y vivos; nada de directorios donde no tengamos ficha.
- Nombre de la entidad: «Neuri (neuri.tech)». Marca de producto en minúsculas (neuri.bots, neuri.bazar…).
