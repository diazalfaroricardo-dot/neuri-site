// Genera las tarjetas de assets/email/*.jpg (1200×600) con capturas reales de cada producto.
// Correr en una carpeta con cards/src-{producto}-{es|en}.png; requiere playwright.
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const P = {
  bots:{a:"#0B5E3A",bg:"#F6F4EE",ink:"#05080D",sub:"#56635C",tint:"#E3EFE7",suf:".bots",
    es:["Deja de contestar «¿sigue disponible?» todo el día.","Tu asistente contesta Instagram y Messenger en segundos: precio, disponibilidad, entregas y apartados.","Ver cómo contesta"],
    en:["Stop answering “is this still available?” all day.","Your assistant answers Instagram and Messenger in seconds: price, availability, pickup and holds.","See it answer"]},
  bazar:{a:"#B4441A",bg:"#F7F1E8",ink:"#05080D",sub:"#5E554C",tint:"#F6E7DA",suf:".bazar",
    es:["Tu bazar en orden. Tus vendedores, siempre enterados.","Puestos, rentas, inventario y caja en un solo lugar. Cada vendedor ve su saldo en Mi Puesto.","Ver el recorrido"],
    en:["Your mall, in order. Your vendors, always in the loop.","Booths, rent, inventory and checkout in one place. Each vendor sees their balance in My Booth.","Take the tour"]},
  consulting:{a:"#1F7A52",bg:"#F6F3EE",ink:"#0A1A14",sub:"#4B5B54",tint:"#EAF3EE",suf:".consulting",
    es:["Convierte la IA en resultados de negocio.","Un diagnóstico de IA con un reporte claro: qué automatizar primero y cuántas horas recuperas.","Ver un reporte de ejemplo"],
    en:["Turn AI into business results.","An AI assessment with a clear report: what to automate first and how many hours you win back.","See a sample report"]},
  marketing:{a:"#C2341D",bg:"#FFF8F2",ink:"#0B1118",sub:"#5B6670",tint:"#F4ECE4",suf:".marketing",
    es:["Tus redes, al día. Tú solo apruebas.","Posts y reels del mes con tu estilo, listos en un calendario. Nada sale sin tu visto bueno.","Ver una semana de ejemplo"],
    en:["Your socials, always current. You just approve.","A month of posts and reels in your style, ready on a calendar. Nothing goes out without your OK.","See a sample week"]},
};
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ viewport:{width:1200,height:600}, deviceScaleFactor:1 });
const font = "Geist";
for (const [k,t] of Object.entries(P)) for (const l of ["es","en"]) {
  const img = "data:image/png;base64," + readFileSync(`cards/src-${k}-${l}.png`).toString("base64");
  const [h,s,cta] = t[l];
  const html = `<!doctype html><html><head><link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>
*{margin:0;box-sizing:border-box}body{width:1200px;height:600px;background:${t.bg};font-family:${font},system-ui,sans-serif;color:${t.ink};position:relative;overflow:hidden}
.glow{position:absolute;right:-120px;top:-160px;width:720px;height:720px;border-radius:50%;background:radial-gradient(circle at 50% 50%, ${t.tint} 0%, ${t.tint} 45%, transparent 70%)}
.l{position:absolute;left:64px;top:60px;width:600px}
.brand{display:flex;align-items:center;gap:14px;font-weight:700;font-size:30px;letter-spacing:-.03em}
.mk{width:44px;height:44px;border-radius:13px;background:${t.a};display:grid;place-items:center}.mk i{width:14px;height:14px;border:4px solid #fff;border-radius:50%}
.brand span{color:${t.a}}
h1{margin-top:70px;font-size:58px;line-height:1.04;letter-spacing:-.045em;font-weight:800}
p{margin-top:26px;font-size:25px;line-height:1.42;color:${t.sub};max-width:540px}
.cta{position:absolute;left:64px;bottom:56px;display:inline-flex;align-items:center;gap:12px;background:${t.a};color:#fff;font-weight:600;font-size:22px;padding:16px 26px;border-radius:14px}
.ph{position:absolute;right:70px;top:48px;width:380px;height:620px;border-radius:44px;background:#0B1118;padding:12px;box-shadow:0 40px 80px -30px rgba(5,8,13,.45)}
.ph div{width:100%;height:100%;border-radius:34px;overflow:hidden;background:#fff}
.ph img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.cd{position:absolute;right:56px;top:56px;width:420px;border-radius:30px;overflow:hidden;box-shadow:0 40px 80px -30px rgba(5,8,13,.40),0 0 0 1px rgba(5,8,13,.06);background:#fff}
.cd img{width:100%;display:block}
</style></head><body><div class="glow"></div>
<div class="l"><div class="brand"><div class="mk"><i></i></div><b style="font-weight:700">neuri<span>${t.suf}</span></b></div><h1>${h}</h1><p>${s}</p></div>

${["bots","marketing"].includes(k) ? `<div class="cd"><img src="${img}"></div>` : `<div class="ph"><div><img src="${img}"></div></div>`}</body></html>`;
  const pg = await ctx.newPage(); await pg.setContent(html,{waitUntil:"networkidle"}).catch(()=>{}); await pg.waitForTimeout(400);
  await pg.screenshot({path:`cards/${k}-${l}.jpg`, type:"jpeg", quality:86}); await pg.close();
}
await b.close();
