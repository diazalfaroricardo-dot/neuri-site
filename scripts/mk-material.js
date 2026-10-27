  // mk-material: piezas reales de Neuri Marketing (post, reel animado, carrusel de texto, historia)
  var MK='/img/mk/',LANG=document.documentElement.lang.indexOf('en')===0?'en':'es',MKIO=null;
  function art(g,it,i){
    var w=W[g],d=w.d,tag='<span class="mtag">'+it[0]+'</span>';
    if(i===1)return '<div class="art media reel">'+tag+'<video muted loop playsinline preload="none" poster="'+MK+d+'-'+LANG+'-reel.webp" width="540" height="960" aria-label="'+w.alt[1]+'"><source src="'+MK+d+'-'+LANG+'-reel.mp4" type="video/mp4"></video></div>';
    if(i===2){var s='';for(var n=1;n<=5;n++)s+='<img src="'+MK+d+'-'+LANG+'-tc-'+n+'.webp" width="540" height="675" decoding="async" alt="'+(n===1?w.alt[2]:'')+'"'+(n===1?' class="on"':'')+'>';return '<div class="art media car">'+tag+s+'</div>'}
    if(i===3)return '<div class="art media story"><img src="'+MK+d+'-story.webp" width="640" height="800" decoding="async" alt="'+w.alt[3]+'"><div class="sg"><div class="seg" aria-hidden="true"><i></i><i></i><i></i></div><span class="who"><i>'+w.ini+'</i>'+w.h+'</span></div><div class="poll"><b>'+w.poll[0]+'</b><span>'+w.poll[1]+'</span><span>'+w.poll[2]+'</span></div>'+tag+'</div>';
    return '<div class="art media">'+tag+'<img src="'+MK+d+'-'+LANG+'-post.webp" width="640" height="800" decoding="async" alt="'+w.alt[0]+'"></div>';
  }
  function mkWake(root){
    if(RM)return;
    var vs=root.querySelectorAll('video'),cs=root.querySelectorAll('.car');
    if(!('IntersectionObserver' in window)){vs.forEach(function(v){v.play().catch(function(){})});return}
    if(!MKIO)MKIO=new IntersectionObserver(function(es){es.forEach(function(e){var t=e.target;if(t.tagName==='VIDEO'){if(e.isIntersecting)t.play().catch(function(){});else t.pause()}else t._vis=e.isIntersecting})},{threshold:.25});
    vs.forEach(function(v){MKIO.observe(v)});
    cs.forEach(function(c){MKIO.observe(c);var k=0,im=c.querySelectorAll('img');c._t=setInterval(function(){if(!c.isConnected){clearInterval(c._t);return}if(!c._vis||document.hidden)return;var a=im[k];k=(k+1)%im.length;var b=im[k];b.style.transition='none';b.classList.remove('out');void b.offsetWidth;b.style.transition='';a.classList.remove('on');a.classList.add('out');b.classList.add('on')},2200)});
  }
