const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const d of ['lock','chat','repeat','question','offer'])for(const r of ['45','916']){
 const h=r==='916'?1920:1350;const p=await b.newPage({viewport:{width:1080,height:h},deviceScaleFactor:1});
 await p.goto('file://'+__dirname+'/ads.html?d='+d+'&r='+r);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
 await p.locator('.ad').screenshot({path:__dirname+`/out/neuri-bots-${d}-${r==='916'?'9x16':'4x5'}.png`});await p.close();}
await b.close();})();
