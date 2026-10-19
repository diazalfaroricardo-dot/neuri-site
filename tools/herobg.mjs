import { chromium } from "playwright";
const P = {
  bots:{a:"#0B5E3A",bg:"#F6F4EE",ink:"#05080D",sub:"#56635C",tint:"#E3EFE7",suf:".bots",
    es:["Contesta solo.<br>Tú solo entregas.","Mira a tu asistente responder un mensaje real"],
    en:["It answers.<br>You just deliver.","Watch your assistant answer a real message"]},
  bazar:{a:"#B4441A",bg:"#F7F1E8",ink:"#05080D",sub:"#5E554C",tint:"#F6E7DA",suf:".bazar",
    es:["Tu bazar en orden,<br>en tu celular.","Rentas, ventas y vendedores en un solo lugar"],
    en:["Your mall, in order,<br>on your phone.","Rent, sales and vendors in one place"]},
  consulting:{a:"#1F7A52",bg:"#F6F3EE",ink:"#0A1A14",sub:"#4B5B54",tint:"#EAF3EE",suf:".consulting",
    es:["Qué automatizar<br>primero, por escrito.","Un reporte real de ejemplo, de principio a fin"],
    en:["What to automate<br>first, in writing.","A real sample report, start to finish"]},
  marketing:{a:"#C2341D",bg:"#FFF8F2",ink:"#0B1118",sub:"#5B6670",tint:"#F4ECE4",suf:".marketing",
    es:["Tu mes de posts,<br>listo para aprobar.","Elige tu giro y mira tu semana armada"],
    en:["Your month of posts,<br>ready to approve.","Pick your business and see your week"]},
};
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ viewport:{width:600,height:340}, deviceScaleFactor:1 });
for (const [k,t] of Object.entries(P)) for (const l of ["es","en"]) {
  const [h,s]=t[l];
  const html=`<!doctype html><html><head><link href="https://fonts.googleapis.com/css2?family=Geist:wght@500;700;800&family=Geist+Mono:wght@500&display=swap" rel="stylesheet"><style>*{margin:0;box-sizing:border-box}body{width:600px;height:340px;overflow:hidden;font-family:Geist,sans-serif;background:${t.ink};color:#fff;position:relative}
.g{position:absolute;inset:0;background:radial-gradient(120% 90% at 85% 10%, ${t.a} 0%, transparent 55%),radial-gradient(80% 80% at 0% 100%, ${t.a}55 0%, transparent 60%)}
.l{position:absolute;left:32px;top:30px;width:300px}
.br{display:flex;align-items:center;gap:9px;font-weight:700;font-size:17px;letter-spacing:-.02em}.mk{width:26px;height:26px;border-radius:8px;background:${t.a};display:grid;place-items:center;box-shadow:0 0 0 1px #ffffff33}.mk i{width:9px;height:9px;border:2.5px solid #fff;border-radius:50%}.br span{opacity:.75}
h1{margin-top:44px;font-size:31px;line-height:1.08;font-weight:800;letter-spacing:-.04em}
p{margin-top:14px;font-size:14px;line-height:1.4;color:#ffffffbb}
.tag{position:absolute;left:32px;bottom:28px;font:500 11px 'Geist Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:#ffffffaa;display:flex;align-items:center;gap:8px}.tag b{width:8px;height:8px;border-radius:50%;background:#8FE0B4;box-shadow:0 0 0 4px #8FE0B433}
.ph{position:absolute;right:40px;top:22px;width:190px;height:360px;border-radius:30px;background:#0B1118;box-shadow:0 0 0 1.5px #ffffff22,0 30px 60px -10px #000a}
</style></head><body><div class="g"></div><div class="l"><div class="br"><div class="mk"><i></i></div><div>neuri<span>${t.suf}</span></div></div><h1>${h}</h1><p>${s}</p></div><div class="tag"><b></b>${l==="es"?"Demo del producto real":"Real product demo"}</div><div class="ph"></div></body></html>`;
  const pg=await ctx.newPage(); await pg.setContent(html,{waitUntil:"networkidle"}).catch(()=>{}); await pg.waitForTimeout(300);
  await pg.screenshot({path:`hero/bg-${k}-${l}.png`}); await pg.close();
}
await b.close();
