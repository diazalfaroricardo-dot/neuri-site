# Encender headers de seguridad en neuri.tech con Cloudflare (LISTO PARA ENCENDER, apagado)

Item: `backlog/eng-alm-au-tech-headers`. Preparado por el equipo tech el 22-nov-2026.

**Por qué:** neuri.tech vive en GitHub Pages, que no deja poner headers. Hoy ya tiene HSTS (lo manda
GitHub), CSP y referrer en `<meta>`, y desde el 22-nov un frame-buster en cada página
(`scripts/csp-meta.py`, prueba `scripts/t67-anti-iframe-test.mjs`). Lo que solo un header puede dar:
`X-Frame-Options` / `frame-ancestors` (clickjacking a nivel navegador, aunque el atacante use sandbox o
el visitante no tenga JS), `X-Content-Type-Options: nosniff` y `Permissions-Policy`.

**Costo:** plan Free de Cloudflare, **US$0**. Sin tarjeta.
**Quién:** Ricardo (la cuenta de Cloudflare y el acceso a Porkbun son suyos; el equipo no crea cuentas).
**Tiempo:** ~15 min de clics + espera de propagación de nameservers (normalmente < 1 h, hasta 24 h).
**Riesgo:** bajo si se copian bien los registros DNS. Lo único delicado: **correo** (MX de Porkbun y
registros de Resend/Amazon SES) y **los subdominios de Railway** (deben quedar en gris, «DNS only»).

---

## Antes de empezar (1 min)

Así está el DNS hoy (leído el 22-nov-2026 con DNS público; Porkbun es la fuente de verdad):

| Tipo | Nombre | Valor | Proxy en Cloudflare |
|---|---|---|---|
| A | `neuri.tech` (apex) | 185.199.108.153 · .109.153 · .110.153 · .111.153 (GitHub Pages) | **Naranja** (Proxied) |
| AAAA | `neuri.tech` (apex) | 2606:50c0:8000::153 · 8001::153 · 8002::153 · 8003::153 | **Naranja** |
| CNAME | `www` | `diazalfaroricardo-dot.github.io` | **Naranja** |
| CNAME | `sd` | `1j44br2w.up.railway.app` | **Gris** (DNS only) |
| CNAME | `bazar` | `ni86styf.up.railway.app` | **Gris** |
| CNAME | `consulting` | `y796doif.up.railway.app` | **Gris** |
| CNAME | `marketing` | `61fahaiz.up.railway.app` | **Gris** |
| MX | `neuri.tech` | 10 `fwd1.porkbun.com` · 20 `fwd2.porkbun.com` (reenvío de hola@neuri.tech) | — |
| TXT | `neuri.tech` | `v=spf1 include:_spf.porkbun.com ~all` | — |
| TXT | `neuri.tech` | `facebook-domain-verification=…` y `google-site-verification=…` (copiar tal cual) | — |
| MX | `send` | 10 `feedback-smtp.us-east-1.amazonses.com` (Resend) | — |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | — |
| TXT | `resend._domainkey` | `p=MIGf…` (DKIM de Resend, copiar completo) | — |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hola@neuri.tech` | — |

DNSSEC: **apagado** hoy (no hay registro DS), así que no hay que desactivarlo antes. Si Porkbun
muestra algún registro que no esté en esta tabla (p. ej. verificaciones `_railway…`, `_github-pages-challenge…`),
también se copia. **Por qué gris en Railway:** Railway emite y renueva el certificado de cada subdominio
validando el CNAME; con proxy naranja esa validación puede fallar y las apps ya mandan sus propios headers.

## Checklist de encendido (1 minuto por paso)

1. **Crear la zona (gratis).** En dash.cloudflare.com con la cuenta de Ricardo → *Add a domain* →
   `neuri.tech` → plan **Free** → *Continue*. Cloudflare escanea e importa registros.
2. **Revisar los registros importados** contra la tabla de arriba: que estén todos (sobre todo MX, TXT
   de Resend/DMARC y los 4 CNAME de Railway). Agregar a mano lo que falte.
3. **Ajustar proxy:** apex (A y AAAA) y `www` en **naranja**; `sd`, `bazar`, `consulting`, `marketing`
   en **gris**. MX/TXT no tienen proxy.
4. **SSL/TLS → Overview → modo «Full (strict)».** (Nunca «Flexible»: GitHub fuerza HTTPS y daría bucle de
   redirecciones.) *SSL/TLS → Edge Certificates → Always Use HTTPS: On.*
5. **Regla de headers:** *Rules → Transform Rules → Modify Response Header → Create rule*.
   Nombre: `neuri.tech headers seguridad`. *If incoming requests match…* → **Custom filter expression**:
   `(http.host eq "neuri.tech" or http.host eq "www.neuri.tech")`. *Then…* → **Set static**, cuatro veces:
   - `X-Frame-Options` = `DENY`
   - `Content-Security-Policy` = `frame-ancestors 'none'`
   - `X-Content-Type-Options` = `nosniff`
   - `Permissions-Policy` = `camera=(), microphone=(), geolocation=()`

   *Deploy.* (El header CSP solo agrega `frame-ancestors`; la CSP completa sigue en el `<meta>` de cada
   página y el navegador aplica las dos.)
6. **Cambiar nameservers en Porkbun:** porkbun.com → *Domain Management* → `neuri.tech` → *Authoritative
   Nameservers* → reemplazar los 4 de Porkbun (`curitiba`, `fortaleza`, `maceio`, `salvador`.ns.porkbun.com)
   por los 2 que da Cloudflare (`xxx.ns.cloudflare.com`). Guardar.
7. **Esperar** el correo/estado «neuri.tech is now active on Cloudflare» (minutos a horas).
8. **Prueba en vivo** (abajo). Si sale bien, avisar al equipo tech para correr las pruebas en vivo y
   cerrar el item.

## Prueba en vivo: cómo saber que ya se encendió

```sh
curl -sI https://neuri.tech | grep -i -E 'x-frame|nosniff|permissions'
# Esperado (3 líneas):
# x-frame-options: DENY
# x-content-type-options: nosniff
# permissions-policy: camera=(), microphone=(), geolocation=()
curl -sI https://neuri.tech | grep -i -E '^server|frame-ancestors'   # server: cloudflare · content-security-policy: frame-ancestors 'none'
```

Y además, desde el repo: `node scripts/t67-anti-iframe-test.mjs --live` (dice si ve los headers de
Cloudflare encendidos o apagados) y `node scripts/csp-meta-test.mjs --live`. Revisar también que
sigan sanos `https://sd.neuri.tech`, `https://bazar.neuri.tech`, `https://consulting.neuri.tech`,
`https://marketing.neuri.tech` y que un correo a hola@neuri.tech llegue.

## Cómo deshacerlo

- **Rápido (minutos), sin tocar DNS:** en Cloudflare, *Rules → Transform Rules* → apagar la regla
  (quita solo los headers); o *Overview → Advanced Actions → Pause Cloudflare on Site* (el tráfico va
  directo a GitHub/Railway, sin proxy).
- **Total:** en Porkbun volver a poner los 4 nameservers de Porkbun (`curitiba`, `fortaleza`, `maceio`,
  `salvador`.ns.porkbun.com). Los registros siguen guardados en Porkbun, así que vuelve todo como
  estaba al propagar (minutos a 24 h). Después se puede borrar la zona en Cloudflare.

## Después de encender

- El frame-buster de `csp-meta.py` se queda como defensa extra (no estorba). Si algún día se quita,
  primero confirmar que el header `X-Frame-Options: DENY` sale en todas las rutas.
- Si GitHub Pages avisa que no puede renovar el certificado de neuri.tech (*Settings → Pages*), poner el
  apex en gris un momento para que renueve y volver a naranja; o cambiar SSL a «Full».
