/* mk-material: sección #material (pestañas, abanico de reels, baraja de carrusel, 5 composiciones, crudo → reel, filtro). */
(function(){
  var sec=document.getElementById('material');if(!sec)return;
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tabs=[].slice.call(sec.querySelectorAll('.mt')),panels=[].slice.call(sec.querySelectorAll('.mpanel')),cur=0,vis=false,tick=0;
  function playIn(p){p.querySelectorAll('video').forEach(function(v){var ph=v.closest('.mphone');if(vis&&!RM&&p.classList.contains('on')&&(!ph||ph.dataset.pos==='0'))v.play().catch(function(){});else v.pause()})}
  function sel(i,focus){
    tabs.forEach(function(t,k){var on=k===i;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;panels[k].hidden=!on;panels[k].classList.toggle('on',on);playIn(panels[k])});
    cur=i;tick=0;if(focus)tabs[i].focus();var bar=tabs[i].parentNode;if(bar.scrollWidth>bar.clientWidth)bar.scrollTo({left:Math.max(0,tabs[i].offsetLeft-24),behavior:RM?'auto':'smooth'});
  }
  tabs.forEach(function(t,k){
    t.addEventListener('click',function(){sel(k)});
    t.addEventListener('keydown',function(e){var n=(e.key==='ArrowDown'||e.key==='ArrowRight')?1:(e.key==='ArrowUp'||e.key==='ArrowLeft')?-1:0;
      if(e.key==='Home'){e.preventDefault();sel(0,true)}else if(e.key==='End'){e.preventDefault();sel(tabs.length-1,true)}else if(n){e.preventDefault();sel((cur+n+tabs.length)%tabs.length,true)}});
  });
  // Abanico de reels: el de enfrente se reproduce; clic en otro lo trae al frente
  var fan=sec.querySelector('[data-fan]'),ph=[].slice.call(fan.querySelectorAll('.mphone')),order=ph.map(function(_,i){return i});
  function lay(){order.forEach(function(idx,pos){var f=ph[idx];f.dataset.pos=String(pos);f.setAttribute('aria-current',pos===0?'true':'false')});playIn(panels[0])}
  ph.forEach(function(f,idx){f.tabIndex=0;f.setAttribute('role','button');
    function front(){var p=order.indexOf(idx);if(p>0){order.splice(p,1);order.unshift(idx);tick=0;lay()}}
    f.addEventListener('click',front);f.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();front()}})});
  lay();
  // Baraja del carrusel: cada diapositiva pasa al fondo; los chips cambian de negocio
  function deckPos(d,k){[].forEach.call(d.querySelectorAll('img'),function(im,n){im.style.setProperty('--p',String((n-k+5)%5))});d._k=k}
  var decks=[].slice.call(sec.querySelectorAll('.mdeck'));decks.forEach(function(d){deckPos(d,0)});
  sec.querySelectorAll('.mgsw .chip').forEach(function(c){c.addEventListener('click',function(){
    sec.querySelectorAll('.mgsw .chip').forEach(function(o){o.setAttribute('aria-pressed',String(o===c))});
    decks.forEach(function(d){var on=d.dataset.deck===c.dataset.show;d.hidden=!on;if(on)deckPos(d,0)});tick=0})});
  // Una foto, cinco diseños: abanico que rota el del centro
  var looks=[].slice.call(sec.querySelectorAll('.mlook')),lk=0;
  function lookPos(){looks.forEach(function(l,n){var o=((n-lk+7)%5)-2;l.style.setProperty('--o',String(o));l.style.setProperty('--a',String(Math.abs(o)));l.classList.toggle('front',o===0)})}
  looks.forEach(function(l,n){l.addEventListener('click',function(){lk=n;tick=0;lookPos()})});
  lookPos();
  // Filtro antes / después
  var cmp=sec.querySelector('.mcmp');if(cmp){var r=cmp.querySelector('input');r.addEventListener('input',function(){cmp.style.setProperty('--x',r.value+'%')})}
  // Visible / no visible
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){vis=e.isIntersecting;panels.forEach(playIn)})},{threshold:.2}).observe(sec.querySelector('.mstage'))}
  else{vis=true;playIn(panels[0])}
  if(RM)return;
  setInterval(function(){
    if(!vis||document.hidden)return;tick++;
    if(cur===0&&tick%6===0){order.push(order.shift());lay()}
    if(cur===1){var d=decks.filter(function(x){return !x.hidden})[0];if(d&&tick%1===0)deckPos(d,(d._k+1)%5)}
    if(cur===2&&tick%2===0){lk=(lk+1)%5;lookPos()}
  },1800);
})();
