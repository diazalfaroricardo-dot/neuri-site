// A286: sacado de sigue-disponible/index.html para que el navegador lo compile aparte y lo guarde en caché.

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      biz: 0, tone: 0, ch: 'ig', name: 'Tienda de Mariana', nameEdited: false, prods: '',
      skills: { precio: true, horario: true, apartar: true, pago: false },
      phase: 'setup', bChecks: 0, msgs: [], typing: false, draft: '',
      lcMsgs: 30, lcLate: 40, lcClose: 20, lcTicket: 600, lostAnim: 0,
      ownFilter: 'all', ownSel: 1, ownNew: false,
      scen: 'bazar', sStep: 0, sProg: 0
    };
    // A200: demo precargado por link (?negocio=…&productos=… o ?business=…&products=…) para mandárselo al dueño tras la visita
    try {
      var qp = new URLSearchParams(location.search);
      var qn = (qp.get('negocio') || qp.get('business') || '').trim().slice(0, 36);
      var qr = (qp.get('productos') || qp.get('products') || '').trim().slice(0, 160);
      if (qn) { this.state.name = qn; this.state.nameEdited = true; }
      if (qr) this.state.prods = qr;
      if (qn || qr) window.__nbDemo = { name: qn, prods: qr }; if (qr) this.prefilled = true;
    } catch (e) {}
    this.lostAnimTimer = null;
    this.ownRowsDef = [
      { id: 'sofia', name: 'Sofía L.', ini: 'SL', avatar: '#F7B48C', when: 'ahora', kind: 'apart', status: 'Apartó · hoy 6 pm',
        msgs: [['c', '¿Sigue disponible la mesa de centro?'], ['b', 'Sí, sigue disponible. Cuesta $950 y entrego en Col. Centro de 5 a 8 pm.'], ['c', 'Me la apartas para hoy a las 6?'], ['b', 'Listo, te la aparto hoy a las 6 pm. Te mando la ubicación.']], tags: ['Interesada', 'Apartó'] },
      { id: 'juan', name: 'Juan Pérez', ini: 'JP', avatar: '#8FE0B4', when: '11:52 pm', kind: 'apart', status: 'Apartó · mañana 5 pm',
        msgs: [['c', '¿Sigue disponible el ropero?'], ['b', 'Sí, sigue disponible. Cuesta $1,800 y entrego de lunes a sábado de 5 a 8 pm.'], ['c', 'Va, apártamelo para mañana.'], ['b', 'Te lo aparto mañana a las 5 pm sin anticipo.']], tags: ['Apartó'] },
      { id: 'carla', name: 'Carla M.', ini: 'CM', avatar: '#C9D6F5', when: '10:31 pm', kind: 'hand', status: 'Te la pasó',
        msgs: [['c', '¿Cuánto el ropero?'], ['b', 'Cuesta $1,800 y sigue disponible.'], ['c', '¿Me lo dejas en $1,200?'], ['b', 'Esa se la paso a Mariana y te contesta en un momento.']], tags: ['Interesada', 'Regateo'] },
      { id: 'luis', name: 'Luis R.', ini: 'LR', avatar: '#E3EFE7', when: '9:14 pm', kind: 'done', status: 'Contestada',
        msgs: [['c', '¿Aceptas transferencia?'], ['b', 'Sí, acepto efectivo y transferencia. Por ahora solo entrego en persona.']], tags: ['Interesado'] },
      { id: 'ana', name: 'Ana G.', ini: 'AG', avatar: '#F5D9E8', when: '8:40 pm', kind: 'hand', status: 'Te la pasó',
        msgs: [['c', '¿Me lo mandas a Monterrey por paquetería?'], ['b', 'Esa se la paso a Mariana y te contesta en un momento.']], tags: ['Envío fuera'] },
      { id: 'pedro', name: 'Pedro S.', ini: 'PS', avatar: '#FFE9A8', when: '7:05 pm', kind: 'done', status: 'Contestada',
        msgs: [['c', '¿A qué hora entregas?'], ['b', 'Entrego de lunes a sábado, de 5 a 8 pm.']], tags: ['Interesado'] }
    ];
    this.timers = [];
    this.demoTimers = [];
    this.nextId = 1;
    var A = function (t, s, q) { return { t: t, s: s, q: q }; };
    this.bizDefs = [
      { label: 'Vendo en Marketplace', example: 'Muebles, ropa, de todo', name: 'Tienda de Mariana', owner: 'Mariana',
        soloPrecio: A('El ropero blanco cuesta $1,800.', 'Ropero blanco: $1,800.', '¿Cuánto cuesta el ropero?'),
        ans: { precio: A('Sí, sigue disponible. El ropero blanco cuesta $1,800.', 'Disponible. Precio: $1,800.', '¿Sigue disponible el ropero?'),
          horario: A('Entrego de lunes a sábado, de 5 a 8 pm.', 'Entregas de lunes a sábado, 5 a 8 pm.', '¿A qué hora entregas?'),
          ubicacion: A('Entrego en Col. Centro y te mando la ubicación exacta.', 'Entrega en Col. Centro.', '¿Dónde lo recojo?'),
          apartar: A('Te lo aparto hasta las 8 pm sin anticipo.', 'Se aparta hasta las 8 pm, sin anticipo.', '¿Me lo apartas?'),
          pago: A('Acepto efectivo y transferencia. Por ahora solo entrego en persona.', 'Efectivo o transferencia. Solo entrega en persona.', '¿Aceptas transferencia?') },
        otro: '¿Me lo dejas en $1,200?' },
      { label: 'Salón de uñas', example: 'Citas y precios', name: 'Nails by Caro', owner: 'Caro',
        ans: { precio: A('El gelish en manos cuesta $280 y el acrílico desde $450.', 'Gelish $280. Acrílico desde $450.', '¿Cuánto cuesta el gelish?'),
          horario: A('Abrimos de martes a sábado, de 10 am a 7 pm.', 'Martes a sábado, 10 am a 7 pm.', '¿Qué días abren?'),
          ubicacion: A('Estamos en Plaza Las Fuentes, local 8.', 'Plaza Las Fuentes, local 8.', '¿Dónde están?'),
          apartar: A('Tengo lugar mañana a las 11 am o a las 4 pm. ¿Cuál te aparto?', 'Citas disponibles mañana: 11 am o 4 pm.', '¿Tienes cita mañana?'),
          pago: A('Aceptamos efectivo, transferencia y tarjeta.', 'Efectivo, transferencia o tarjeta.', '¿Aceptan tarjeta?') },
        otro: '¿Hacen diseños de personajes?' },
      { label: 'Comida y antojitos', example: 'Menú, pedidos, domicilio', name: 'Tacos El Güero', owner: 'el Güero',
        ans: { precio: A('La orden de 5 tacos de asada cuesta $110.', 'Orden de 5 tacos de asada: $110.', '¿Cuánto la orden de asada?'),
          horario: A('Abrimos todos los días de 6 pm a 12 am.', 'Todos los días, 6 pm a 12 am.', '¿A qué hora abren?'),
          ubicacion: A('Estamos en Av. Juárez 120, frente al parque.', 'Av. Juárez 120, frente al parque.', '¿Dónde están?'),
          apartar: A('¿Para cuántas personas y a qué hora? Te aparto mesa.', 'Reservaciones: indicar personas y hora.', '¿Puedo reservar mesa?'),
          pago: A('Llevamos a domicilio hasta 5 km y pagas en efectivo o transferencia.', 'Domicilio hasta 5 km. Efectivo o transferencia.', '¿Tienen servicio a domicilio?') },
        otro: '¿Hacen eventos para 80 personas?' },
      { label: 'Tienda de ropa', example: 'Tallas, apartados, envíos', name: 'Boutique Lía', owner: 'Lía',
        ans: { precio: A('El vestido floral cuesta $650 y hay tallas S, M y L.', 'Vestido floral: $650. Tallas S, M y L.', '¿Cuánto el vestido floral?'),
          horario: A('Abrimos de lunes a sábado, de 11 am a 8 pm.', 'Lunes a sábado, 11 am a 8 pm.', '¿Qué horario tienen?'),
          ubicacion: A('Estamos en Calle Morelos 45, en el centro.', 'Calle Morelos 45, centro.', '¿Dónde está la tienda?'),
          apartar: A('Te lo aparto 24 horas. ¿Qué talla quieres?', 'Apartado por 24 horas.', '¿Me apartas una M?'),
          pago: A('Enviamos a todo México por paquetería y aceptamos transferencia o tarjeta.', 'Envíos a todo México. Transferencia o tarjeta.', '¿Hacen envíos?') },
        otro: '¿Lo tienen en color negro?' },
      { label: 'Bienes raíces', example: 'Precios, visitas, crédito', name: 'Casas del Valle', owner: 'un asesor',
        ans: { precio: A('La casa en Col. Las Palmas está en $1,850,000 y tiene 3 recámaras.', 'Col. Las Palmas: $1,850,000, 3 recámaras.', '¿Cuánto cuesta la casa?'),
          horario: A('Damos citas de lunes a domingo, de 9 am a 7 pm.', 'Citas todos los días, 9 am a 7 pm.', '¿Qué días puedo verla?'),
          ubicacion: A('Está a dos cuadras del parque central. Te comparto el mapa.', 'A dos cuadras del parque central.', '¿Dónde está?'),
          apartar: A('¿Te acomoda verla el sábado a las 11 am?', 'Visita disponible: sábado 11 am.', '¿Puedo agendar una visita?'),
          pago: A('Aceptamos crédito Infonavit, bancario o de contado.', 'Infonavit, crédito bancario o contado.', '¿Aceptan Infonavit?') },
        otro: '¿Aceptan mascotas en la privada?' },
      { label: 'Gimnasio o estudio', example: 'Mensualidad, horarios, clases', name: 'Gym Fuerza', owner: 'el coach',
        ans: { precio: A('La mensualidad cuesta $450 y la visita $60.', 'Mensualidad $450. Visita $60.', '¿Cuánto cuesta el mes?'),
          horario: A('Abrimos de 5 am a 10 pm entre semana y de 7 am a 2 pm los sábados.', 'Lunes a viernes 5 am a 10 pm. Sábado 7 am a 2 pm.', '¿Qué horario tienen?'),
          ubicacion: A('Estamos en Blvd. Rosales 300 y hay estacionamiento.', 'Blvd. Rosales 300, con estacionamiento.', '¿Dónde están?'),
          apartar: A('Tu primera clase es gratis. ¿Te aparto lugar mañana a las 7 am?', 'Primera clase gratis. Lugar disponible mañana 7 am.', '¿Puedo ir a una clase de prueba?'),
          pago: A('Aceptamos efectivo, tarjeta y transferencia.', 'Efectivo, tarjeta o transferencia.', '¿Aceptan tarjeta?') },
        otro: '¿Tienen entrenador para lesiones?' }
    ];
    this.toneDefs = ['Amable y cercano', 'Breve y directo', 'Formal', 'Con chispa'];
    this.skillDefs = [
      { id: 'precio', label: 'Precios y disponibilidad' },
      { id: 'horario', label: 'Horarios y ubicación' },
      { id: 'apartar', label: 'Apartar o agendar citas' },
      { id: 'pago', label: 'Pagos y envíos' }
    ];
    this.intentKeys = {
      precio: ['precio', 'cuanto', 'cuánto', 'cuesta', 'disponible', 'vale', 'costo', 'hay ', 'todavia', 'todavía', 'sigue'],
      horario: ['hora', 'horario', 'abren', 'abierto', 'cierran', 'dias', 'días', 'que dia', 'qué día'],
      ubicacion: ['donde', 'dónde', 'ubicacion', 'ubicación', 'direccion', 'dirección', 'queda', 'recojo'],
      apartar: ['apart', 'cita', 'agenda', 'reserv', 'mesa', 'lugar', 'visita', 'prueba'],
      pago: ['pago', 'pagar', 'tarjeta', 'efectivo', 'transfer', 'envio', 'envío', 'domicilio', 'credito', 'crédito', 'infonavit']
    };
    this.initScen();
    this.intentSkill = { precio: 'precio', horario: 'horario', ubicacion: 'horario', apartar: 'apartar', pago: 'pago' };
  }
  initScen() {
    var L = {
      locale: 'es-MX', tabs: ['Bazar y ropa', 'Uñas', 'Sushi y café'], kicker: 'Ejemplo · ', title: 'Lo que hace Neuri en esta plática',
      hint: 'Toca las respuestas en el celular o escríbelas tú.', restart: 'Volver a empezar', inputPh: 'Escribe o toca una opción…',
      hash: '#alta', done: ' (hecho)', pending: ' (pendiente)', listLabel: 'Pasos de esta plática',
      money: function (n) { return '$' + n.toLocaleString('en-US'); },
      nails: { name: 'Uñas Caro', svc: 'gelish en manos', price: '$280',
        intro: 'Una clienta pregunta si tienes lugar. Tú estás atendiendo; Neuri revisa tu agenda y la aparta.',
        cta: 'Pedir mi asistente de citas', ask: 'Hola, ¿tienes lugar el sábado para gelish?',
        offer: function (list) { return 'Para gelish en manos tengo estos horarios:\n' + list + '\nResponde con el número (1, 2 o 3).'; },
        confirm: function (w) { return '¡Listo! Tu cita de gelish en manos quedó el ' + w + ' ($280). Si necesitas cambiarla o cancelarla, escríbeme "cancelar mi cita".'; },
        deposit: 'Para apartar tu lugar, deja el anticipo de $100 aquí: pago.ejemplo/unascaro. Tu cita queda confirmada cuando el negocio lo vea.',
        reminder: function (w) { return 'Un día antes le llega: «Te recuerdo tu cita de gelish en manos mañana, ' + w + ', en Uñas Caro.»'; },
        tagOffer: 'Horarios libres de tu agenda', tagConfirm: 'Agendado por Neuri', tagDeposit: 'Solo si pones tu link de anticipo',
        list: ['Ofrece 3 horarios libres de tu agenda', 'Aparta el que elige y confirma con precio', 'Pide anticipo con tu link, si lo pones', 'Le recuerda la cita un día antes y el mismo día'] },
      food: { name: 'Sushi Kai', roll: 'Rollo California', rollPrice: 120, coffees: [['Americano', 45], ['Latte', 60]],
        intro: 'Te piden por DM mientras cocinas. Neuri toma el pedido con tu menú y te lo pasa listo.',
        cta: 'Pedir mi asistente de comida', ask: 'Quiero 2 rollos california y un café', which: '¿Cuál café?',
        cart: function (lines, sub) { return 'Tu pedido:\n' + lines + '\nSubtotal: ' + sub + '\n¿Algo más?'; },
        doneLabel: 'Es todo', time: '¿Para qué hora?\n1. Lo antes posible (como a las 2:20 pm)\nO dime la hora, por ejemplo "a las 3".',
        asapLabel: '1 · Lo antes posible', asapKey: 'antes', at3: 'A las 3', ats: ['hoy a las 2:20 pm', 'hoy a las 3:00 pm'],
        confirm: function (lines, total, at) { return '¡Listo! Tu pedido #12:\n' + lines + '\nTotal: ' + total + '\nPara llevar, listo ' + at + '. Te aviso por aquí cuando esté listo.'; },
        ready: 'Cuando marcas Listo, le llega: «¡Tu pedido #12 está listo! Ya puedes pasar por él a Sushi Kai.»',
        tagMenu: 'Con tu menú', tagCart: 'Sumado con tus precios', tagTime: 'Dentro de tu horario de cocina', tagConfirm: 'Te llega a Pedidos de hoy',
        list: ['Entiende el pedido y pregunta lo que falta', 'Suma con tus precios', 'Pregunta para qué hora, dentro de tu horario', 'Confirma con total y número de pedido', 'Avisa «listo» cuando tú lo marcas'] }
    };
    this.scenL = L;
    var sat = new Date(); sat.setHours(0, 0, 0, 0);
    sat.setDate(sat.getDate() + (((6 - sat.getDay() + 7) % 7) || 7));
    var at = function (h, m, o) { var d = new Date(sat.getTime()); d.setHours(h, m, 0, 0); try { return d.toLocaleString(L.locale, o); } catch (e) { return h + ':' + (m < 10 ? '0' : '') + m; } };
    var slots = [[11, 0], [13, 30], [16, 0]].map(function (x) { return at(x[0], x[1], { weekday: 'long', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); });
    var hours = [[11, 0], [13, 30], [16, 0]].map(function (x) { return at(x[0], x[1], { hour: 'numeric', minute: '2-digit' }); });
    var N = L.nails, F = L.food, money = L.money;
    var lines = function (ci) { var c = F.coffees[ci]; return '• 2 × ' + F.roll + ' — ' + money(2 * F.rollPrice) + '\n• 1 × ' + c[0] + ' — ' + money(c[1]); };
    var total = function (ci) { return money(2 * F.rollPrice + F.coffees[ci][1]); };
    this.scenDefs = {
      unas: { name: N.name, giro: 'citas', intro: N.intro, cta: N.cta, list: N.list, steps: [
        { prog: 1, opts: [{ label: N.ask }],
          reply: function () { return [{ text: N.offer(slots.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n')), time: N.tagOffer }]; } },
        { prog: 4, opts: slots.map(function (s, i) { return { label: (i + 1) + ' · ' + hours[i], say: String(i + 1), keys: [String(i + 1), hours[i].toLowerCase()] }; }),
          reply: function (i) { return [{ text: N.confirm(slots[i]), time: N.tagConfirm }, { text: N.deposit, time: N.tagDeposit }, { note: true, text: N.reminder(slots[i]) }]; } }
      ] },
      comida: { name: F.name, giro: 'comida', intro: F.intro, cta: F.cta, list: F.list, steps: [
        { prog: 1, opts: [{ label: F.ask }],
          reply: function () { return [{ text: F.which + '\n' + F.coffees.map(function (c, i) { return (i + 1) + '. ' + c[0] + ' ' + money(c[1]); }).join('\n'), time: F.tagMenu }]; } },
        { prog: 2, opts: F.coffees.map(function (c, i) { return { label: c[0], keys: [String(i + 1), c[0].toLowerCase()] }; }),
          reply: function (i) { this.sCoffee = i; return [{ text: F.cart(lines(i), total(i)), time: F.tagCart }]; } },
        { prog: 3, opts: [{ label: F.doneLabel }],
          reply: function () { return [{ text: F.time, time: F.tagTime }]; } },
        { prog: 5, opts: [{ label: F.asapLabel, say: '1', keys: ['1', F.asapKey] }, { label: F.at3, keys: ['3'] }],
          reply: function (i) { var ci = this.sCoffee || 0; return [{ text: F.confirm(lines(ci), total(ci), F.ats[i]), time: F.tagConfirm }, { note: true, text: F.ready }]; } }
      ] }
    };
  }
  setScenario(k, focus) {
    if (k !== 'bazar' && !this.scenDefs[k]) return;
    this.demoTimers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
    this.demoTimers = [];
    var changed = k !== this.state.scen;
    var p = { scen: k, sStep: 0, sProg: 0, typing: false, draft: '', msgs: [] };
    if (k === 'bazar') { p.phase = 'setup'; p.bChecks = 0; }
    this.setState(p, focus ? function () { var el = document.getElementById('dtab-' + k); if (el) el.focus(); } : null);
    if (changed) { try { if (window.nTrack) window.nTrack('demo_scenario', { value: k }); } catch (e) {} }
  }
  scenKey(e, k) {
    var ks = ['bazar', 'unas', 'comida'], i = ks.indexOf(k), n = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = ks[(i + 1) % 3];
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = ks[(i + 2) % 3];
    else if (e.key === 'Home') n = ks[0];
    else if (e.key === 'End') n = ks[2];
    if (n) { e.preventDefault(); this.setScenario(n, true); }
  }
  scriptAsk(text) {
    var q = (text || '').trim();
    var sc = this.scenDefs[this.state.scen], step = sc && sc.steps[this.state.sStep];
    if (!q || !step || this.state.typing) return;
    var low = q.toLowerCase(), idx = -1;
    step.opts.forEach(function (o, i) {
      (o.keys || []).forEach(function (k) { if (idx < 0 && (low === k || (k.length > 1 && low.indexOf(k) !== -1))) idx = i; });
    });
    this.scriptRun(idx < 0 ? 0 : idx, q);
  }
  scriptRun(i, said) {
    var self = this, st = this.state, sc = this.scenDefs[st.scen], step = sc && sc.steps[st.sStep];
    if (!step || st.typing) return;
    var o = step.opts[i] || step.opts[0];
    var out = step.reply.call(this, i).map(function (m) { return Object.assign({ id: self.nextId++, mine: false, time: '' }, m); });
    var msgs = st.msgs.concat([{ id: this.nextId++, mine: true, text: said || o.say || o.label, time: '' }]).slice(-6);
    var fin = { sStep: st.sStep + 1, sProg: step.prog };
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    if (reduce) { this.setState(Object.assign({ msgs: msgs.concat(out).slice(-6), typing: false, draft: '' }, fin)); return; }
    this.setState({ msgs: msgs, typing: true, draft: '' });
    var t = 0;
    out.forEach(function (m, k) {
      t += k === 0 ? 900 : 700;
      self.demoTimers.push(setTimeout(function () {
        var last = k === out.length - 1;
        var p = { msgs: self.state.msgs.concat([m]).slice(-6), typing: !last };
        if (last) Object.assign(p, fin);
        self.setState(p);
      }, t));
    });
  }
  bizCur() { return this.bizDefs[this.state.biz]; }
  greeting(st) {
    var n = (st.name || '').trim() || 'tu negocio';
    return [
      '¡Hola! Soy el asistente de ' + n + '. ¿En qué te ayudo?',
      'Hola, ¿en qué te ayudo?',
      'Buen día. Le atiende el asistente de ' + n + '. ¿En qué puedo ayudarle?',
      '¡Qué onda! Aquí el asistente de ' + n + '. ¡Pregúntame lo que quieras!'
    ][st.tone];
  }
  ownProds(st) {
    // A197: «Silla roja $450; Lámpara $300» → hasta 3 productos (solo en el navegador, no se guarda)
    return String(st.prods || '').split(/[;\n]/).map(function (x) {
      // A207: acepta moneda al final («$450 MXN», «45 dlls», «$1,200 pesos»)
      var cur = /\s*(mxn|usd|pesos?|dlls?|d[oó]lares|dollars?)\.?\s*$/i, y = x.trim(), c = y.match(cur); y = y.replace(cur, '');
      var m = y.match(/^(.+?)[\s:–-]*\$\s*([\d][\d.,]*)\s*$/) || y.match(/^(.+?)\s+([\d][\d.,]*)\s*$/);
      var u = c ? c[1].toLowerCase() : '', cc = /^(mxn|pesos?)$/.test(u) ? ' MXN' : u ? ' USD' : '';
      return m ? { n: m[1].trim().slice(0, 40), p: '$' + m[2] + cc } : null;
    }).filter(Boolean).slice(0, 3);
  }
  compose(intent, q) {
    var biz = this.bizCur();
    var a = biz.ans[intent];
    var own = intent === 'precio' ? this.ownProds(this.state) : [];
    if (own.length) {
      var norm = function (x) { return String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
      var lq = norm(q), hit = null;
      own.forEach(function (o) { if (!hit && norm(o.n).split(/\s+/).some(function (w) { return w.length > 2 && lq.indexOf(w) !== -1; })) hit = o; });
      var asksAv = /disponible|sigue|todav|hay|still|availab|have/i.test(q || '');
      if (hit) a = { t: hit.n + ' cuesta ' + hit.p + (asksAv ? ' y sí está disponible' : '') + '.', s: hit.n + ': ' + hit.p + '.' + (asksAv ? ' Disponible.' : '') };
      else { var lst = own.map(function (o) { return o.n + ' ' + o.p; }).join(', '); a = { t: 'Tenemos: ' + lst + '. ¿Cuál te interesa?', s: lst + '.' }; }
    } else if (intent === 'precio' && biz.soloPrecio && !/disponible|sigue|todav|hay|still|availab|have/i.test(q || '')) a = biz.soloPrecio;
    var t = this.state.tone;
    if (t === 0) return '¡Claro! ' + a.t + ' ¿Te ayudo con algo más?';
    if (t === 1) return a.s;
    if (t === 2) return 'Con gusto le informo: ' + a.s;
    return '¡Va que va! ' + a.t + ' ¡Aquí te esperamos!';
  }
  handoff() {
    var o = this.bizCur().owner;
    return [
      'Buena pregunta. Se la paso a ' + o + ' y te contesta en un momento.',
      'Lo reviso con ' + o + ' y te aviso.',
      'Permítame consultarlo con ' + o + '. En breve le respondemos.',
      '¡Uy, esa te la contesta ' + o + ' en persona! Ya le avisé.'
    ][this.state.tone];
  }
  setCfg(part) {
    var next = Object.assign({}, part);
    if (this.state.phase !== 'setup') { next.phase = 'setup'; next.msgs = []; next.bChecks = 0; next.typing = false; }
    this.demoTimers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
    this.demoTimers = [];
    this.setState(next);
  }
  buildBot() {
    var self = this;
    if (this.state.phase === 'building') return;
    this.demoTimers.forEach(function (t) { clearTimeout(t); });
    this.demoTimers = [];
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var greet = { id: this.nextId++, mine: false, text: this.greeting(this.state), time: '' };
    if (reduce) { this.setState({ phase: 'ready', bChecks: 3, msgs: [greet] }); return; }
    this.setState({ phase: 'building', bChecks: 0, msgs: [] });
    [700, 1400, 2100].forEach(function (ms, i) {
      self.demoTimers.push(setTimeout(function () { self.setState({ bChecks: i + 1 }); }, ms));
    });
    this.demoTimers.push(setTimeout(function () { self.setState({ phase: 'ready', msgs: [greet] }); }, 2500));
  }
  ask(text, intent) {
    if (this.state.scen !== 'bazar') { this.scriptAsk(text); return; }
    var self = this;
    var q = (text || '').trim();
    if (!q || this.state.typing || this.state.phase !== 'ready') return;
    var it = intent;
    if (it === undefined) {
      it = null;
      var low = ' ' + q.toLowerCase() + ' ';
      // A204: una palabra clave que es parte de SUS productos («mesa», «table») no cuenta como apartar/cita
      var own = String(this.state.prods || '').toLowerCase();
      var order = ['apartar', 'pago', 'ubicacion', 'horario', 'precio'];
      for (var i = 0; i < order.length && !it; i++) {
        var ks = this.intentKeys[order[i]];
        for (var k = 0; k < ks.length; k++) { if (low.indexOf(ks[k]) !== -1 && !(order[i] !== 'precio' && own && own.indexOf(ks[k].trim()) !== -1)) { it = order[i]; break; } }
      }
    }
    var reply = (it && this.state.skills[this.intentSkill[it]]) ? this.compose(it, q) : this.handoff();
    var handed = !(it && this.state.skills[this.intentSkill[it]]);
    var msgs = this.state.msgs.concat([{ id: this.nextId++, mine: true, text: q, time: '' }]).slice(-6);
    this.setState({ msgs: msgs, typing: true, draft: '' });
    var delay = 800 + Math.round(Math.random() * 700);
    this.demoTimers.push(setTimeout(function () {
      var secs = (delay / 1000 + 0.3).toFixed(1);
      var tag = handed ? 'Se lo pasó a ' + self.bizCur().owner : 'Contestado por Neuri en ' + secs + ' s';
      var next = self.state.msgs.concat([{ id: self.nextId++, mine: false, text: reply, time: tag }]).slice(-6);
      self.setState({ msgs: next, typing: false });
    }, delay));
  }
  lostTarget(st) {
    return Math.round(st.lcMsgs * 30 * (st.lcLate / 100) * (st.lcClose / 100) * st.lcTicket);
  }
  setCalc(part) {
    var self = this;
    this.setState(part);
    var to = this.lostTarget(Object.assign({}, this.state, part));
    if (this.lostAnimTimer) { clearInterval(this.lostAnimTimer); this.lostAnimTimer = null; }
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var from = this.state.lostAnim;
    if (reduce) { this.setState({ lostAnim: to }); return; }
    var t0 = Date.now(), dur = 450;
    this.lostAnimTimer = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      self.setState({ lostAnim: Math.round(from + (to - from) * e) });
      if (k >= 1) { clearInterval(self.lostAnimTimer); self.lostAnimTimer = null; }
    }, 30);
  }
  componentDidMount() {
    var self = this;
    // A203: link precargado con productos (QR de la tarjeta de visita) → el bot ya sale armado
    if (this.prefilled) this.buildBot();
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    if (reduce) { this.setState({ step: 7, ownNew: true, lostAnim: this.lostTarget(this.state) }); return; }
    this.setCalc({});
    this.timers.push(setTimeout(function () { self.setState({ ownNew: true }); }, 4500));
    this.runLoop();
  }
  componentWillUnmount() {
    if (this.lostAnimTimer) { clearInterval(this.lostAnimTimer); this.lostAnimTimer = null; }
    this.timers.forEach(function (t) { clearTimeout(t); });
    this.demoTimers.forEach(function (t) { clearTimeout(t); });
    this.timers = [];
    this.demoTimers = [];
  }
  runLoop() {
    var self = this;
    var plan = [[0, 0], [700, 1], [1500, 2], [3000, 3], [4800, 4], [5600, 5], [6900, 6], [7700, 7]];
    plan.forEach(function (p) {
      self.timers.push(setTimeout(function () { self.setState({ step: p[1] }); }, p[0]));
    });
    self.timers.push(setTimeout(function () { self.timers = []; self.runLoop(); }, 12500));
  }
  renderVals() {
    var s = this.state.step;
    var typing = s === 2 || s === 5;
    var self = this;
    var sc = this.state.scen !== 'bazar' ? this.scenDefs[this.state.scen] : null;
    var st = sc ? Object.assign({}, this.state, { name: sc.name, phase: 'ready' }) : this.state;
    var LL = this.scenL;
    var biz = this.bizCur();
    var ready = st.phase === 'ready';
    var building = st.phase === 'building';
    var chips = function (on) { return 'font: inherit; cursor: pointer; font-weight: 600; font-size: 14.5px; padding: 10px 15px; border-radius: 999px; min-height: 44px; ' + (on ? 'background: #8FE0B4; color: #05080D; border: 1.5px solid #8FE0B4;' : 'background: transparent; color: #FFFFFF; border: 1.5px solid rgba(255,255,255,0.24);'); };
    var CH = {
      ig: { label: 'Instagram', icon: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM17.5 6.5h.01', head: '#FFFFFF', headText: '#05080D', sub: '#6B7A72', body: '#FFFFFF', me: 'background: #1565D8; color: #FFFFFF;', bot: 'background: #EFEFEF; color: #05080D;', send: '#1565D8', border: 'border-bottom: 1px solid #ECECEC;' },
      fb: { label: 'Messenger', icon: 'M12 3C7 3 3 6.7 3 11.3c0 2.6 1.3 4.9 3.3 6.4V21l3-1.7c.9.3 1.8.4 2.7.4 5 0 9-3.7 9-8.4S17 3 12 3zM8 13l3-3 2 2 3-3', head: '#FFFFFF', headText: '#05080D', sub: '#6B7A72', body: '#FFFFFF', me: 'background: #0866FF; color: #FFFFFF;', bot: 'background: #F0F0F0; color: #05080D;', send: '#0866FF', border: 'border-bottom: 1px solid #ECECEC;' },
      wa: { label: 'WhatsApp', icon: 'M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20.5l1.8-5.2A8.4 8.4 0 1 1 21 11.5z', head: '#0B5E3A', headText: '#FFFFFF', sub: '#CFE6D9', body: '#ECE5DA', me: 'background: #D9FDD3; color: #05080D;', bot: 'background: #FFFFFF; color: #05080D;', send: '#0B5E3A', border: '' }
    };
    var c = CH[st.ch];
    var slug = ((st.name || '').toLowerCase().normalize ? (st.name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') : (st.name || '').toLowerCase()).replace(/[^a-z0-9]/g, '') || 'tunegocio';
    var nm = (st.name || '').trim() || 'Tu negocio';
    var ini = nm.split(/\s+/).filter(function (w) { return w.length > 2 || /^[A-ZÁÉÍÓÚ]/.test(w); }).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('') || 'TN';
    var enabledIntents = ['precio', 'apartar', 'horario', 'pago', 'ubicacion'].filter(function (i) { return st.skills[self.intentSkill[i]]; });
    var suggList = enabledIntents.slice(0, 3).map(function (i) { return { label: biz.ans[i].q, intent: i }; }).concat([{ label: biz.otro, intent: null }]);
    if (sc) { var stp = sc.steps[st.sStep]; suggList = stp ? stp.opts.map(function (o, i) { return { label: o.label, act: function () { self.scriptRun(i); } }; }) : [{ label: LL.restart, act: function () { self.setScenario(st.scen); } }]; }
    var checkTexts = ['Entendiendo tu negocio: ' + biz.label.toLowerCase(), 'Escribiendo respuestas en tono ' + this.toneDefs[st.tone].toLowerCase(), 'Conectando Instagram y Messenger'];
    var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
    var lostT = this.lostTarget(st);
    var be = Math.max(1, Math.ceil(899 / st.lcTicket));
    var sliders = [
      { key: 'msgs', label: 'Mensajes que te llegan al día', min: 5, max: 200, step: 5, value: st.lcMsgs, display: st.lcMsgs, field: 'lcMsgs' },
      { key: 'late', label: 'De esos, ¿cuántos contestas tarde o nunca?', min: 10, max: 90, step: 5, value: st.lcLate, display: st.lcLate + '%', field: 'lcLate' },
      { key: 'close', label: 'De cada 100 que sí atiendes, ¿cuántos compran?', min: 5, max: 50, step: 1, value: st.lcClose, display: st.lcClose + '%', field: 'lcClose' },
      { key: 'ticket', label: 'Lo que vale una venta en promedio', min: 100, max: 5000, step: 50, value: st.lcTicket, display: money(st.lcTicket), field: 'lcTicket' }
    ];
    var rowsAll = this.ownRowsDef.filter(function (r) { return r.id !== 'sofia' || st.ownNew; });
    var rowsF = rowsAll.filter(function (r) { return st.ownFilter === 'all' || (st.ownFilter === 'hand' ? r.kind === 'hand' : r.kind === 'apart'); });
    var selIdx = Math.min(st.ownSel, this.ownRowsDef.length - 1);
    var sel = this.ownRowsDef[selIdx];
    if (sel.id === 'sofia' && !st.ownNew) sel = this.ownRowsDef[1];
    var chipFor = function (kind) {
      var base = 'align-self: flex-start; font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px; ';
      if (kind === 'hand') return base + 'background: #FCE9DC; color: #9A3D12;';
      if (kind === 'apart') return base + 'background: #D4F2E1; color: #0B5E3A;';
      return base + 'background: #EEF0EA; color: #56635C;';
    };
    var hasHand = rowsAll.filter(function (r) { return r.kind === 'hand'; }).length;
    var hasApart = rowsAll.filter(function (r) { return r.kind === 'apart'; }).length;
    var G = '#0B5E3A', R = '#9A3D12', N = '#3D4A44';
    return {
      isBuilder: !sc, isScript: !!sc, panelCls: sc ? 'scr' : '',
      scenTabs: ['bazar', 'unas', 'comida'].map(function (k, i) {
        var on = self.state.scen === k;
        return { id: 'dtab-' + k, label: LL.tabs[i], selected: on ? 'true' : 'false', tabindex: on ? '0' : '-1',
          style: 'font: inherit; cursor: pointer; font-weight: 700; font-size: 15px; padding: 10px 18px; border-radius: 999px; min-height: 44px; ' + (on ? 'background: #8FE0B4; color: #05080D; border: 1.5px solid #8FE0B4;' : 'background: transparent; color: #FFFFFF; border: 1.5px solid rgba(255,255,255,0.32);'),
          pick: function () { self.setScenario(k); }, key: function (e) { self.scenKey(e, k); } };
      }),
      scenTabId: 'dtab-' + this.state.scen,
      scKicker: sc ? LL.kicker + sc.name : '', scTitle: LL.title, scIntro: sc ? sc.intro : '', scHint: LL.hint, scListLabel: LL.listLabel,
      scHref: sc ? '?giro=' + sc.giro + LL.hash : '#', scGiro: sc ? sc.giro : '', scCta: sc ? 'demo-' + sc.giro : '', scCtaLabel: sc ? sc.cta : '',
      scSteps: sc ? sc.list.map(function (t, i) { var d = st.sProg > i; return { text: t, done: d, pending: !d, sr: d ? LL.done : LL.pending, rowStyle: d ? 'color: #FFFFFF;' : 'color: #B4C4BB;' }; }) : [],
      lcSliders: sliders.map(function (s) {
        return Object.assign({}, s, { onChange: function (e) { var p = {}; p[s.field] = Number(e.target.value); self.setCalc(p); } });
      }),
      lostShown: money(st.lostAnim),
      lostSales: Math.round(st.lcMsgs * 30 * (st.lcLate / 100) * (st.lcClose / 100)).toLocaleString('en-US'),
      breakEven: be === 1 ? 'Con 1 venta recuperada al mes, ya se pagó.' : 'Con ' + be + ' ventas recuperadas al mes, ya se pagó.',
      ownFilters: [['all', 'Todas · ' + rowsAll.length], ['hand', 'Te las pasó · ' + hasHand], ['apart', 'Apartados · ' + hasApart]].map(function (f) {
        var on = st.ownFilter === f[0];
        return { label: f[1], pressed: on ? 'true' : 'false',
          style: 'font: inherit; cursor: pointer; font-size: 13.5px; font-weight: 700; padding: 8px 13px; border-radius: 999px; min-height: 44px; ' + (on ? 'background: #05080D; color: #FFFFFF; border: 1.5px solid #05080D;' : 'background: #FFFFFF; color: #3D4A44; border: 1.5px solid #D5D9D2;'),
          pick: function () { self.setState({ ownFilter: f[0] }); } };
      }),
      ownRows: rowsF.map(function (r) {
        var idx = self.ownRowsDef.indexOf(r);
        var on = r === sel;
        return { name: r.name, ini: r.ini, avatar: r.avatar, when: r.when, status: r.status, chip: chipFor(r.kind),
          last: r.msgs[r.msgs.length - 1][1], pressed: on ? 'true' : 'false',
          cls: 'n-row' + (r.id === 'sofia' ? ' n-pop' : ''),
          style: 'font: inherit; cursor: pointer; width: 100%; display: flex; gap: 12px; align-items: flex-start; padding: 14px 18px; border: none; border-bottom: 1px solid #EEF0EA; color: #05080D; ' + (on ? 'background: #F2F7F3; box-shadow: inset 3px 0 0 #0B5E3A;' : 'background: #FFFFFF;'),
          pick: function () { self.setState({ ownSel: idx }); } };
      }),
      selName: sel.name,
      selWhen: sel.when,
      selTags: sel.tags.map(function (t) { return { label: t }; }),
      selHanded: sel.kind === 'hand',
      selMsgs: sel.msgs.map(function (m) {
        var mine = m[0] === 'c';
        return { text: m[1], style: 'max-width: 82%; padding: 10px 13px; border-radius: 16px; ' + (mine ? 'align-self: flex-start; background: #FFFFFF; border: 1px solid #E1E3DC; border-bottom-left-radius: 4px;' : 'align-self: flex-end; background: #0B5E3A; color: #FFFFFF; border-bottom-right-radius: 4px;') };
      }),
      compRows: [
        { need: 'Contesta a las 2 am', a: 'Si estás despierto', b: 'Solo en su turno', c: 'Sí', d: 'Sí, siempre', aC: R, bC: R, cC: N },
        { need: 'Lo que cuesta', a: 'Tu tiempo y tu sueño', b: 'Un sueldo al mes', c: 'Plan + tus horas armándolo', d: 'Desde $899 al mes', aC: N, bC: R, cC: N },
        { need: 'Listo en', a: 'Ya', b: 'Semanas buscando y enseñando', c: 'Días o semanas', d: 'Lo instalamos nosotros', aC: G, bC: R, cC: R },
        { need: 'Usa tus precios sin inventar', a: 'Sí', b: 'Si se los aprende', c: 'Depende cómo lo armes', d: 'Solo contesta con tu hoja', aC: G, bC: N, cC: N },
        { need: 'Te pasa lo difícil', a: 'No aplica', b: 'Sí', c: 'Si lo programas', d: 'Regateos y dudas raras, a ti', aC: N, bC: G, cC: N },
        { need: 'Sin saber de tecnología', a: 'Sí', b: 'Sí', c: 'No', d: 'Sí, se arma solo', aC: G, bC: G, cC: R }
      ],
      faqs: [
        { q: '¿Y si contesta algo mal?', a: 'Solo contesta con la información de tu hoja. Si le preguntan algo que no sabe, no inventa: te pasa la conversación y le avisa al cliente que tú le contestas. Puedes pausarlo cuando quieras.' },
        { q: '¿Qué necesito para empezar?', a: 'Tu cuenta de Instagram o tu página de Facebook, y una hoja con tus piezas o servicios, precios, entregas y formas de pago. El alta toma 3 minutos.' },
        { q: '¿Lo puedo probar antes?', a: 'Sí. Te damos un código de prueba para que le escribas desde tu cuenta personal y veas cómo contesta antes de activarlo para tus clientes.' },
        { q: '¿Y WhatsApp?', a: 'Está en camino. Primero abrimos Instagram y Messenger (pendiente de aprobación de Meta); en cuanto WhatsApp esté listo, te avisamos para conectarlo.' },
        { q: '¿Puedo cancelarlo?', a: 'Sí, cuando quieras. Se paga mes a mes y no hay contrato.' },
        { q: '¿Me cobran por cada mensaje o cliente?', a: 'No. Pagas el mismo precio fijo al mes aunque te escriban muchos compradores: no hay cobro por contacto ni por mensaje. Por seguridad, cada cuenta contesta hasta 1,000 mensajes al día.' },
        { q: '¿Quién me ayuda si algo falla?', a: 'Desde Mi asistente tocas «Algo no está bien»: revisa solo tu Instagram, tu hoja y si está pausado, y te da el botón para arreglar cada cosa. Si sigue sin funcionar, pasa a una persona de Neuri y te contestamos por correo.' },
        { q: '¿Y la respuesta automática de Marketplace?', a: 'Facebook ya trae una respuesta automática a «¿sigue disponible?» dentro de Marketplace. neuri.bots contesta en tu Instagram y en el Messenger de tu página de Facebook: precios, entregas, apartados y tu link a quien comenta, con la información de tu hoja. Si solo vendes en Marketplace con tu perfil personal, la de Facebook te puede bastar.' },
        { q: '¿Por qué no uso las respuestas automáticas que ya trae Instagram?', a: 'Las de Instagram sirven para saludar al primer mensaje y avisar cuando no estás, y son gratis: si con eso te basta, úsalas. neuri.bots contesta cada pregunta distinta con la información de tu hoja (si sigue disponible, precio, entrega, apartados) y manda tu link a quien comenta tus publicaciones.' },
        { q: '¿Me dan factura?', a: 'Todavía no emitimos factura CFDI: Neuri LLC es una empresa de Estados Unidos. Cuando empiecen los cobros, cada pago tiene su recibo para descargar en el portal de pagos de Stripe, que abres desde Mi asistente. Si tu negocio necesita CFDI, tenlo en cuenta antes de contratar; cuando la tengamos, lo diremos aquí.' },
        { q: '¿Qué pasa cuando termina el mes gratis?', a: 'Una semana antes te llega un correo para poner tu tarjeta; no se cobra nada hasta que termine el mes. Si no la pones, tu asistente se pausa solo a los pocos días. Sin cargos sorpresa.' },
        { q: '¿Ya lo usa alguien?', a: 'Estamos abriendo con los primeros 10 negocios. Por eso la instalación y el primer mes van gratis: a cambio solo te pedimos tu opinión.' }
      ],
      bizList: this.bizDefs.map(function (b, i) {
        var on = st.biz === i;
        return { label: b.label, example: b.example, pressed: on ? 'true' : 'false',
          style: 'font: inherit; cursor: pointer; text-align: left; color: #FFFFFF; display: flex; flex-direction: column; gap: 3px; padding: 12px 14px; border-radius: 14px; min-height: 60px; ' + (on ? 'background: #24372E; border: 2px solid #8FE0B4;' : 'background: rgba(255,255,255,0.03); border: 2px solid rgba(255,255,255,0.12);'),
          pick: function () { var p = { biz: i }; if (!self.state.nameEdited) p.name = b.name; self.setCfg(p); } };
      }),
      bizName: st.name,
      onName: function (e) { window.__nbDemo = window.__nbDemo || {}; window.__nbDemo.name = e.target.value; self.setCfg({ name: e.target.value, nameEdited: true }); },
      prodsVal: st.prods,
      // A208: muestra lo que el bot entendió de «Tus productos»
      prodsOk: self.ownProds(st).length > 0,
      prodsBad: String(st.prods || '').trim().length > 2 && self.ownProds(st).length === 0,
      // A209: el vendedor se manda su demo precargado (A200) por WhatsApp para retomarlo después
      waShare: 'https://wa.me/?text=' + encodeURIComponent('Mi demo de neuri.bots con mis productos: ' + 'https://neuri.tech/sigue-disponible/?' + ((st.nameEdited && String(st.name || '').trim()) ? 'negocio=' + encodeURIComponent(String(st.name).trim().slice(0, 36)) + '&' : '') + 'productos=' + encodeURIComponent(String(st.prods || '').trim().slice(0, 160)) + '&src=demo-wa'),
      prodsTxt: self.ownProds(st).map(function (o) { return o.n + ' ' + o.p; }).join(' · '),
      onProds: function (e) { window.__nbDemo = window.__nbDemo || {}; window.__nbDemo.prods = e.target.value; self.setCfg({ prods: e.target.value }); },
      toneList: this.toneDefs.map(function (t, i) { return { label: t, pressed: st.tone === i ? 'true' : 'false', style: chips(st.tone === i), pick: function () { self.setCfg({ tone: i }); } }; }),
      toneSample: this.greeting(st),
      skillList: this.skillDefs.map(function (k) {
        var on = !!st.skills[k.id];
        return { label: k.label, on: on, pressed: on ? 'true' : 'false',
          style: 'font: inherit; cursor: pointer; text-align: left; color: #FFFFFF; display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 14px; min-height: 48px; font-size: 15px; font-weight: 600; ' + (on ? 'background: #24372E; border: 1.5px solid #8FE0B4;' : 'background: transparent; border: 1.5px solid rgba(255,255,255,0.18);'),
          boxStyle: 'width: 20px; height: 20px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; ' + (on ? 'background: #8FE0B4;' : 'border: 2px solid rgba(255,255,255,0.4);'),
          pick: function () { var sk = Object.assign({}, self.state.skills); sk[k.id] = !sk[k.id]; self.setCfg({ skills: sk }); } };
      }),
      buildBot: function () { self.buildBot(); },
      buildDisabled: building ? 'true' : 'false',
      buildLabel: building ? 'Neuri está armando tu bot…' : (ready ? 'Bot listo · pruébalo en el celular' : 'Armar mi bot'),
      buildStyle: 'font: inherit; border: none; font-weight: 700; font-size: 18px; padding: 18px 22px; border-radius: 16px; min-height: 60px; display: flex; align-items: center; justify-content: center; gap: 10px; ' + (building ? 'background: #24372E; color: #8FA79A; cursor: default;' : (ready ? 'background: #24372E; color: #8FE0B4; cursor: pointer; border: 1.5px solid #8FE0B4;' : 'background: #8FE0B4; color: #05080D; cursor: pointer;')),
      showChecks: st.phase !== 'setup',
      checks: checkTexts.map(function (t, i) {
        var done = st.bChecks > i; var active = building && st.bChecks === i;
        return { text: t, done: done, active: active, pending: !done && !active, rowStyle: done ? 'color: #FFFFFF;' : (active ? 'color: #8FE0B4;' : 'color: #6B8577;') };
      }),
      chList: ['ig', 'fb', 'wa'].map(function (k) {
        var on = st.ch === k;
        return { label: k === 'wa' ? 'WhatsApp · pronto' : CH[k].label, icon: CH[k].icon, selected: on ? 'true' : 'false',
          style: 'font: inherit; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; font-weight: 700; font-size: 14px; padding: 9px 14px; border-radius: 999px; border: none; min-height: 40px; ' + (on ? 'background: #FFFFFF; color: #05080D;' : 'background: transparent; color: #C5D2CB;'),
          pick: function () { self.setState({ ch: k }); } };
      }),
      phoneBodyStyle: 'background: ' + c.body + '; border-radius: 34px; overflow: hidden; color: #05080D; display: flex; flex-direction: column;',
      phHeadStyle: 'background: ' + c.head + '; color: ' + c.headText + '; padding: 18px; display: flex; align-items: center; gap: 12px; ' + c.border,
      phSubStyle: 'font-size: 12px; color: ' + c.sub,
      bizIni: ini,
      phTitle: st.ch === 'ig' ? slug : nm,
      phSub: st.ch === 'wa' ? 'WhatsApp llega pronto · vista previa' : st.typing ?'escribiendo…' : (ready ? (st.ch === 'ig' ? nm + ' · responde al instante' : 'en línea · responde al instante') : 'Tu bot todavía no está armado'),
      phIdle: !ready,
      idleText: building ? 'Armando tu bot…' : 'Configura tu bot y dale «Armar mi bot».',
      msgs: st.msgs.map(function (m) {
        return { text: m.text, time: m.time,
          wrap: 'align-self: ' + (m.note ? 'center' : m.mine ? 'flex-end' : 'flex-start') + '; display: flex; flex-direction: column; gap: 4px; max-width: 84%; flex-shrink: 0; align-items: ' + (m.mine ? 'flex-end' : 'flex-start') + ';',
          bubble: m.note ? 'background: rgba(255,255,255,0.94); color: #3D4A44; border: 1.5px dashed #9FB3A8; padding: 9px 11px; border-radius: 12px; font-size: 13px; line-height: 1.4; white-space: pre-line;' : (m.mine ? c.me : c.bot) + ' white-space: pre-line; padding: 10px 12px; border-radius: ' + (m.mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px') + ';',
          timeStyle: 'font-size: 11.5px; font-weight: 600; padding: 0 4px; color: ' + (st.ch === 'wa' ? '#0B5E3A' : '#6B7A72') + ';' };
      }),
      typing: st.typing,
      typingStyle: 'align-self: flex-start; ' + c.bot + ' padding: 13px 14px; border-radius: 18px 18px 18px 4px; display: flex; gap: 4px; flex-shrink: 0',
      showSugg: ready,
      sugg: suggList.map(function (s) {
        return { label: s.label, style: 'font: inherit; cursor: pointer; white-space: nowrap; font-size: 13px; font-weight: 600; padding: 8px 12px; border-radius: 999px; min-height: 36px; background: #FFFFFF; color: ' + c.send + '; border: 1.5px solid ' + c.send + ';',
          ask: s.act || function () { self.ask(s.label, s.intent === null ? null : s.intent); } };
      }),
      formStyle: 'display: flex; gap: 8px; padding: 10px; background: ' + (st.ch === 'wa' ? '#F0EBE3' : '#FFFFFF') + '; border-top: 1px solid ' + (st.ch === 'wa' ? '#DDD5C8' : '#ECECEC') + ';',
      sendStyle: 'width: 44px; height: 44px; border-radius: 50%; border: none; background: ' + c.send + '; color: #FFFFFF; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0',
      inputPh: sc ? LL.inputPh : ready ? 'Escríbele como cliente…' : 'Primero arma tu bot',
      draft: st.draft,
      onDraft: function (e) { self.setState({ draft: e.target.value }); },
      sendTyped: function (e) { if (e && e.preventDefault) e.preventDefault(); self.ask(self.state.draft); },
      accent: this.props.accent ?? '#0B5E3A',
      showM1: s >= 1,
      typing1: s === 2,
      showR1: s >= 3,
      showM2: s >= 4,
      typing2: s === 5,
      showR2: s >= 6,
      showLoc: s >= 7,
      status: typing ? 'Neuri está escribiendo…' : 'en línea · responde al instante'
    };
  }
}

// A286: la demo ya viene pintada en el HTML; se monta al acercarse a la vista,
// al primer toque/tecla o si llega con link precargado — no bloquea la carga en móvil.
var __nBoot = function () {
  if (window.__nDemo) return window.__nDemo;
  window.__nDemo = DCMount(Component);
  return window.__nDemo;
};
(function () {
  if (location.hash || /[?&](negocio|business|productos|products)=/.test(location.search)) { __nBoot(); return; }
  var evs = ['pointerdown', 'touchstart', 'keydown', 'focusin'];
  var once = function () { evs.forEach(function (t) { removeEventListener(t, once, true); }); __nBoot(); };
  evs.forEach(function (t) { addEventListener(t, once, { capture: true, passive: true }); });
  var roots = [].map.call(document.querySelectorAll('template[data-dc-part]'), function (t) { return document.getElementById(t.getAttribute('data-dc-part')); }).filter(Boolean);
  if ('IntersectionObserver' in window && roots.length) {
    // A286: si la demo ya está a la vista al cargar (el hero), se monta en un rato libre DESPUÉS de cargar
    // (load + 3 s, requestIdleCallback) para no trabar el primer toque; tocar/teclear la monta al momento.
    var t0 = Date.now(), idle = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 1); })(function () { __nBoot(); }, { timeout: 2000 }); };
    var later = function () { var w = 3000 - (Date.now() - t0); if (document.readyState === 'complete') setTimeout(idle, Math.max(0, w)); else addEventListener('load', function () { setTimeout(idle, 3000); }, { once: true }); };
    var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); later(); } }, { rootMargin: '300px 0px' });
    roots.forEach(function (r) { io.observe(r); });
  } else { __nBoot(); }
})();
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('[data-scenario]');
  if (a) __nBoot().setScenario(a.getAttribute('data-scenario'));
});
