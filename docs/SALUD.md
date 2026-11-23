# Salud de Neuri (GitHub Action, $0)

Item: `backlog/hf-idea-20261122-salud-dmarc-action` (cubre también `backlog/eng-revision-programada`).
Aprobado por Ricardo el 22-nov-2026 (opción B: «que el equipo lo haga como GitHub Action en
neuri-site, sin tarea programada, $0»). Hecho por el equipo tech.

- Workflow: [`.github/workflows/salud.yml`](../.github/workflows/salud.yml)
- Script: [`scripts/salud/salud.mjs`](../scripts/salud/salud.mjs) (Node 22, sin dependencias)
- Costo: **US$0** (minutos gratis de Actions; ~1 min por corrida). Sin secretos, sin llaves, sin correos.
- **Solo lee**: unas pocas peticiones GET a las apps y consultas DNS públicas. No escribe en ninguna app.

## Qué revisa

### Cada 3 horas — :57 de 02 a 23 h Phoenix (02:57, 05:57, 08:57 … 23:57)

| App | Portada (200, siguiendo redirecciones) | Salud |
|---|---|---|
| tech | `https://neuri.tech/` | — (GitHub Pages: `/health` y `/estado` dan 404) |
| bots | `https://sd.neuri.tech/` (→ neuri.tech/sigue-disponible/) | `/health` |
| bazar | `https://bazar.neuri.tech/` | `/health` |
| consulting | `https://consulting.neuri.tech/` | `/health` |
| marketing | `https://marketing.neuri.tech/` (→ neuri.tech/marketing/) | `/health` |

- `/health` cuenta como verde si responde 200 con JSON, `ok` no es `false` y ningún `jobs.*.ok` es `false`.
  Se usa `/health` (existe en las 4 apps de Railway); `/estado` es informativo y no se revisa.
- **Tiempo de respuesta:** si la portada tarda más de 4 000 ms (variable del repo `SALUD_LENTO_MS`)
  en todos los intentos, abre el problema «portada lenta».
- **Sin falsas alarmas por un parpadeo:** cada revisión se intenta hasta 3 veces con 10 s entre intentos.

### Una vez al día — corrida de 05:57 Phoenix

**Correo** (selector DKIM `resend`, deducido de los registros actuales: los tres dominios mandan o
reciben con Resend):

| Dominio | SPF | DKIM | DMARC |
|---|---|---|---|
| neuri.tech | `neuri.tech` (Porkbun) + `send.neuri.tech` con `include:amazonses.com` | `resend._domainkey` con llave `p=` | `_dmarc` con `p=` válido |
| holaneuri.com | igual | igual (ojo: holaneuri.com tiene un CNAME comodín a Porkbun; un CNAME **no** cuenta como llave) | igual |
| in.neuri.tech | solo recibe (MX `receive.forge.rmta.net`): sin SPF = **aviso** | `resend._domainkey` con llave | sin `_dmarc` propio = **aviso** (hereda el de neuri.tech) |

Falla (abre issue): falta SPF o hay dos; SPF de envío sin amazonses; falta la llave DKIM; falta DMARC,
hay dos o no tiene política; in.neuri.tech sin MX. **Aviso** (solo en el resumen): DMARC `p=none`
(hoy en neuri.tech y holaneuri.com; endurecer a `quarantine` es una decisión aparte), los heredados de
in.neuri.tech y vulnerabilidades *moderate*.

Si el resolvedor DNS del runner no responde, abre **un** solo problema (`dns-resolvedor`) en vez de
marcar todo en rojo.

**Dependencias:** `pnpm audit --prod` de **neuri-bazar** (repo público: se clona sin token y no se
instala nada; equivale a `npm audit --omit=dev` para un repo con pnpm). Falla si hay *high* o
*critical*. neuri-site no tiene `package.json` (sitio estático), así que no hay nada que auditar ahí.

## Issues «salud»

- **Un issue por problema**, con título `Salud: <problema>` y una marca oculta `<!-- salud:<clave> -->`
  (p. ej. `app-bazar-health`, `dns-neuri.tech-dkim`, `deps-neuri-bazar`). Nunca duplica.
- Mientras siga en rojo, se **actualiza el cuerpo en silencio** (hora y enlace a la última corrida),
  sin comentar, para no llenar de notificaciones.
- En la primera corrida en verde: comenta «Recuperado …» y lo **cierra solo**.
- Cada corrida solo cierra lo que revisó: la de cada 3 h no cierra issues de correo/dependencias.
- El resumen completo (tabla) queda en la corrida y en el artefacto `salud-<id>` (14 días).
- La corrida termina en verde aunque haya problemas: el aviso es el issue. Si la corrida queda en rojo,
  es que el propio workflow falló.

## Correrlo a mano

Actions → **Salud** → *Run workflow* → modo `todo` (por defecto), `apps` o `diario`.
En local (sin tocar issues): `SALUD_DNS=doh node scripts/salud/salud.mjs --modo todo --sin-issues`
(`SALUD_DNS=doh` usa DNS sobre HTTPS si tu red no deja consultar TXT).

## Cómo apagarlo (1 minuto)

- **Pausa sin tocar código:** Settings → Secrets and variables → Actions → *Variables* → nueva variable
  `SALUD_APAGADO` = `1`. Las corridas se saltan. Para encender de nuevo, bórrala.
- **O bien:** Actions → **Salud** → `…` → *Disable workflow* (y *Enable workflow* para volver).
- **Para siempre:** borrar `.github/workflows/salud.yml`.

Nota: GitHub desactiva solo los workflows programados de un repo sin actividad en 60 días; si pasa,
basta *Enable workflow*.

## Cambiar algo

- Apps o rutas: arreglo `APPS` en `scripts/salud/salud.mjs`.
- Dominios o selector DKIM: `DOMINIOS` y `SELECTOR_DKIM` en el mismo archivo.
- Umbral de lentitud: variable del repo `SALUD_LENTO_MS` (ms).
- Horario: `cron` en `salud.yml` (UTC = Phoenix + 7; la parte diaria es la corrida de 12 UTC).
