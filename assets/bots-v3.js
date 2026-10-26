document.documentElement.classList.add('js');
var NEURI_EN = (document.documentElement.lang||'').slice(0,2)==='en';
(function(){
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var spark = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>';

  // Guiones de conversación (solo funciones que existen hoy en neuri.bots)
  var CHATS = {
    bazar: [
      ['in','Hola, ¿sigue disponible el ropero blanco?'],
      ['out','¡Hola! Sí, sigue disponible. Cuesta $1,800 y puedes recogerlo hoy de 5 a 8 pm. ¿Te lo aparto?'],
      ['in','Sí, apártamelo porfa 🙏'],
      ['out','Listo, quedó apartado a tu nombre hasta las 8 pm. Aceptamos efectivo y transferencia.'],
      ['sys','Apartado anotado · Ropero blanco']
    ],
    citas: [
      ['in','¿Tienes lugar el sábado para uñas?'],
      ['out','¡Claro! El sábado tengo libre a las 10:00, 12:30 y 4:00. ¿Cuál te queda?'],
      ['in','12:30 porfa'],
      ['out','Agendada: sábado 12:30, uñas acrílicas. Te recuerdo un día antes 💅'],
      ['sys','Cita nueva · Sáb 12:30']
    ],
    comida: [
      ['in','¿Me das 2 rollos California y un té?'],
      ['out','¡Va! 2 California ($170 c/u) + té ($35) = $375. ¿Recoges a las 7:30?'],
      ['in','Sí, 7:30'],
      ['out','Anotado para las 7:30. Te aviso por aquí cuando esté listo.'],
      ['sys','Pedido en «Pedidos de hoy»']
    ],
    creador: [
      ['in','LINK'],
      ['out','¡Gracias por comentar! Aquí está el link de la rutina que pediste 👉 tulink.com/rutina'],
      ['in','¿Tienes código de descuento?'],
      ['out','Sí: usa ANA15 para 15% en la tienda. ¡Disfrútalo!'],
      ['sys','Link entregado · palabra LINK']
    ]
  };

  if(NEURI_EN) CHATS = {
    bazar: [['in','Hi, is the white dresser still available?'],['out','Hi! Yes, it’s still available. It’s $180 and you can pick it up today from 5 to 8 pm. Want me to hold it?'],['in','Yes, please hold it 🙏'],['out','Done, it’s on hold under your name until 8 pm. We take cash and Zelle.'],['sys','Hold logged · White dresser']],
    citas: [['in','Any openings Saturday for nails?'],['out','Sure! Saturday I have 10:00, 12:30 and 4:00. Which works for you?'],['in','12:30 please'],['out','Booked: Saturday 12:30, acrylic nails. I’ll remind you the day before 💅'],['sys','New appointment · Sat 12:30']],
    comida: [['in','Can I get 2 California rolls and a tea?'],['out','You got it! 2 California ($17 each) + tea ($3.50) = $37.50. Pick up at 7:30?'],['in','Yes, 7:30'],['out','Got it for 7:30. I’ll message you here when it’s ready.'],['sys','Order in “Today’s orders”']],
    creador: [['in','LINK'],['out','Thanks for commenting! Here’s the workout you asked for 👉 yourlink.com/workout'],['in','Do you have a discount code?'],['out','Yes: use ANA15 for 15% off in the shop. Enjoy!'],['sys','Link sent · word LINK']]
  };
  function bubble(m){
    var d=document.createElement('div');
    d.className='msg '+m[0];
    if(m[0]==='sys'){d.innerHTML=spark+' '+m[1];}
    else{d.textContent=m[1]; if(m[0]==='out'){var t=document.createElement('span');t.className='tag';t.innerHTML=spark+(NEURI_EN?' Answered by Neuri':' Respondido por Neuri');d.appendChild(t);}}
    return d;
  }
  function typing(side){var t=document.createElement('div');t.className='typing '+(side==='in'?'in':'');t.innerHTML='<i></i><i></i><i></i>';return t;}

  function play(el){
    var key=el.getAttribute('data-chat'), run=(el._run||0)+1; el._run=run;
    var s=CHATS[key]; if(!s) return;
    el.innerHTML='';
    if(RM){s.forEach(function(m){var b=bubble(m);b.style.animation='none';el.appendChild(b);});return;}
    var i=0;
    function next(){
      if(el._run!==run) return;
      if(i>=s.length){setTimeout(function(){if(el._run===run) play(el);},3800);return;}
      var m=s[i++];
      if(m[0]==='sys'){el.appendChild(bubble(m));setTimeout(next,900);return;}
      var t=typing(m[0]); el.appendChild(t);
      setTimeout(function(){ if(el._run!==run) return; t.replaceWith(bubble(m)); setTimeout(next, m[0]==='in'?700:1100); }, m[0]==='out'?1100:650);
    }
    // primer cuadro ya con el primer mensaje visible
    el.appendChild(bubble(s[0])); i=1; setTimeout(next,600);
  }
  document.querySelectorAll('.chat[data-chat]').forEach(play);

  // Pestañas de la demo
  document.querySelectorAll('[data-tabs]').forEach(function(g){
    var target=document.getElementById(g.getAttribute('data-tabs'));
    var name=document.getElementById(g.getAttribute('data-name'));
    g.addEventListener('click',function(e){
      var b=e.target.closest('.tab'); if(!b) return;
      g.querySelectorAll('.tab').forEach(function(x){x.setAttribute('aria-selected',x===b);});
      target.setAttribute('data-chat',b.dataset.k);
      if(name){name.querySelector('b').textContent=b.dataset.n; var av=name.querySelector('.av'); av.textContent=b.dataset.i; av.style.background=b.dataset.c;}
      play(target);
    });
  });

  // Header con borde al bajar + barra fija inferior después del hero
  var hdr=document.querySelector('.hdr'), dock=document.querySelector('.dock'), hero=document.querySelector('[data-hero]');
  function onScroll(){
    var y=scrollY; if(hdr) hdr.classList.toggle('scrolled',y>8);
    if(dock&&hero){var end=hero.getBoundingClientRect().bottom; var alta=document.getElementById('alta'); var nearForm=alta&&alta.getBoundingClientRect().top<innerHeight&&alta.getBoundingClientRect().bottom>0; dock.classList.toggle('show',end<0&&!nearForm);}
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // Menú móvil
  var sheet=document.querySelector('.sheet'), burger=document.querySelector('.burger');
  function setSheet(o){ if(!sheet) return; sheet.classList.toggle('open',o); burger&&burger.setAttribute('aria-expanded',o); if(o){var f=sheet.querySelector('a');f&&f.focus();} }
  burger&&burger.addEventListener('click',function(){setSheet(!sheet.classList.contains('open'));});
  sheet&&sheet.addEventListener('click',function(e){ if(e.target===sheet||e.target.closest('a')) setSheet(false); });
  addEventListener('keydown',function(e){ if(e.key==='Escape') setSheet(false); });

  // Entrada al hacer scroll (todo visible; solo desplazamiento)
  if('IntersectionObserver' in window && !RM){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('pend');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.reveal').forEach(function(el){ if(el.getBoundingClientRect().top>innerHeight){el.classList.add('pend');io.observe(el);} });
  }

  // Calculadora (misma fórmula que la demo: mensajes × 30 días × % sin respuesta × % que compra × ticket)
  var c=document.getElementById('calc');
  if(c){
    var f=function(id){return document.getElementById(id);};
    var fmt=new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
    var usd=(function(){try{var mo=(new URLSearchParams(location.search).get('moneda')||'').toLowerCase();if(mo==='usd')return true;if(mo==='mxn')return false;return /^(America\/(New_York|Detroit|Kentucky\/.+|Indiana\/.+|Louisville|Chicago|Menominee|North_Dakota\/.+|Denver|Boise|Phoenix|Los_Angeles|Anchorage|Juneau|Sitka|Metlakatla|Yakutat|Nome|Adak)|Pacific\/Honolulu|US\/.+)$/.test(Intl.DateTimeFormat().resolvedOptions().timeZone||'');}catch(_){return false;}})();
    function calc(){
      var m=+f('lc-msgs').value, l=+f('lc-late').value, cl=+f('lc-close').value, t=+f('lc-ticket').value;
      ['lc-msgs','lc-late','lc-close','lc-ticket'].forEach(function(id){var e=f(id);e.style.setProperty('--f',((e.value-e.min)/(e.max-e.min)*100)+'%');});
      f('o-m').textContent=m; f('o-l').textContent=l+'%'; f('o-c').textContent=NEURI_EN?cl+'%':(cl/10)+' de 10'; f('o-t').textContent='$'+fmt.format(t);
      var ventas=m*30*(l/100)*(cl/100);
      f('o-r').textContent='$'+fmt.format(Math.round(ventas*t));
      f('o-v').textContent=fmt.format(Math.round(ventas));
      if(NEURI_EN) usd=true; var be=Math.max(1,Math.ceil((usd?49:899)/t)); f('o-be').textContent=NEURI_EN?('Win back '+be+(be===1?' sale':' sales')+' a month and it pays for itself.'):('Se paga con '+be+(be===1?' venta.':' ventas.'));
    }
    c.addEventListener('input',calc); calc();
  }
  // Sub-páginas (sin el alta): en zona de EE. UU. o ?moneda=usd, precios en USD como la landing
  (function(){ if(NEURI_EN||document.getElementById('f')) return; var mo=(new URLSearchParams(location.search).get('moneda')||'').toLowerCase(), us=false; try{ us=/^(America\/(New_York|Detroit|Kentucky\/.+|Indiana\/.+|Louisville|Chicago|Menominee|North_Dakota\/.+|Denver|Boise|Phoenix|Los_Angeles|Anchorage|Juneau|Sitka|Metlakatla|Yakutat|Nome|Adak)|Pacific\/Honolulu|US\/.+)$/.test(Intl.DateTimeFormat().resolvedOptions().timeZone||''); }catch(_){}
    if(!(mo==='usd'||(mo!=='mxn'&&us))) return; var P={'$899':'$49','$1,299':'$69'};
    document.querySelectorAll('.pn').forEach(function(s){ if(P[s.textContent]){ s.textContent=P[s.textContent]; var n=s.nextElementSibling; if(n) n.textContent=n.textContent.replace('MXN','USD'); } });
    document.querySelectorAll('.kw').forEach(function(k){ k.textContent=k.textContent.replace('Precios en pesos','Precios en dólares'); });
    document.querySelectorAll('a[href*="giro="]').forEach(function(a){ a.href=a.href.replace('?giro=','?moneda=usd&giro='); });
  })();

  // Ligas viejas a secciones que ahora tienen su página
  var hmap=NEURI_EN?{appointments:'/en/still-available/appointments/',food:'/en/still-available/food/',creators:'/en/still-available/creators/'}:{citas:'/sigue-disponible/citas/',comida:'/sigue-disponible/comida/',creadores:'/sigue-disponible/creadores/'};
  var hh=location.hash.slice(1); if(hmap[hh]) location.replace(hmap[hh]+location.search);
  if(hh==='mas'||hh==='more') location.replace('#giros');
})();

/* ===== Centro de mando (hero v2) ===== */
(function(){
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IG='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></svg>';
  var MS='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3C7 3 3 6.7 3 11.3c0 2.6 1.3 4.9 3.3 6.4V21l3-1.7c.9.3 1.8.4 2.7.4 5 0 9-3.7 9-8.4S17 3 12 3z"/><path d="M8 13l3-3 2 2 3-3"/></svg>';
  var ST={ok:'Contestada',ap:'Apartado',ti:'Te lo pasó a ti',ci:'Cita agendada',pe:'Pedido anotado',li:'Link enviado'};
  var CLS={ok:'ok',ap:'ap',ti:'ti',ci:'ap',pe:'ap',li:'ok'};
  // [canal, nombre, iniciales, color, hora, mensaje, respuesta, estado, segundos]
  var FEEDS={
    bazar:[
      ['ig','Laura M.','LM','#F2C14E','2:14 am','¿Sigue disponible el ropero blanco?','Sí, sigue disponible. Cuesta $1,800 y lo recoges hoy de 5 a 8 pm. ¿Te lo aparto?','ok','2.1'],
      ['ms','Diego R.','DR','#F7B48C','2:31 am','¿En cuánto me lo dejas? Te doy $1,200','Ese precio lo decide Mariana. Le paso tu oferta y te contesta en la mañana.','ti','1.7'],
      ['ig','Sofía P.','SP','#8FE0B4','9:02 am','Apártamelo porfa, paso a las 6','Listo, quedó apartado a tu nombre hasta las 8 pm. Aceptamos efectivo y transferencia.','ap','2.4'],
      ['ms','Pablo G.','PG','#C5D2CB','9:15 am','¿Hacen envíos a Culiacán?','Sí. El envío a Culiacán sale en $150 y llega en 2 días hábiles.','ok','1.9']
    ],
    citas:[
      ['ig','Karla S.','KS','#F7B48C','11:40 pm','¿Tienes lugar el sábado para uñas?','El sábado tengo libre a las 10:00, 12:30 y 4:00. ¿Cuál te queda?','ok','1.8'],
      ['ig','Karla S.','KS','#F7B48C','11:41 pm','12:30 porfa','Agendada: sábado 12:30, uñas acrílicas. Te recuerdo un día antes.','ci','2.0'],
      ['ms','Ana T.','AT','#8FE0B4','8:05 am','Necesito mover mi cita del jueves','Claro. El jueves tengo 3:00 o 5:30, o el viernes a las 11:00. ¿Cuál prefieres?','ok','2.2'],
      ['ig','Rocío L.','RL','#F2C14E','8:20 am','¿Me haces descuento si vamos 3?','Eso lo decide Fer. Le paso tu mensaje y te contesta hoy.','ti','1.6']
    ],
    comida:[
      ['ig','Luis A.','LA','#8FE0B4','6:58 pm','2 rollos California y un té','2 California ($170 c/u) + té ($35) = $375. ¿Recoges a las 7:30?','pe','2.3'],
      ['ms','Marta V.','MV','#F2C14E','7:02 pm','¿Tienen algo sin mariscos?','Sí: el rollo Philadelphia de pollo y el yakimeshi de verduras. ¿Te anoto alguno?','ok','1.9'],
      ['ig','Iván C.','IC','#F7B48C','7:10 pm','¿Ya está mi pedido?','¡Ya está listo! Te esperamos en el mostrador.','ok','1.4'],
      ['ms','Grupo Vera','GV','#C5D2CB','7:15 pm','¿Hacen pedidos para 40 personas?','Un pedido de ese tamaño lo ve Kaori directamente. Ya le pasé tu mensaje.','ti','1.7']
    ],
    creador:[
      ['ig','@fitmaria','FM','#8FE0B4','10:12 am','LINK','¡Gracias por comentar! Aquí está la rutina que pediste: tulink.com/rutina','li','1.2'],
      ['ig','@javi.run','JR','#F2C14E','10:13 am','LINK','¡Aquí va! tulink.com/rutina · Usa ANA15 para 15% en la tienda.','li','1.1'],
      ['ms','Marca Nova','MN','#F7B48C','10:30 am','¿Cuánto cobras por un reel?','Te comparto el media kit de Ana con tarifas. Ana te contacta para cerrar.','ti','2.0'],
      ['ig','@lu.gym','LG','#C5D2CB','10:41 am','¿El código sigue vigente?','Sí, ANA15 sigue vigente hasta fin de mes.','ok','1.5']
    ]
  };

  if(NEURI_EN){
    ST={ok:'Answered',ap:'On hold',ti:'Passed to you',ci:'Booked',pe:'Order logged',li:'Link sent'};
    FEEDS={
      bazar:[['ig','Laura M.','LM','#F2C14E','2:14 am','Is the white dresser still available?','Yes, it’s still available. It’s $180 and you can pick it up today from 5 to 8 pm. Want me to hold it?','ok','2.1'],
        ['ms','Diego R.','DR','#F7B48C','2:31 am','What’s your lowest? I’ll give you $120','Mariana decides on price. I’ll pass her your offer and she’ll reply in the morning.','ti','1.7'],
        ['ig','Sofia P.','SP','#8FE0B4','9:02 am','Please hold it, I’ll come by at 6','Done, it’s on hold under your name until 8 pm. We take cash and Zelle.','ap','2.4'],
        ['ms','Paul G.','PG','#C5D2CB','9:15 am','Do you ship to Tucson?','Yes. Shipping to Tucson is $15 and takes 2 business days.','ok','1.9']],
      citas:[['ig','Karla S.','KS','#F7B48C','11:40 pm','Any openings Saturday for nails?','Saturday I have 10:00, 12:30 and 4:00. Which works for you?','ok','1.8'],
        ['ig','Karla S.','KS','#F7B48C','11:41 pm','12:30 please','Booked: Saturday 12:30, acrylic nails. I’ll remind you the day before.','ci','2.0'],
        ['ms','Ana T.','AT','#8FE0B4','8:05 am','I need to move my Thursday appointment','Sure. Thursday I have 3:00 or 5:30, or Friday at 11:00. Which do you prefer?','ok','2.2'],
        ['ig','Rachel L.','RL','#F2C14E','8:20 am','Any discount if 3 of us come?','Fer decides that. I’ll pass her your message and she’ll reply today.','ti','1.6']],
      comida:[['ig','Luis A.','LA','#8FE0B4','6:58 pm','2 California rolls and a tea','2 California ($17 each) + tea ($3.50) = $37.50. Pick up at 7:30?','pe','2.3'],
        ['ms','Marta V.','MV','#F2C14E','7:02 pm','Anything without seafood?','Yes: the chicken Philadelphia roll and the veggie fried rice. Want me to add one?','ok','1.9'],
        ['ig','Ivan C.','IC','#F7B48C','7:10 pm','Is my order ready?','It’s ready! See you at the counter.','ok','1.4'],
        ['ms','Vera Group','VG','#C5D2CB','7:15 pm','Do you take orders for 40 people?','An order that size goes straight to Kaori. I already passed her your message.','ti','1.7']],
      creador:[['ig','@fitmaria','FM','#8FE0B4','10:12 am','LINK','Thanks for commenting! Here’s the workout you asked for: yourlink.com/workout','li','1.2'],
        ['ig','@javi.run','JR','#F2C14E','10:13 am','LINK','Here you go! yourlink.com/workout · Use ANA15 for 15% off in the shop.','li','1.1'],
        ['ms','Nova Brand','NB','#F7B48C','10:30 am','What do you charge for a reel?','Here’s Ana’s media kit with rates. Ana will reach out to close it.','ti','2.0'],
        ['ig','@lu.gym','LG','#C5D2CB','10:41 am','Is the code still valid?','Yes, ANA15 is valid through the end of the month.','ok','1.5']]
    };
  }
  function thread(m){
    var t=document.createElement('div'); t.className='th';
    t.innerHTML='<div class="th-in"><span class="av" style="background:'+m[3]+'">'+m[2]+'</span><div style="min-width:0"><div class="th-who">'+(m[0]==='ig'?IG:MS)+'<b></b>· '+(m[0]==='ig'?'Instagram':'Messenger')+'</div><p class="th-txt"></p></div><span class="th-t">'+m[4]+'</span></div><div class="th-out"><div><div class="rep"></div><div class="rep-meta"></div></div></div>';
    t.querySelector('.th-who b').textContent=m[1]; t.querySelector('.th-txt').textContent=m[5];
    return t;
  }
  function finish(t,m){
    t.querySelector('.rep').textContent=m[6];
    t.querySelector('.th-out').classList.add('open');
    t.querySelector('.rep-meta').innerHTML='<span class="pl '+CLS[m[7]]+'">'+ST[m[7]]+'</span><span class="ms">'+(NEURI_EN?'in ':'en ')+m[8]+' s</span>';
  }

  document.querySelectorAll('.cons[data-feed]').forEach(function(c){
    var feed=c.querySelector('.feed'), core=c.querySelector('.core'), s=FEEDS[c.dataset.feed]; if(!s) return;
    var stats=c.querySelectorAll('[data-stat]'), n={ok:0,ap:0,ti:0};
    var base={ok:+(stats[0]&&stats[0].textContent)||0,ap:+(stats[1]&&stats[1].textContent)||0,ti:+(stats[2]&&stats[2].textContent)||0};
    function bump(st){var k=(st==='ti')?'ti':(st==='ok'||st==='li')?'ok':'ap'; if(k!=='ok') n.ok++; n[k]++; [['ok',0],['ap',1],['ti',2]].forEach(function(p){var el=stats[p[1]]; if(!el) return; var v=base[p[0]]+n[p[0]]; if(+el.textContent!==v){el.textContent=v; el.classList.add('up'); setTimeout(function(){el.classList.remove('up');},700);} });}
    // Primer cuadro completo: dos pláticas ya contestadas
    [s[0],s[1]].forEach(function(m){var t=thread(m); t.style.animation='none'; finish(t,m); feed.appendChild(t);});
    if(RM) return;
    var i=2, run=true;
    function trim(){ while(feed.children.length>3){ feed.firstElementChild.remove(); } }
    function step(){
      if(!run) return;
      var m=s[i%s.length]; i++;
      var t=thread(m); feed.appendChild(t); trim();
      var row=t.querySelector('.th-in');
      setTimeout(function(){ row.classList.add('scan'); if(core){core.classList.remove('hit'); void core.offsetWidth; core.classList.add('hit');} c.dispatchEvent(new CustomEvent('neuri-pulse')); },450);
      setTimeout(function(){
        var out=t.querySelector('.th-out'), rep=t.querySelector('.rep');
        var th=document.createElement('div'); th.className='thinking'; th.innerHTML='<i></i><i></i><i></i> '+(NEURI_EN?'Neuri is typing':'Neuri está escribiendo'); rep.replaceWith(th);
        out.classList.add('open');
        setTimeout(function(){
          th.replaceWith(rep); var txt=m[6], k=0; rep.innerHTML='<span></span><i class="cur"></i>'; var sp=rep.firstChild;
          var iv=setInterval(function(){ k+=2; sp.textContent=txt.slice(0,k); if(k>=txt.length){clearInterval(iv); rep.textContent=txt; t.querySelector('.rep-meta').innerHTML='<span class="pl '+CLS[m[7]]+'">'+ST[m[7]]+'</span><span class="ms">'+(NEURI_EN?'in ':'en ')+m[8]+' s</span>'; bump(m[7]); setTimeout(step,1900);} },22);
        },850);
      },1300);
    }
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ var was=run; run=e.isIntersecting; if(run&&!was) setTimeout(step,600); }); });
    run=false; io.observe(c);
  });

  // Campo neuronal en canvas detrás del panel
  document.querySelectorAll('.hx').forEach(function(hx){
    var cv=hx.querySelector('.hx-mesh'); if(!cv) return; var ctx=cv.getContext('2d'); var cons=hx.querySelector('.cons');
    var W,H,dpr,P=[],pulses=[],vis=true;
    function size(){ dpr=Math.min(devicePixelRatio||1,2); W=hx.clientWidth; H=hx.clientHeight; cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      var N=Math.round(Math.min(70,W*H/9000)); P=[]; for(var i=0;i<N;i++) P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18,r:Math.random()*1.4+.6}); }
    function target(){ var r=cons?cons.getBoundingClientRect():null, h=hx.getBoundingClientRect(); return r?{x:r.left-h.left+28,y:r.top-h.top+28}:{x:W*.7,y:H*.3}; }
    function frame(){
      if(!vis){ return; }
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<P.length;i++){ var p=P[i]; if(!RM){p.x+=p.vx;p.y+=p.vy;} if(p.x<0||p.x>W) p.vx*=-1; if(p.y<0||p.y>H) p.vy*=-1; }
      for(i=0;i<P.length;i++){ for(var j=i+1;j<P.length;j++){ var a=P[i],b=P[j],dx=a.x-b.x,dy=a.y-b.y,d=dx*dx+dy*dy; if(d<13000){ ctx.strokeStyle='rgba(143,224,180,'+(0.12*(1-d/13000))+')'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); } } }
      for(i=0;i<P.length;i++){ ctx.fillStyle='rgba(143,224,180,.45)'; ctx.beginPath(); ctx.arc(P[i].x,P[i].y,P[i].r,0,6.283); ctx.fill(); }
      var T=target();
      pulses=pulses.filter(function(q){ q.t+=0.018; if(q.t>1) return false; var e=1-Math.pow(1-q.t,3), x=q.x+(T.x-q.x)*e, y=q.y+(T.y-q.y)*e; var g=ctx.createRadialGradient(x,y,0,x,y,18); g.addColorStop(0,'rgba(217,251,232,.95)'); g.addColorStop(1,'rgba(143,224,180,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,18,0,6.283); ctx.fill(); ctx.strokeStyle='rgba(143,224,180,'+(.35*(1-q.t))+')'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(q.x,q.y); ctx.lineTo(x,y); ctx.stroke(); return true; });
      if(!RM) requestAnimationFrame(frame);
    }
    size(); addEventListener('resize',size);
    if(cons) cons.addEventListener('neuri-pulse',function(){ var p=P[Math.floor(Math.random()*P.length)]; if(p) pulses.push({x:p.x,y:p.y,t:0}); });
    new IntersectionObserver(function(es){ var v=es[0].isIntersecting; if(v&&!vis){vis=true; requestAnimationFrame(frame);} vis=v; }).observe(hx);
    requestAnimationFrame(frame);
  });
})();
/* Inclinación del teléfono según el cursor */
(function(){var w=document.querySelector('.iph-wrap'),ph=w&&w.querySelector('.iph');if(!ph||matchMedia('(prefers-reduced-motion: reduce)').matches||!matchMedia('(hover:hover)').matches)return;
var sec=w.closest('section');sec.addEventListener('pointermove',function(e){var r=ph.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;ph.style.setProperty('--ry',(-14+x*16).toFixed(1)+'deg');ph.style.setProperty('--rx',(5-y*8).toFixed(1)+'deg');});
sec.addEventListener('pointerleave',function(){ph.style.removeProperty('--ry');ph.style.removeProperty('--rx');});})();
