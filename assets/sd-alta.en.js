// A286: sacado de en/still-available/index.html para que el navegador lo compile aparte y lo guarde en caché.
  // Same intake webhook as the Spanish page. Put its URL here once deployed; until then, sign-ups go by email.
  var SD_ENDPOINT = 'https://sd.neuri.tech';

  /* ---------- Sample data by category (demo, examples and sign-up) ---------- */
  var GIROS = {
    muebles:{label:'Furniture',emo:'🪑',neg:'Sample Furniture',item:'Oak dining table for 6',price:350,
      detQ:'What are the dimensions?',topic:'the dimensions',det:'Solid oak and in very good condition. It\'s 63 in long, 35 in wide and 30 in tall.',
      min:300,offer:320,cond:'if you pick it up this week',
      env:'Yes, we deliver in the East Valley (Mesa, Gilbert, Chandler, Tempe) for $40. Phoenix or the West Valley, I can get you a quote.',pago:'Cash, Venmo, Zelle or card at pickup.',
      donde:'We\'re in Mesa, near Main St & Dobson. I\'ll send the exact address once it\'s on hold 📍',hora:'Monday to Saturday, 10 am to 7 pm.',
      hard:'Can you stain it walnut?',a:'it',
      caso:{quien:'A used-furniture seller in Mesa',prob:'Lists 15 pieces on its Facebook Page and gets dozens of “Is this still available?” and “Lowest price?” messages, mostly at night.',hace:'Answers price and dimensions from the sheet, negotiates only as far as the owner allows without revealing the floor price, and books a time to come see the piece (Pro).'}},
    ropa:{label:'Clothing',emo:'👗',neg:'Sample Closet',item:'Denim jacket, size M',price:35,
      detQ:'What are the measurements?',topic:'the measurements',det:'Worn twice, no flaws. Size M: 21 in across the chest and 25 in long.',
      min:28,offer:30,cond:'if you pick it up today',
      env:'We ship anywhere in the US for $8, or it\'s free porch pickup in Gilbert.',pago:'Venmo, Zelle or PayPal. Cash for pickup.',
      donde:'Porch pickup in Gilbert, near Val Vista & Williams Field 📍',hora:'Pickups Monday to Friday, 5 to 8 pm.',
      hard:'Do you have it in size L?',a:'it',
      caso:{quien:'A clothing reseller on Instagram',prob:'Posts one-of-a-kind pieces, and every story brings 30 messages asking “What size?” and “How much is shipping?”.',hace:'Answers size, measurements and shipping, holds the piece for whoever asks first and tells her who\'s holding it.'}},
    electronicos:{label:'Electronics',emo:'📺',neg:'Sample Electronics',item:'55" 4K TV',price:300,
      detQ:'What condition is it in?',topic:'the condition',det:'Works perfectly, 2 years old, and comes with the remote and stand. No scratches on the screen.',
      min:260,offer:275,cond:'if you pay cash',
      env:'We can deliver in Tempe and Mesa for $25. We don\'t ship.',pago:'Cash or Zelle.',
      donde:'We\'re in Tempe, near Southern & McClintock. I\'ll send the address once it\'s on hold 📍',hora:'Monday to Saturday, 11 am to 8 pm.',
      hard:'Does it have a warranty?',a:'it',
      caso:{quien:'A TV and phone reseller',prob:'Gets the same questions about every item: condition, what it comes with, whether he takes trades, plus lowball offers.',hace:'Answers condition and accessories from the sheet, offers the price he allows and passes trades and warranty questions to him.'}},
    llantas:{label:'Tires & parts',emo:'🛞',neg:'Sample Tire Shop',item:'Set of 4 tires 205/55R16',price:280,
      detQ:'How much tread is left?',topic:'the tread',det:'About 70% tread left. All four match, size 205/55R16.',
      min:240,offer:260,cond:'if you take all four today',
      env:'No delivery; pickup at the shop.',pago:'Cash or Zelle.',
      donde:'The shop is on Main St in west Mesa 📍',hora:'Monday to Saturday, 8 am to 6 pm.',
      hard:'Will they fit a 2015 Jetta?',a:'them',
      caso:{quien:'A shop that sells used tires',prob:'All day people ask “What size?” and “How much tread?” while his hands are full.',hace:'Answers size, tread and price per set, books a time to swing by the shop (Pro) and passes fitment questions to him.'}},
    bebe:{label:'Baby & kids',emo:'🧸',neg:'Sample Baby Gear',item:'Folding stroller',price:90,
      detQ:'What condition is it in?',topic:'the condition',det:'Like new: used 6 months, folds with one hand and comes with a rain cover.',
      min:75,offer:80,cond:'if you pick it up this week',
      env:'Delivery in Chandler for $10.',pago:'Cash, Venmo or Zelle.',
      donde:'We\'re in Chandler, near Ray & Alma School 📍',hora:'Every day, 9 am to 7 pm.',
      hard:'Is it OK for a newborn?',a:'it',
      caso:{quien:'A mom selling what the kids outgrew',prob:'She sells at night after the kids are asleep, and the day\'s messages pile up.',hace:'Answers condition and price at any hour, holds the item and books the handoff in the window she set (Pro).'}},
    electrodomesticos:{label:'Appliances',emo:'🧊',neg:'Sample Appliances',item:'18 cu ft refrigerator',price:450,
      detQ:'Does it work well?',topic:'how it works',det:'Works perfectly and keeps cold, 3 years old. It\'s 66 in tall.',
      min:390,offer:420,cond:'if you haul it yourself',
      env:'Delivery in the East Valley for $50.',pago:'Cash, Zelle or card.',
      donde:'We\'re in Mesa, near Country Club & Broadway 📍',hora:'Monday to Saturday, 9 am to 7 pm.',
      hard:'Will you take my old fridge as a trade-in?',a:'it',
      caso:{quien:'A refurbished appliance seller',prob:'Every fridge brings the same questions: size, does it keep cold, do you deliver and how much.',hace:'Answers size and condition, quotes delivery at his rate and books the drop-off (Pro). Trade-in requests go to him.'}},
    plantas:{label:'Plants',emo:'🪴',neg:'Sample Plant Nursery',item:'Large monstera in a pot',price:45,
      detQ:'How big is it?',topic:'the size',det:'About 4 ft tall, in a 12-inch clay pot.',
      min:38,offer:40,cond:'if you take two',
      env:'Delivery in Phoenix for $10.',pago:'Cash or Venmo.',
      donde:'We\'re in central Phoenix, near 7th St & Camelback 📍',hora:'Tuesday to Sunday, 8 am to 5 pm.',
      hard:'Can it take direct Arizona sun?',a:'it',
      caso:{quien:'A small plant nursery',prob:'While watering, people ask prices and sizes for every plant, and the messages go cold.',hace:'Answers size, pot and price, holds plants for the weekend and passes care questions to the owner.'}},
    comida:{label:'Cakes & baked goods',emo:'🎂',neg:'Sample Bakery',item:'Tres leches cake for 20',price:65,
      detQ:'What flavors do you have?',topic:'the flavors',det:'Vanilla, chocolate or strawberry. Serves 20; order 2 days ahead.',
      min:65,offer:0,cond:'',
      env:'Delivery in Gilbert for $10, or you can pick it up.',pago:'50% deposit by Venmo or Zelle, the rest at pickup.',
      donde:'We deliver in Gilbert. Pickup near downtown Gilbert 📍',hora:'Orders Monday to Saturday, 9 am to 6 pm.',
      hard:'Can you make it sugar-free?',a:'it',
      caso:{quien:'A home baker who sells custom orders',prob:'Loses orders because she can\'t answer flavors, prices and dates while she\'s baking.',hace:'Answers flavors and prices, takes the order for an open date (Pro) and tells her who ordered what and for when.'}}
  };
  var ORDEN = ['muebles','ropa','electronicos','llantas','bebe','electrodomesticos','plantas','comida'];
  function money(n){return '$'+Math.round(n).toLocaleString('en-US');}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Plans: preselect in the sign-up ---------- */
  document.querySelectorAll('[data-plan]').forEach(function(a){a.addEventListener('click',function(){var r=document.querySelector('input[name=plan][value="'+a.dataset.plan+'"]');if(r)r.checked=true;});});

  /* ---------- Sign-up: 4-step wizard ---------- */
  var form = document.getElementById('f');
  // Coming from the reminder email (?alta=…): complete the same sign-up instead of creating a new one.
  var altaId = (new URLSearchParams(location.search).get('alta') || '').slice(0, 64);
  // Link de referido (?ref=…): se guarda para acreditar el mes gratis a los dos.
  var refCode = (new URLSearchParams(location.search).get('ref') || '').replace(/[^a-z0-9]/gi, '').slice(0, 16);
  var srcCode = (new URLSearchParams(location.search).get('src') || new URLSearchParams(location.search).get('utm_source') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
  (function(){
    var NAMES={1:'About you',2:'Your business',3:'How you handle buyers',4:'Your plan'};
    // /intake regresa lo que falta con nombre para personas («Formas de pago»): se traduce al campo para llevarla a ese paso
    var FIELD_OF={'Nombre del negocio':'negocio','Business name':'negocio','Horario de atención':'horario','Business hours':'horario','Dónde se recoge o se ve la pieza':'entrega','Where buyers pick up or see the item':'entrega','Formas de pago':'pagos','Payment methods':'pagos'};
    var STEP_OF={nombre:1,whatsapp:1,correo:1,negocio:2,giro:2,subgiro:2,vendes:2,donde:2,mensajes:2,horario:3,entrega:3,pagos:3,agenda:3,faq:4,plan:4,consent:4};
    var LABEL={nombre:'your name',whatsapp:'your mobile number',correo:'your email',negocio:'your business name',vendes:'what you sell',donde:'where you sell',mensajes:'how many messages you get',horario:'your hours',entrega:'how pickup or delivery works',pagos:'your payment methods',agenda:'whether it should book pickups',faq:'your common questions',plan:'your plan',consent:'your OK to use this information'};
    var step=1, steps=form.querySelectorAll('.paso');
    var bBack=document.getElementById('bBack'),bNext=document.getElementById('bNext'),bSend=document.getElementById('bSend'),bSkip=document.getElementById('bSkip');

    // Category chips → "vendes" field
    var vp=document.getElementById('vendesPills'), vIn=document.getElementById('vendes'), picked=[];
    ORDEN.forEach(function(k){var g=GIROS[k],l=document.createElement('label');l.className='pill';l.innerHTML='<input type="checkbox" value="'+esc(g.label)+'"><span><span aria-hidden="true">'+g.emo+'</span> '+esc(g.label)+'</span>';vp.appendChild(l);
      l.querySelector('input').addEventListener('change',function(e){if(e.target.checked)picked.push(g.label);else picked=picked.filter(function(x){return x!==g.label;});});});
    // Payment chips → "pagos" field
    var pp=document.getElementById('pagosPills'),pIn=document.getElementById('pagos');
    ['Cash','Venmo','Zelle','Cash App','PayPal','Card'].forEach(function(p){var l=document.createElement('label');l.className='pill';l.innerHTML='<input type="checkbox" value="'+p+'"><span>'+p+'</span>';pp.appendChild(l);
      l.querySelector('input').addEventListener('change',function(){pIn.value=[].map.call(pp.querySelectorAll('input:checked'),function(i){return i.value;}).join(', ');});});
    function vendesValue(){var extra=vIn.value.trim();return picked.concat(extra?[extra]:[]).join(', ');}

    // A118: tipo de negocio (obligatorio) y sub-giro de citas (opcional, solo con «citas»)
    var subBox=document.getElementById('subgiroBox'),subSel=document.getElementById('subgiro');
    function giroValue(){var g=form.querySelector('input[name=giro]:checked');return g?g.value:'';}
    // A134: marcas de obligatorio/opcional del paso 3 según el giro (lo mismo que exige /intake: requiredFor)
    var WHY3={"bazar": "We do need your payment methods to turn your assistant on. Hours and pickup: fill them in now and your assistant is ready sooner; otherwise we'll ask you later.", "ropa": "We do need your payment methods to turn your assistant on. Hours and pickup: fill them in now and your assistant is ready sooner; otherwise we'll ask you later.", "citas": "We need your hours, where you see clients and your payment methods to turn your assistant on. The rest: fill it in now and it's ready sooner.", "comida": "We need your hours, where you see clients and your payment methods to turn your assistant on. The rest: fill it in now and it's ready sooner.", "otro": "We need your hours, where you see clients and your payment methods to turn your assistant on. The rest: fill it in now and it's ready sooner.", "creador": "If you're a creator, none of this is required: fill it in now and your assistant is ready sooner; otherwise we'll ask you later."};
    function reqMarks(){var g=giroValue();if(!g)return;form.querySelectorAll('[data-req]').forEach(function(s){s.textContent=s.dataset.req.split(' ').indexOf(g)>=0?"(needed to turn it on)":"(optional)";});var w=document.getElementById('why3');if(w&&WHY3[g])w.textContent=WHY3[g];}
    form.querySelectorAll('input[name=giro]').forEach(function(r){r.addEventListener('change',reqMarks);});
    reqMarks();
    function giroLabel(){var g=form.querySelector('input[name=giro]:checked');return g?g.nextElementSibling.textContent.trim():'';}
    form.querySelectorAll('input[name=giro]').forEach(function(r){r.addEventListener('change',function(){var c=giroValue()==='citas';subBox.hidden=!c;if(!c)subSel.value='';document.getElementById('giros').setAttribute('aria-invalid','false');document.getElementById('e-giro').classList.remove('on');var same={ropa:'ropa',comida:'comida'}[giroValue()];if(same&&!picked.length){var chip=vp.querySelectorAll('input')[ORDEN.indexOf(same)];if(chip&&!chip.checked){chip.checked=true;chip.dispatchEvent(new Event('change'));}}});});
    // A124: ?giro=creador (u otro giro) preselecciona la tarjeta; el link de «Para creadores» lo hace sin recargar
    function pickGiro(v){var r=form.querySelector('input[name=giro][value="'+v+'"]');if(r&&!r.checked){r.checked=true;r.dispatchEvent(new Event('change'));}return !!r;}
    var giroQ=(new URLSearchParams(location.search).get('giro')||'').replace(/[^a-z]/g,'');if(giroQ)pickGiro(giroQ);
    document.querySelectorAll('a[data-giro]').forEach(function(a){a.addEventListener('click',function(e){if(!pickGiro(a.dataset.giro))return;e.preventDefault();try{history.replaceState(null,'','?giro='+a.dataset.giro+'#signup');}catch(_){}var al=document.getElementById('signup');al.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});var h=al.querySelector('h2');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}});});
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
      var rows=[['Name',form.elements.nombre.value],['Mobile',form.elements.whatsapp.value],['Email',form.elements.correo.value||'No email'],['Business',form.elements.negocio.value],['Type',giroLabel()+(subSel.value?' · '+subSel.options[subSel.selectedIndex].text:'')],['Sells',vendesValue()||'Not specified'],['Sells on',(form.querySelector('input[name=donde]:checked')||{}).nextElementSibling.textContent]];
      document.getElementById('resumen').innerHTML=rows.map(function(r){return '<dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd>';}).join('')+'<dd><button type="button" class="skip" data-go="1">Edit something</button></dd>';
      document.querySelector('[data-go]').addEventListener('click',function(){go(1);});
    }
    function go(n,noFocus){
      step=n;
      // A199: lo que escribió en el demo (nombre del negocio y productos) llega al alta si esos campos siguen vacíos
      if(n===2&&window.__nbDemo){var dm=window.__nbDemo,fn=form.elements.negocio,fv=form.elements.vendes;if(fn&&!fn.value.trim()&&String(dm.name||'').trim())fn.value=String(dm.name).trim().slice(0,80);if(fv&&!fv.value.trim()&&String(dm.prods||'').trim())fv.value=String(dm.prods).trim().slice(0,160);}
      steps.forEach(function(s){s.hidden=+s.dataset.step!==n;});
      document.getElementById('pLabel').textContent='Step '+n+' of 4: '+NAMES[n];
      document.getElementById('pLeft').textContent=n===4?'Last one!':(4-n)+' to go';
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
    document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-resend-mail]');if(!b||b.disabled||!SD_ENDPOINT)return;var m=document.getElementById('resendMsg');b.disabled=true;if(m)m.textContent='Sending…';fetch(SD_ENDPOINT+'/mi/link-nuevo?lang=en',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({correo:b.getAttribute('data-resend-mail')})}).then(function(r){if(m)m.textContent=r.ok?'Done: if that email has a sign-up, we sent another one with your My assistant link. Check spam or promotions.':'Couldn\'t send it right now. Try again in a few minutes.';}).catch(function(){if(m)m.textContent='Couldn\'t send it right now. Try again in a few minutes.';}).then(function(){setTimeout(function(){b.disabled=false;},60000);});});
    document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-fix-mail]');if(!b)return;document.getElementById('ok').hidden=true;form.hidden=false;document.getElementById('wizHead').hidden=false;go(1,true);var f=form.elements.correo;if(f){f.focus();f.select();}});
    function done(html){
      form.hidden=true;document.getElementById('wizHead').hidden=true;document.getElementById('missing').classList.remove('on');
      var ok=document.getElementById('ok');ok.innerHTML=html;ok.hidden=false;ok.focus();
    }
    function mailto(d){
      var labels={nombre:'Name',whatsapp:'Mobile',correo:'Email',negocio:'Business',giro:'Business type',subgiro:'Business type (citas)',vendes:'Sells',donde:'Sells on',mensajes:'Messages per day',horario:'Hours',entrega:'Pickup/delivery',pagos:'Payments',faq:'Common questions',agenda:'Booking',plan:'Plan'};
      var lines=['SIGN-UP STILL AVAILABLE? (EN)',''];
      if(altaId)lines.push('Sign-up ID: '+altaId,'');
      if(refCode)lines.push('Referred by: '+refCode,'');
      Object.keys(labels).forEach(function(k){lines.push(labels[k]+': '+(d[k]||'-'));});
      lines.push('','Language: en','Consent: yes');
      window.location.href='mailto:hola@neuri.tech?subject='+encodeURIComponent('Sign-up neuri.bots - '+d.negocio)+'&body='+encodeURIComponent(lines.join('\n'));
      done('<p class="big">Almost there: your email app opened with your sign-up ready.</p><p>Just hit <b>send</b>. We\'ll text you within 24 hours.</p><p style="margin-top:10px;color:var(--gris);font-size:15px">Email app didn\'t open? Write to us at <a href="mailto:hola@neuri.tech">hola@neuri.tech</a> with your name and mobile number.</p>');
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
      bSend.disabled=true;bSend.textContent='Checking your sign-up…';
      fetch(SD_ENDPOINT+'/intake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)})
        .then(function(r){if(r.status===429)return r.json().then(function(b){throw {limit:b.message};});if(!r.ok)throw new Error();return r.json();})
        .then(function(r){
          // B-B4: correo ya registrado → no se duplica; le llega su link de Mi asistente.
          if(r.existing){done('<p class="big">That email already has an assistant.</p><p>We just sent your link to My assistant to that email: open it to sign in. If you don\'t see it in a few minutes, check spam or promotions.</p><p><a class="btn" href="'+SD_ENDPOINT+'/entrar?lang=en">Sign in to My assistant</a></p><p style="color:var(--gris);font-size:15px">A different business? Use a different email to sign it up.</p>');return;}
          if(r.id)altaId=r.id;
          var miss=document.getElementById('missing');
          if(r.missing&&r.missing.length){
            var first=4;r.missing.forEach(function(m){var k=FIELD_OF[m]||m;if(STEP_OF[k]&&STEP_OF[k]<first)first=STEP_OF[k];setErr(k,true);});
            miss.textContent='Almost done. So your assistant answers well, we still need: '+r.missing.map(function(k){return LABEL[k]||k;}).join(', ')+'. We\'ll take you to that step.';
            miss.classList.add('on');
            go(first);
          } else {
            // A228: evento sin datos personales: origen del alta y si Meta estaba abierto.
            if(window.nTrack)window.nTrack('alta_recibida',{origen:srcCode||'directo',meta:r.connect==='open'?'open':'closed',product:'bots'});
            done(r.connect==='open'&&r.connectUrl?'<p class="big">All set! Your sign-up is complete.</p><p>One step left: connect your Instagram or Facebook Page, in one click with no other apps to install.</p><p><a class="btn" href="'+r.connectUrl.replace(/"/g,'&quot;')+'">Connect my Instagram now</a></p><p style="color:var(--gris);font-size:15px">We also emailed you this link (it lasts a few days). Your assistant doesn\'t answer anyone until you test it and turn it on.</p>':'<p class="big">All set! Your sign-up is complete.</p><p id="okMail">We just emailed «We got your sign-up» to <b>'+escMail(d.correo)+'</b>. If it is not there in a few minutes, check spam or promotions.</p><p><button type="button" class="btn ghost" data-fix-mail>Typo? Fix my email</button> <button type="button" class="btn ghost" data-resend-mail="'+escMail(d.correo)+'">Resend the email</button></p><p id="resendMsg" role="status" aria-live="polite"></p><p>What happens next:</p><ol><li>Check your email: we\'ll let you know as soon as the direct connection with Meta opens and send you the link to connect your Instagram or Facebook Page (no other apps to install). Meanwhile, we build your assistant.</li><li>Once it\'s connected, we email you a link to test it yourself: it doesn\'t answer anyone until you turn it on.</li><li>When you turn it on, you get your My assistant link to pause it or update your details.</li></ol><p>Want to see it now? Meanwhile, try how it replies in the demo on this page.</p><p><a class="btn ghost" href="#demo">Try the demo</a></p>');
          }
        })
        .catch(function(e){
          // A48: demasiadas altas (429): el mensaje del servidor y la opción de mandarla por correo; el formulario sigue lleno.
          if(e&&e.limit){var miss=document.getElementById('missing');miss.textContent=e.limit+' ';var b=document.createElement('button');b.type='button';b.className='btn ghost';b.style.marginTop='10px';b.textContent='Send my sign-up by email';b.addEventListener('click',function(){mailto(d);});miss.appendChild(b);miss.classList.add('on');miss.scrollIntoView({block:'center'});return;}
          // B-M2: sin red no abrimos el correo (tampoco saldría): lo decimos, el formulario sigue lleno y avisamos al volver la red.
          if(navigator.onLine===false){var mo=document.getElementById('missing');mo.textContent='No internet connection. Your sign-up is still here, nothing was lost: when you are back online tap «Get my assistant» again.';mo.setAttribute('data-offline','1');mo.classList.add('on');mo.scrollIntoView({block:'center'});window.addEventListener('online',function(){mo.textContent='You are back online: tap «Get my assistant» to send your sign-up.';},{once:true});return;}
          mailto(d);
        })
        .then(function(){bSend.disabled=false;bSend.textContent='Get my assistant';});
    });

    if(altaId){document.getElementById('resumeNote').hidden=false;window.addEventListener('load',function(){document.getElementById('signup').scrollIntoView();});}
    go(1,true);
  })();
// A153: el aviso de Meta se actualiza solo con /estado del servidor (sin datos de clientes).
(function(){if(!SD_ENDPOINT)return;fetch(SD_ENDPOINT+'/estado').then(function(r){return r.ok?r.json():null;}).then(function(e){if(!e||e.meta!=='open')return;document.querySelectorAll('[data-meta-note]').forEach(function(el){el.textContent=el.getAttribute('data-open');});}).catch(function(){});})();
// A60: copiar la URL del conector
(function(){var b=document.getElementById('iaCopy'),o=document.getElementById('iaOk'),u=document.getElementById('iaUrl');if(!b)return;
function sel(){try{var r=document.createRange();r.selectNodeContents(u);var s=getSelection();s.removeAllRanges();s.addRange(r);}catch(e){}}
b.addEventListener('click',function(){var t=u.textContent.trim();o.textContent='';
var done=function(){o.textContent='Copied! Paste it into your AI assistant.';},bad=function(){sel();o.textContent="Couldn't copy: select the URL and copy it by hand.";};
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,bad);}else{bad();}});})();
