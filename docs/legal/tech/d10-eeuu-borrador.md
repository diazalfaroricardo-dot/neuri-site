# Borrador para revisión legal — neuri.tech /legal (D-10, EE. UU. primero)

> **Borrador para revisión legal.** No está publicado. Lo publicado sigue siendo neuri.tech /legal v1.0 y /en/legal/ v1.0.
> Preparado por el equipo tech el 22-nov-2026 por la directiva D-10 de Ricardo (22-nov 18:21):
> «nada que diga México o MXN a un visitante de EE. UU.». Estos dos puntos cambian una promesa o la
> jurisdicción, por eso no se tocaron en la página: los decide el abogado.

## 1. Impuestos (`<li data-terms-taxes>`, /legal/ y /en/legal/)

**Publicado hoy (EN):** «Peso prices include 16 % VAT, shown separately. Dollar prices exclude taxes: where the law of your business location requires us to collect them (e.g. Arizona TPT), we add them and show them before you pay. Give us a correct tax address. A tax-rate change is not a plan price increase.»

**Publicado hoy (ES):** «Los precios en pesos incluyen el IVA del 16 %, desglosado en precios y en tu recibo. Los precios en dólares no incluyen impuestos: …»

**Propuesta (EN):** «Taxes: prices are in US dollars and exclude taxes. Where the law of your business location requires us to collect sales or similar taxes (e.g. Arizona TPT), we add them and show them before you pay. Give us a correct tax address. A tax-rate change is not a plan price increase.»

**Propuesta (ES, neutro):** «Impuestos: los precios están en dólares estadounidenses y no incluyen impuestos. Si la ley del lugar de tu negocio nos obliga a cobrar impuestos sobre ventas u otros similares (p. ej. TPT de Arizona), los sumamos y los verás antes de pagar. Danos una dirección fiscal correcta. Un cambio de tasa no es aumento de precio.»

**Pregunta para el abogado:** ¿siguen existiendo clientes que pagan en pesos (bazar, bots, marketing)? Si sí, la frase del IVA tiene que quedarse para ellos (quizá en los términos de cada producto, no en la página general). Quitarla sin migrar a esos clientes cambiaría su contrato.

## 2. Ley aplicable y disputas (/legal/ y /en/legal/)

**Publicado hoy (EN):** «… no class actions. If you are a consumer in Mexico, you keep your rights before PROFECO.»

**Propuesta (EN):** «… no class actions. Nothing in these terms limits rights you have as a consumer under the mandatory law of the place where you live.»

**Propuesta (ES):** «… sin demandas colectivas. Nada de estos términos limita los derechos que tengas como consumidor según las leyes obligatorias del lugar donde vives.»

**Pregunta para el abogado:** la redacción genérica cubre también a México sin nombrarlo; confirmar que no reduce lo que hoy se promete a consumidores mexicanos y que es compatible con la cláusula de arbitraje en EE. UU.

## Cómo publicar cuando haya visto bueno

Cambiar solo esas dos frases en `legal/index.html` y `en/legal/index.html`, subir la versión a v1.1 con fecha y
correr `scripts/legal-pie-test.mjs` y `scripts/t50-legal-en-test.mjs`.

## 3. Mínimo de pago del programa de afiliados (/afiliados/ y /en/affiliates/, sección de términos v0.2)

**Publicado hoy:** «Mínimo para pagar: US$25 / MX$500.» / «Minimum payout: US$25 / MX$500.»

**Propuesta:** «Mínimo para pagar: US$25.» / «Minimum payout: US$25.»

**Pregunta para el abogado:** el programa sigue apagado (noindex, «Pronto»), así que no hay afiliados con derecho
adquirido; confirmar que se puede quitar la opción en pesos antes de encenderlo. El resumen de marketing de arriba
(«Cobras cada mes») ya dice solo US$25.
