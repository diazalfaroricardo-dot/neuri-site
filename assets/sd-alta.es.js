// A286: sacado de sigue-disponible/index.html para que el navegador lo compile aparte y lo guarde en caché.
  // Cuando el webhook de alta esté desplegado, poner su URL aquí; mientras, se usa el correo.
  var SD_ENDPOINT = 'https://sd.neuri.tech';

  /* ---------- Datos de ejemplo por giro (demo, casos y alta) ---------- */
  var GIROS = {
    muebles:{label:'Muebles',emo:'🪑',neg:'Muebles Ejemplo',item:'Mesa de madera para 6',price:1800,
      detQ:'¿Qué medidas tiene?',det:'Mide 1.60 m de largo, 90 cm de ancho y 76 cm de alto. Es de madera maciza y está en muy buen estado.',
      min:1600,offer:1700,cond:'si la recoges esta semana',
      env:'Sí, la llevamos en Guamúchil por $150. A Culiacán o Los Mochis te cotizo.',pago:'Efectivo, transferencia o tarjeta al recoger.',
      donde:'Estamos en Guamúchil centro. Al apartar te mando la ubicación exacta 📍',hora:'Lunes a sábado de 10 a 7.',
      hard:'¿La pueden barnizar color nogal?',a:'la',
      caso:{quien:'Una mueblería de segunda en Guamúchil',prob:'Publica 15 piezas en su página de Facebook y le llegan decenas de «¿sigue disponible?» y «¿lo menos?», casi todos en la noche.',hace:'Contesta precio y medidas desde su hoja, negocia hasta donde el dueño permite sin decir su mínimo y agenda la visita para ver la pieza.'}},
    ropa:{label:'Ropa',emo:'👗',neg:'Closet Ejemplo',item:'Chamarra de mezclilla, talla M',price:350,
      detQ:'¿Qué medidas tiene?',det:'Es talla M: 52 cm de pecho y 64 cm de largo. Se usó dos veces, sin detalles.',
      min:300,offer:320,cond:'si pasas por ella hoy',
      env:'Envío por paquetería a todo México por $120, o entrega en Guamúchil centro sin costo.',pago:'Transferencia o depósito. Efectivo si la recoges.',
      donde:'Entregamos en Guamúchil centro, frente a la plaza.',hora:'Entregas de lunes a viernes, de 5 a 8 p. m.',
      hard:'¿La tienes en talla L?',a:'la',
      caso:{quien:'Una vendedora de ropa por Instagram',prob:'Sube prendas únicas y cada historia trae 30 mensajes de «¿qué talla?» y «¿cuánto el envío?».',hace:'Contesta talla, medidas y costo de envío, aparta la prenda a quien la pide primero y le avisa quién la apartó.'}},
    electronicos:{label:'Electrónicos',emo:'📺',neg:'Electro Ejemplo',item:'Pantalla de 55 pulgadas 4K',price:5500,
      detQ:'¿En qué estado está?',det:'Funciona perfecto, tiene 2 años de uso y trae su control y su base. Sin rayones en la pantalla.',
      min:5000,offer:5200,cond:'si pagas de contado',
      env:'La llevamos en Guamúchil por $200. Fuera de la ciudad no hacemos envíos.',pago:'Efectivo o transferencia.',
      donde:'Estamos en la colonia Morelos, Guamúchil. Al apartar te mando la ubicación 📍',hora:'Lunes a sábado de 11 a 8.',
      hard:'¿Tiene garantía?',a:'la',
      caso:{quien:'Un revendedor de pantallas y celulares',prob:'Le preguntan lo mismo de cada equipo: estado, si incluye accesorios, si acepta cambios, y le hacen ofertas de risa.',hace:'Contesta estado y accesorios desde la hoja, ofrece el precio que él permite y le pasa a él los cambios y preguntas de garantía.'}},
    llantas:{label:'Llantas y refacciones',emo:'🛞',neg:'Llantera Ejemplo',item:'4 llantas 205/55 R16',price:3200,
      detQ:'¿Cuánta vida les queda?',det:'Les queda como 70% de vida. Son medida 205/55 R16, las cuatro parejas.',
      min:2800,offer:3000,cond:'si te las llevas las cuatro hoy',
      env:'No hacemos envío; se recogen en el taller.',pago:'Efectivo o transferencia.',
      donde:'El taller está sobre la carretera México 15, a la entrada de Guamúchil 📍',hora:'Lunes a sábado de 8 a 6.',
      hard:'¿Le quedan a un Jetta 2015?',a:'las',
      caso:{quien:'Una llantera que vende seminuevas',prob:'Todo el día preguntan «¿qué medida?» y «¿cuánta vida les queda?» mientras está con las manos ocupadas.',hace:'Contesta medida, vida y precio por juego, agenda la hora para pasar al taller y le pasa a él las dudas de compatibilidad.'}},
    bebe:{label:'Bebé y juguetes',emo:'🧸',neg:'Bebé Ejemplo',item:'Carriola plegable',price:1200,
      detQ:'¿En qué estado está?',det:'Está como nueva: se usó 6 meses, se dobla con una mano y trae cubierta para lluvia.',
      min:1000,offer:1100,cond:'si la recoges esta semana',
      env:'Entrega en Guamúchil por $80.',pago:'Efectivo o transferencia.',
      donde:'Estamos en la colonia Juárez, Guamúchil 📍',hora:'Todos los días de 9 a 7.',
      hard:'¿Sirve para recién nacido?',a:'la',
      caso:{quien:'Una mamá que vende lo que ya no usan',prob:'Vende de noche, cuando los niños se duermen, y los mensajes del día se le juntan.',hace:'Contesta estado y precio a cualquier hora, aparta la pieza y le agenda la entrega en el horario que ella puso.'}},
    electrodomesticos:{label:'Electrodomésticos',emo:'🧊',neg:'Línea Blanca Ejemplo',item:'Refrigerador de 11 pies',price:4800,
      detQ:'¿Funciona bien?',det:'Funciona perfecto, enfría bien y tiene 3 años. Mide 1.55 m de alto.',
      min:4300,offer:4500,cond:'si lo recoges tú',
      env:'Flete en Guamúchil por $250.',pago:'Efectivo, transferencia o tarjeta.',
      donde:'Estamos en Guamúchil centro 📍',hora:'Lunes a sábado de 9 a 7.',
      hard:'¿Me recibes mi refri viejo a cuenta?',a:'lo',
      caso:{quien:'Un vendedor de línea blanca reacondicionada',prob:'Cada refri trae las mismas preguntas: medidas, si enfría bien, si hay flete y cuánto.',hace:'Contesta medidas y estado, cotiza el flete con su tarifa y agenda la entrega. Los «¿me lo cambias?» se los pasa a él.'}},
    plantas:{label:'Plantas',emo:'🪴',neg:'Vivero Ejemplo',item:'Monstera grande en maceta',price:450,
      detQ:'¿De qué tamaño es?',det:'Mide 1.20 m de alto y viene en maceta de barro de 30 cm.',
      min:400,offer:420,cond:'si te llevas dos',
      env:'Entrega en Guamúchil por $60.',pago:'Efectivo o transferencia.',
      donde:'El vivero está en la salida a Angostura 📍',hora:'Martes a domingo de 8 a 5.',
      hard:'¿Aguanta el sol directo?',a:'la',
      caso:{quien:'Un vivero pequeño',prob:'Mientras riega le preguntan precios y tamaños de cada planta, y los mensajes se le enfrían.',hace:'Contesta tamaño, maceta y precio, aparta plantas para el fin de semana y le pasa a él las preguntas de cuidados.'}},
    comida:{label:'Comida y repostería',emo:'🎂',neg:'Repostería Ejemplo',item:'Pastel de tres leches para 20',price:480,
      detQ:'¿De qué sabores hay?',det:'Hay de vainilla, chocolate y fresa. Es para 20 personas y se pide con 2 días de anticipación.',
      min:480,offer:0,cond:'',
      env:'Entrega en Guamúchil por $50, o pasas a recogerlo.',pago:'Anticipo del 50% por transferencia y el resto al entregar.',
      donde:'Entregamos en Guamúchil. Recolección en la colonia Centro 📍',hora:'Pedidos de lunes a sábado de 9 a 6.',
      hard:'¿Lo pueden hacer sin azúcar?',a:'lo',
      caso:{quien:'Una repostera que vende por encargo',prob:'Pierde pedidos porque no alcanza a contestar sabores, precios y fechas mientras hornea.',hace:'Contesta sabores y precios, toma el pedido para la fecha que hay libre y le avisa quién pidió qué y para cuándo.'}}
  };
  var ORDEN = ['muebles','ropa','electronicos','llantas','bebe','electrodomesticos','plantas','comida'];
  function money(n){return '$'+Math.round(n).toLocaleString('en-US');}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Planes: preseleccionar en el alta ---------- */
  document.querySelectorAll('[data-plan]').forEach(function(a){a.addEventListener('click',function(){var r=document.querySelector('input[name=plan][value="'+a.dataset.plan+'"]');if(r)r.checked=true;});});

  /* A230: vendedores de EE. UU. que leen en español (visitas en Phoenix): ?moneda=usd muestra y manda el plan en USD; sd-setup cobra en USD si el plan dice USD (planswitch.ts) */
  (function(){
    // A235: sin ?moneda, un teléfono con zona horaria de EE. UU. ve USD (quien lee en español en Phoenix); ?moneda=mxn lo regresa a pesos
    var mon = (new URLSearchParams(location.search).get('moneda') || '').toLowerCase(), tzUS = false;
    try { tzUS = /^(America\/(New_York|Detroit|Kentucky\/.+|Indiana\/.+|Louisville|Chicago|Menominee|North_Dakota\/.+|Denver|Boise|Phoenix|Los_Angeles|Anchorage|Juneau|Sitka|Metlakatla|Yakutat|Nome|Adak)|Pacific\/Honolulu|US\/.+)$/.test(Intl.DateTimeFormat().resolvedOptions().timeZone || ''); } catch (_) {}
    if (!(mon === 'usd' || (mon !== 'mxn' && tzUS))) return;
    var M = {'Básico ($899)': ['Básico ($49 USD)', 'Básico, $49 USD'], 'Pro ($1,299)': ['Pro ($69 USD)', 'Pro, $69 USD']};
    document.querySelectorAll('input[name=plan]').forEach(function(r){
      var m = M[r.value]; if (!m) return;
      r.value = m[0];
      var b = r.parentNode.querySelector('b'); if (b) b.textContent = m[1];
    });
    // Los botones de la sección de precios traen data-plan en MXN (la plantilla los vuelve a pintar): se traduce al hacer clic
    document.addEventListener('click', function(e){ var a = e.target.closest && e.target.closest('[data-plan]'); var m = a && M[a.dataset.plan]; if (!m) return; var r = document.querySelector('input[name=plan][value="' + m[0] + '"]'); if (r) r.checked = true; });
    // A233: la sección de precios y los textos sueltos también en USD (la plantilla vuelve a pintar: se repite al cambiar el DOM)
    var P = {'$899': '$49', '$1,299': '$69'};
    // A247: la plantilla vuelve a clonar sus <template> en cada repintado (el demo anima): se corrige el contenido de las plantillas también, y el observer corrige en el mismo microtask (sin ventana en MXN)
    var fixRoot = function(root){
      root.querySelectorAll('span').forEach(function(sp){
        var t = sp.textContent;
        if (sp.children.length === 0 && P[t]) { sp.textContent = P[t]; var n = sp.nextElementSibling; if (n && /MXN/.test(n.textContent)) n.textContent = n.textContent.replace('MXN', 'USD'); }
        else if (sp.children.length === 0 && t === 'El plan Básico cuesta $899 al mes.') sp.textContent = 'El plan Básico cuesta $49 USD al mes.';
      });
      var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), x;
      while ((x = w.nextNode())) if (x.nodeValue.trim() === 'Desde $899 al mes') x.nodeValue = x.nodeValue.replace('$899', '$49 USD');
      root.querySelectorAll('template').forEach(function(tp){ if (tp.content) fixRoot(tp.content); });
    };
    var fix = function(){ fixRoot(document.body || document.documentElement); };
    fix();
    new MutationObserver(fix).observe(document.documentElement, {childList: true, subtree: true, characterData: true});
    // A235: en prod la plantilla a veces pinta precios después (red lenta): se repasa también al cargar y a 1 y 3 s
    window.addEventListener('load', fix); setTimeout(fix, 1000); setTimeout(fix, 3000);
    var nfix = 0, tfix = setInterval(function(){ fix(); if (++nfix >= 40) clearInterval(tfix); }, 250);
    var why = document.querySelector('.paso[data-step="4"] .why');
    if (why) why.insertAdjacentHTML('beforeend', ' <span id="nb-usd">Precios en dólares (EE. UU.): Básico $49 USD/mes, Pro $69 USD/mes.</span>');
  })();
  /* ---------- Alta: asistente de 4 pasos ---------- */
  var form = document.getElementById('f');
  // Si viene del correo de recordatorio (?alta=…), completa la misma alta en vez de crear otra.
  var altaId = (new URLSearchParams(location.search).get('alta') || '').slice(0, 64);
  // Link de referido (?ref=…): se guarda para acreditar el mes gratis a los dos.
  var refCode = (new URLSearchParams(location.search).get('ref') || '').replace(/[^a-z0-9]/gi, '').slice(0, 16);
  var srcCode = (new URLSearchParams(location.search).get('src') || new URLSearchParams(location.search).get('utm_source') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
  (function(){
    var NAMES={1:'Tus datos',2:'Tu negocio',3:'Cómo atiendes',4:'Tu plan'};
    // /intake regresa lo que falta con nombre para personas («Formas de pago»): se traduce al campo para llevarla a ese paso
    var FIELD_OF={'Nombre del negocio':'negocio','Business name':'negocio','Horario de atención':'horario','Business hours':'horario','Dónde se recoge o se ve la pieza':'entrega','Where buyers pick up or see the item':'entrega','Formas de pago':'pagos','Payment methods':'pagos'};
    var STEP_OF={nombre:1,whatsapp:1,correo:1,negocio:2,giro:2,subgiro:2,vendes:2,donde:2,mensajes:2,horario:3,entrega:3,pagos:3,agenda:3,faq:4,plan:4,consent:4};
    var LABEL={nombre:'tu nombre',whatsapp:'tu celular',correo:'tu correo',negocio:'el nombre de tu negocio',vendes:'qué vendes',donde:'dónde vendes',mensajes:'cuántos mensajes recibes',horario:'tu horario',entrega:'cómo entregas',pagos:'tus formas de pago',agenda:'si quieres que agende',faq:'tus preguntas frecuentes',plan:'el plan',consent:'tu permiso para usar los datos'};
    var step=1, steps=form.querySelectorAll('.paso');
    var bBack=document.getElementById('bBack'),bNext=document.getElementById('bNext'),bSend=document.getElementById('bSend'),bSkip=document.getElementById('bSkip');

    // Chips de giro → campo «vendes»
    var vp=document.getElementById('vendesPills'), vIn=document.getElementById('vendes'), picked=[];
    ORDEN.forEach(function(k){var g=GIROS[k],l=document.createElement('label');l.className='pill';l.innerHTML='<input type="checkbox" value="'+g.label+'"><span><span aria-hidden="true">'+g.emo+'</span> '+g.label+'</span>';vp.appendChild(l);
      l.querySelector('input').addEventListener('change',function(e){if(e.target.checked)picked.push(g.label);else picked=picked.filter(function(x){return x!==g.label;});});});
    // Chips de pago → campo «pagos»
    var pp=document.getElementById('pagosPills'),pIn=document.getElementById('pagos');
    ['Efectivo','Transferencia','Tarjeta','Depósito en OXXO','Meses sin intereses'].forEach(function(p){var l=document.createElement('label');l.className='pill';l.innerHTML='<input type="checkbox" value="'+p+'"><span>'+p+'</span>';pp.appendChild(l);
      l.querySelector('input').addEventListener('change',function(){pIn.value=[].map.call(pp.querySelectorAll('input:checked'),function(i){return i.value;}).join(', ');});});
    function vendesValue(){var extra=vIn.value.trim();return picked.concat(extra?[extra]:[]).join(', ');}

    // A118: tipo de negocio (obligatorio) y sub-giro de citas (opcional, solo con «citas»)
    var subBox=document.getElementById('subgiroBox'),subSel=document.getElementById('subgiro');
    function giroValue(){var g=form.querySelector('input[name=giro]:checked');return g?g.value:'';}
    // A134: marcas de obligatorio/opcional del paso 3 según el giro (lo mismo que exige /intake: requiredFor)
    var WHY3={"bazar": "Las formas de pago sí las necesitamos para prender tu asistente. Horario y entrega, si los llenas ahora, tu asistente sale más rápido; si no, te los preguntamos después.", "ropa": "Las formas de pago sí las necesitamos para prender tu asistente. Horario y entrega, si los llenas ahora, tu asistente sale más rápido; si no, te los preguntamos después.", "citas": "Horario, dónde atiendes y formas de pago los necesitamos para prender tu asistente. Lo demás, si lo llenas ahora, sale más rápido.", "comida": "Horario, dónde atiendes y formas de pago los necesitamos para prender tu asistente. Lo demás, si lo llenas ahora, sale más rápido.", "otro": "Horario, dónde atiendes y formas de pago los necesitamos para prender tu asistente. Lo demás, si lo llenas ahora, sale más rápido.", "creador": "Si eres creador, nada de esto es obligatorio: si lo llenas ahora, tu asistente sale más rápido; si no, te lo preguntamos después."};
    function reqMarks(){var g=giroValue();if(!g)return;form.querySelectorAll('[data-req]').forEach(function(s){s.textContent=s.dataset.req.split(' ').indexOf(g)>=0?"(obligatorio)":"(opcional)";});var w=document.getElementById('why3');if(w&&WHY3[g])w.textContent=WHY3[g];}
    form.querySelectorAll('input[name=giro]').forEach(function(r){r.addEventListener('change',reqMarks);});
    reqMarks();
    function giroLabel(){var g=form.querySelector('input[name=giro]:checked');return g?g.nextElementSibling.textContent.trim():'';}
    form.querySelectorAll('input[name=giro]').forEach(function(r){r.addEventListener('change',function(){var c=giroValue()==='citas';subBox.hidden=!c;if(!c)subSel.value='';document.getElementById('giros').setAttribute('aria-invalid','false');document.getElementById('e-giro').classList.remove('on');var same={ropa:'ropa',comida:'comida'}[giroValue()];if(same&&!picked.length){var chip=vp.querySelectorAll('input')[ORDEN.indexOf(same)];if(chip&&!chip.checked){chip.checked=true;chip.dispatchEvent(new Event('change'));}}});});
    // A124: ?giro=creador (u otro giro) preselecciona la tarjeta; el link de «Para creadores» lo hace sin recargar
    function pickGiro(v){var r=form.querySelector('input[name=giro][value="'+v+'"]');if(r&&!r.checked){r.checked=true;r.dispatchEvent(new Event('change'));}return !!r;}
    var giroQ=(new URLSearchParams(location.search).get('giro')||'').replace(/[^a-z]/g,'');if(giroQ)pickGiro(giroQ);
    document.querySelectorAll('a[data-giro]').forEach(function(a){a.addEventListener('click',function(e){if(!pickGiro(a.dataset.giro))return;e.preventDefault();try{history.replaceState(null,'','?giro='+a.dataset.giro+'#alta');}catch(_){}var al=document.getElementById('alta');al.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});var h=al.querySelector('h2');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}});});
    function setErr(name,on){var el=form.elements[name],e=document.getElementById('e-'+name);if(el&&el.setAttribute)el.setAttribute('aria-invalid',on?'true':'false');if(e)e.classList.toggle('on',!!on);}
    function validate(n){
      var bad=[];
      if(n===1){
        var nom=form.elements.nombre.value.trim(), wa=form.elements.whatsapp.value.replace(/\D/g,''), mail=form.elements.correo.value.trim();
        setErr('nombre',!nom); if(!nom)bad.push('nombre');
        setErr('whatsapp',wa.length<10); if(wa.length<10)bad.push('whatsapp');
        var mailBad=!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail); setErr('correo',mailBad); if(mailBad)bad.push('correo');
      }
      if(n===2){var neg=form.elements.negocio.value.trim();setErr('negocio',!neg);if(!neg)bad.push('negocio');var gi=giroValue();document.getElementById('giros').setAttribute('aria-invalid',gi?'false':'true');document.getElementById('e-giro').classList.toggle('on',!gi);if(!gi)bad.push('giro');}
      if(n===4){var c=form.elements.consent.checked;setErr('consent',!c);if(!c)bad.push('consent');}
      if(bad.length){var f=bad[0]==='giro'?form.querySelector('input[name=giro]'):form.elements[bad[0]];if(f&&f.focus)f.focus();return false;}
      return true;
    }
    function summary(){
      var rows=[['Nombre',form.elements.nombre.value],['WhatsApp',form.elements.whatsapp.value],['Correo',form.elements.correo.value||'Sin correo'],['Negocio',form.elements.negocio.value],['Tipo',giroLabel()+(subSel.value?' · '+subSel.options[subSel.selectedIndex].text:'')],['Vende',vendesValue()||'Sin especificar'],['Dónde',form.elements.donde.value]];
      document.getElementById('resumen').innerHTML=rows.map(function(r){return '<dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd>';}).join('')+'<dd><button type="button" class="skip" data-go="1">Corregir algo</button></dd>';
      document.querySelector('[data-go]').addEventListener('click',function(){go(1);});
    }
    function go(n,noFocus){
      step=n;
      // A199: lo que escribió en el demo (nombre del negocio y productos) llega al alta si esos campos siguen vacíos
      if(n===2&&window.__nbDemo){var dm=window.__nbDemo,fn=form.elements.negocio,fv=form.elements.vendes;if(fn&&!fn.value.trim()&&String(dm.name||'').trim())fn.value=String(dm.name).trim().slice(0,80);if(fv&&!fv.value.trim()&&String(dm.prods||'').trim())fv.value=String(dm.prods).trim().slice(0,160);}
      steps.forEach(function(s){s.hidden=+s.dataset.step!==n;});
      document.getElementById('pLabel').textContent='Paso '+n+' de 4: '+NAMES[n];
      document.getElementById('pLeft').textContent=n===4?'¡Último!':'Faltan '+(4-n);
      document.getElementById('pBar').style.width=(n*25)+'%';
      bBack.hidden=n===1; bNext.hidden=n===4; bSend.hidden=n!==4; bSkip.hidden=n!==3;
      if(n===4)summary();
      if(!noFocus){var h=steps[n-1].querySelector('h3');h.focus({preventScroll:true});document.getElementById('wiz').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});}
    }
    bNext.addEventListener('click',function(){if(validate(step))go(step+1);});
    bBack.addEventListener('click',function(){go(step-1);});
    bSkip.addEventListener('click',function(){go(4);});
    form.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.tagName==='INPUT'&&step<4){e.preventDefault();bNext.click();}});

    function collect(){
      var data={};
      Array.prototype.forEach.call(form.elements,function(el){
        if(!el.name||el.name==='')return;
        if(el.type==='radio'){if(el.checked)data[el.name]=el.value;return;}
        if(el.type==='checkbox'){if(el.name==='consent')data.consent=el.checked?'on':'';return;}
        data[el.name]=el.value;
      });
      data.vendes=vendesValue();
      return data;
    }
    function escMail(v){return String(v||'').replace(/[&<>"']/g,function(c){return '&#'+c.charCodeAt(0)+';';});}
    // B-B3: correo mal escrito → regresa al paso 1 con todo lleno; el reenvío usa el mismo altaId.
    /* A280: «Reenviar el correo» reusa /mi/link-nuevo (misma respuesta exista o no, tope por IP y por cliente); el botón se apaga 60 s. */
    document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-resend-mail]');if(!b||b.disabled||!SD_ENDPOINT)return;var m=document.getElementById('resendMsg');b.disabled=true;if(m)m.textContent='Enviando…';fetch(SD_ENDPOINT+'/mi/link-nuevo?lang=es',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({correo:b.getAttribute('data-resend-mail')})}).then(function(r){if(m)m.textContent=r.ok?'Listo: si ese correo tiene un alta, te mandamos otro con tu link a Mi asistente. Revisa spam o promociones.':'No se pudo enviar ahora. Intenta en unos minutos.';}).catch(function(){if(m)m.textContent='No se pudo enviar ahora. Intenta en unos minutos.';}).then(function(){setTimeout(function(){b.disabled=false;},60000);});});
    document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-fix-mail]');if(!b)return;document.getElementById('ok').hidden=true;form.hidden=false;document.getElementById('wizHead').hidden=false;go(1,true);var f=form.elements.correo;if(f){f.focus();f.select();}});
    function done(html){
      form.hidden=true;document.getElementById('wizHead').hidden=true;document.getElementById('missing').classList.remove('on');
      var ok=document.getElementById('ok');ok.innerHTML=html;ok.hidden=false;ok.focus();
    }
    function mailto(d){
      var labels={nombre:'Nombre',whatsapp:'WhatsApp',correo:'Correo',negocio:'Negocio',giro:'Giro',subgiro:'Giro (citas)',vendes:'Qué vende',donde:'Dónde vende',mensajes:'Mensajes al día',horario:'Horario',entrega:'Entrega',pagos:'Pagos',faq:'Preguntas frecuentes',agenda:'Agenda',plan:'Plan'};
      var lines=['ALTA ¿SIGUE DISPONIBLE?',''];
      if(altaId)lines.push('Alta: '+altaId,'');
      if(refCode)lines.push('Recomendado por: '+refCode,'');
      Object.keys(labels).forEach(function(k){lines.push(labels[k]+': '+(d[k]||'-'));});
      lines.push('','Consentimiento: sí');
      window.location.href='mailto:hola@neuri.tech?subject='+encodeURIComponent('Alta neuri.bots - '+d.negocio)+'&body='+encodeURIComponent(lines.join('\n'));
      done('<p class="big">Ya casi: se abrió tu correo con tu alta lista.</p><p>Solo dale <b>enviar</b>. Te escribimos en menos de 24 horas.</p><p style="margin-top:10px;color:var(--gris);font-size:15px">¿No se abrió tu correo? Escríbenos a <a href="mailto:hola@neuri.tech">hola@neuri.tech</a> con tu nombre y tu WhatsApp.</p>');
    }
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(step!==4){bNext.click();return;}
      if(!validate(4))return;
      if(form.elements.website.value)return; // honeypot
      var d=collect();
      if(!SD_ENDPOINT)return mailto(d);
      if(altaId)d.id=altaId;
      if(refCode)d.ref=refCode;
      if(srcCode)d.origen=srcCode;
      bSend.disabled=true;bSend.textContent='Revisando tu alta…';
      fetch(SD_ENDPOINT+'/intake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)})
        .then(function(r){if(r.status===429)return r.json().then(function(b){throw {limit:b.message};});if(!r.ok)throw new Error();return r.json();})
        .then(function(r){
          // B-B4: correo ya registrado → no se duplica; le llega su link de Mi asistente.
          if(r.existing){done('<p class="big">Ese correo ya tiene un asistente.</p><p>Te acabamos de mandar a ese correo tu link a Mi asistente: ábrelo para entrar. Si en unos minutos no lo ves, revisa spam o promociones.</p><p><a class="btn" href="'+SD_ENDPOINT+'/entrar">Entrar a Mi asistente</a></p><p style="color:var(--gris);font-size:15px">¿Es otro negocio? Usa otro correo para darlo de alta.</p>');return;}
          if(r.id)altaId=r.id;
          var miss=document.getElementById('missing');
          if(r.missing&&r.missing.length){
            var first=4;r.missing.forEach(function(m){var k=FIELD_OF[m]||m;if(STEP_OF[k]&&STEP_OF[k]<first)first=STEP_OF[k];setErr(k,true);});
            miss.textContent='Casi listo. Para que tu asistente conteste bien nos falta: '+r.missing.map(function(k){return LABEL[k]||k;}).join(', ')+'. Te llevamos a ese paso.';
            miss.classList.add('on');
            go(first);
          } else {
            // A228: evento sin datos personales: origen del alta y si Meta estaba abierto.
            if(window.nTrack)window.nTrack('alta_recibida',{origen:srcCode||'directo',meta:r.connect==='open'?'open':'closed',product:'bots'});
            done(r.connect==='open'&&r.connectUrl?'<p class="big">¡Listo! Tu alta quedó completa.</p><p>Falta un solo paso: conectar tu Instagram o tu página de Facebook, con un clic y sin instalar otras apps.</p><p><a class="btn" href="'+r.connectUrl.replace(/"/g,'&quot;')+'">Conectar mi Instagram ahora</a></p><p style="color:var(--gris);font-size:15px">También te mandamos este link por correo (dura unos días). Tu asistente no le contesta a nadie hasta que tú lo pruebes y lo prendas.</p>':'<p class="big">¡Listo! Tu alta quedó completa.</p><p id="okMail">Te acabamos de mandar un correo «Recibimos tu alta» a <b>'+escMail(d.correo)+'</b>. Si en unos minutos no lo ves, revisa spam o promociones.</p><p><button type="button" class="btn ghost" data-fix-mail>¿Lo escribiste mal? Corregir mi correo</button> <button type="button" class="btn ghost" data-resend-mail="'+escMail(d.correo)+'">Reenviar el correo</button></p><p id="resendMsg" role="status" aria-live="polite"></p><p>Esto sigue:</p><ol><li>Revisa tu correo: te avisamos en cuanto la conexión directa con Meta esté abierta y te llega el link para conectar tu Instagram o tu página de Facebook (sin instalar otras apps). Mientras, armamos tu asistente.</li><li>Al conectarlo te llega otro correo para probarlo tú: no le contesta a nadie hasta que tú lo prendas.</li><li>Cuando lo prendas te llega tu link a Mi asistente para pausarlo o cambiar tus datos.</li></ol><p>¿Quieres verlo ya? Mientras, prueba cómo contesta en el demo de esta página.</p><p><a class="btn ghost" href="#demo">Probar el demo</a></p>');
          }
        })
        .catch(function(e){
          // A48: demasiadas altas (429): el mensaje del servidor y la opción de mandarla por correo; el formulario sigue lleno.
          if(e&&e.limit){var miss=document.getElementById('missing');miss.textContent=e.limit+' ';var b=document.createElement('button');b.type='button';b.className='btn ghost';b.style.marginTop='10px';b.textContent='Mandar mi alta por correo';b.addEventListener('click',function(){mailto(d);});miss.appendChild(b);miss.classList.add('on');miss.scrollIntoView({block:'center'});return;}
          mailto(d);
        })
        .then(function(){bSend.disabled=false;bSend.textContent='Pedir mi asistente';});
    });

    if(altaId){document.getElementById('resumeNote').hidden=false;window.addEventListener('load',function(){document.getElementById('alta').scrollIntoView();});}
    go(1,true);
  })();
// A153: el aviso de Meta se actualiza solo con /estado del servidor (sin datos de clientes).
(function(){if(!SD_ENDPOINT)return;fetch(SD_ENDPOINT+'/estado').then(function(r){return r.ok?r.json():null;}).then(function(e){if(!e||e.meta!=='open')return;document.querySelectorAll('[data-meta-note]').forEach(function(el){el.textContent=el.getAttribute('data-open');});}).catch(function(){});})();
// A60: copiar la URL del conector
(function(){var b=document.getElementById('iaCopy'),o=document.getElementById('iaOk'),u=document.getElementById('iaUrl');if(!b)return;
function sel(){try{var r=document.createRange();r.selectNodeContents(u);var s=getSelection();s.removeAllRanges();s.addRange(r);}catch(e){}}
b.addEventListener('click',function(){var t=u.textContent.trim();o.textContent='';
var done=function(){o.textContent='¡Copiada! Pégala en tu asistente de IA.';},bad=function(){sel();o.textContent='No se pudo copiar: selecciona la URL y cópiala a mano.';};
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,bad);}else{bad();}});})();
