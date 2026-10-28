// A286: sacado de en/still-available/index.html para que el navegador lo compile aparte y lo guarde en caché.

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      biz: 0, tone: 0, ch: 'ig', name: 'Mariana’s Finds', nameEdited: false, prods: '',
      skills: { precio: true, horario: true, apartar: true, pago: false },
      phase: 'setup', bChecks: 0, msgs: [], typing: false, draft: '',
      lcMsgs: 30, lcLate: 40, lcClose: 20, lcTicket: 60, lostAnim: 4320, // B-A7: arranca en el valor real (antes $0 hasta montar la demo)
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
      { id: 'sofia', name: 'Sophie L.', ini: 'SL', avatar: '#F7B48C', when: 'now', kind: 'apart', status: 'On hold · today 6 pm',
        msgs: [['c', 'Is the coffee table still available?'], ['b', 'Yes, it’s still available. It’s $95 and pickup is downtown, 5 to 8 pm.'], ['c', 'Can you hold it for me for 6 today?'], ['b', 'Done, it’s on hold for you today at 6 pm. I’ll send you the address.']], tags: ['Interested', 'On hold'] },
      { id: 'juan', name: 'John P.', ini: 'JP', avatar: '#8FE0B4', when: '11:52 pm', kind: 'apart', status: 'On hold · tomorrow 5 pm',
        msgs: [['c', 'Is the dresser still available?'], ['b', 'Yes, it’s still available. It’s $180 and pickup is Monday to Saturday, 5 to 8 pm.'], ['c', 'Ok, hold it for me for tomorrow.'], ['b', 'It’s on hold for you tomorrow at 5 pm, no deposit.']], tags: ['On hold'] },
      { id: 'carla', name: 'Carla M.', ini: 'CM', avatar: '#C9D6F5', when: '10:31 pm', kind: 'hand', status: 'Passed to you',
        msgs: [['c', 'How much for the dresser?'], ['b', 'It’s $180 and it’s still available.'], ['c', 'Would you take $120?'], ['b', 'I’ll pass that one to Mariana and she’ll reply shortly.']], tags: ['Interested', 'Haggling'] },
      { id: 'luis', name: 'Luis R.', ini: 'LR', avatar: '#E3EFE7', when: '9:14 pm', kind: 'done', status: 'Answered',
        msgs: [['c', 'Do you take Zelle?'], ['b', 'Yes, I take cash and Zelle. Pickup only for now.']], tags: ['Interested'] },
      { id: 'ana', name: 'Anna G.', ini: 'AG', avatar: '#F5D9E8', when: '8:40 pm', kind: 'hand', status: 'Passed to you',
        msgs: [['c', 'Can you ship it to Tucson?'], ['b', 'I’ll pass that one to Mariana and she’ll reply shortly.']], tags: ['Shipping'] },
      { id: 'pedro', name: 'Pete S.', ini: 'PS', avatar: '#FFE9A8', when: '7:05 pm', kind: 'done', status: 'Answered',
        msgs: [['c', 'What time is pickup?'], ['b', 'Pickup is Monday to Saturday, 5 to 8 pm.']], tags: ['Interested'] }
    ];
    this.timers = [];
    this.demoTimers = [];
    this.nextId = 1;
    var A = function (t, s, q) { return { t: t, s: s, q: q }; };
    this.bizDefs = [
      { label: 'I sell on Marketplace', example: 'Furniture, clothes, anything', name: 'Mariana’s Finds', owner: 'Mariana',
        soloPrecio: A('The white dresser is $180.', 'White dresser: $180.', 'How much is the dresser?'),
        ans: { precio: A('Yes, it’s still available. The white dresser is $180.', 'Available. Price: $180.', 'Is the dresser still available?'),
          horario: A('Pickup is Monday to Saturday, 5 to 8 pm.', 'Pickup Mon–Sat, 5–8 pm.', 'What time is pickup?'),
          ubicacion: A('Pickup is near downtown, and I’ll send you the exact address.', 'Pickup near downtown.', 'Where do I pick it up?'),
          apartar: A('I can hold it for you until 8 pm, no deposit.', 'Held until 8 pm, no deposit.', 'Can you hold it for me?'),
          pago: A('I take cash and Zelle. Pickup only for now.', 'Cash or Zelle. Pickup only.', 'Do you take Zelle?') },
        otro: 'Would you take $120?' },
      { label: 'Nail salon', example: 'Appointments and prices', name: 'Nails by Caro', owner: 'Caro',
        ans: { precio: A('A gel manicure is $35 and acrylic sets start at $55.', 'Gel $35. Acrylic from $55.', 'How much is a gel manicure?'),
          horario: A('We’re open Tuesday to Saturday, 10 am to 7 pm.', 'Tue–Sat, 10 am to 7 pm.', 'What days are you open?'),
          ubicacion: A('We’re at Desert Plaza, suite 8.', 'Desert Plaza, suite 8.', 'Where are you located?'),
          apartar: A('I have openings tomorrow at 11 am or 4 pm. Which one should I book?', 'Openings tomorrow: 11 am or 4 pm.', 'Any openings tomorrow?'),
          pago: A('We take cash, card and Venmo.', 'Cash, card or Venmo.', 'Do you take card?') },
        otro: 'Can you do character nail art?' },
      { label: 'Food and catering', example: 'Menu, orders, delivery', name: 'Tacos El Güero', owner: 'Güero',
        ans: { precio: A('An order of 5 carne asada tacos is $12.', '5 carne asada tacos: $12.', 'How much for the asada tacos?'),
          horario: A('We’re open every day, 6 pm to midnight.', 'Every day, 6 pm to midnight.', 'What time do you open?'),
          ubicacion: A('We’re at 120 Central Ave, across from the park.', '120 Central Ave, across from the park.', 'Where are you?'),
          apartar: A('How many people and what time? I’ll save you a table.', 'Reservations: party size and time.', 'Can I reserve a table?'),
          pago: A('We deliver within 3 miles, and you can pay cash or card.', 'Delivery within 3 miles. Cash or card.', 'Do you deliver?') },
        otro: 'Do you cater for 80 people?' },
      { label: 'Clothing boutique', example: 'Sizes, holds, shipping', name: 'Boutique Lía', owner: 'Lía',
        ans: { precio: A('The floral dress is $45 and comes in S, M and L.', 'Floral dress: $45. Sizes S, M, L.', 'How much is the floral dress?'),
          horario: A('We’re open Monday to Saturday, 11 am to 8 pm.', 'Mon–Sat, 11 am to 8 pm.', 'What are your hours?'),
          ubicacion: A('We’re at 45 Mill Ave, downtown.', '45 Mill Ave, downtown.', 'Where’s the store?'),
          apartar: A('I’ll hold it for 24 hours. What size do you want?', 'Held for 24 hours.', 'Can you hold a medium?'),
          pago: A('We ship anywhere in the US and take card or PayPal.', 'US shipping. Card or PayPal.', 'Do you ship?') },
        otro: 'Do you have it in black?' },
      { label: 'Real estate', example: 'Prices, showings, financing', name: 'Valley Homes', owner: 'an agent',
        ans: { precio: A('The house on Palm Drive is listed at $385,000 with 3 bedrooms.', 'Palm Drive: $385,000, 3 bedrooms.', 'How much is the house?'),
          horario: A('We do showings every day, 9 am to 7 pm.', 'Showings daily, 9 am to 7 pm.', 'When can I see it?'),
          ubicacion: A('It’s two blocks from the main park. I’ll send you the map.', 'Two blocks from the main park.', 'Where is it?'),
          apartar: A('Does Saturday at 11 am work for a showing?', 'Showing available: Saturday 11 am.', 'Can I book a showing?'),
          pago: A('We work with FHA, conventional loans or cash.', 'FHA, conventional or cash.', 'Do you take FHA loans?') },
        otro: 'Are pets allowed in the HOA?' },
      { label: 'Gym or studio', example: 'Membership, hours, classes', name: 'Iron Gym', owner: 'the coach',
        ans: { precio: A('Membership is $39 a month and a day pass is $10.', 'Monthly $39. Day pass $10.', 'How much is a membership?'),
          horario: A('We’re open 5 am to 10 pm on weekdays and 7 am to 2 pm on Saturdays.', 'Mon–Fri 5 am to 10 pm. Sat 7 am to 2 pm.', 'What are your hours?'),
          ubicacion: A('We’re at 300 Rose Blvd, with free parking.', '300 Rose Blvd, free parking.', 'Where are you?'),
          apartar: A('Your first class is free. Want me to save you a spot tomorrow at 7 am?', 'First class free. Spot open tomorrow 7 am.', 'Can I try a free class?'),
          pago: A('We take cash, card and Apple Pay.', 'Cash, card or Apple Pay.', 'Do you take card?') },
        otro: 'Do you have a trainer for injuries?' }
    ];
    this.toneDefs = ['Warm and friendly', 'Short and direct', 'Formal', 'Playful'];
    this.skillDefs = [
      { id: 'precio', label: 'Prices and availability' },
      { id: 'horario', label: 'Hours and location' },
      { id: 'apartar', label: 'Holds and appointments' },
      { id: 'pago', label: 'Payments and shipping' }
    ];
    this.intentKeys = {
      precio: ['price', 'how much', 'cost', 'available', 'still', 'sell', '$', 'lowest'],
      horario: ['hour', 'time', 'open', 'close', 'when', 'what day', 'days'],
      ubicacion: ['where', 'location', 'address', 'pick up', 'pickup', 'located'],
      apartar: ['hold', 'reserve', 'book', 'appointment', 'table', 'spot', 'showing', 'opening', 'try', 'save'],
      pago: ['pay', 'card', 'cash', 'venmo', 'zelle', 'paypal', 'ship', 'deliver', 'fha', 'loan', 'financ']
    };
    this.initScen();
    this.intentSkill = { precio: 'precio', horario: 'horario', ubicacion: 'horario', apartar: 'apartar', pago: 'pago' };
  }
  initScen() {
    var L = {
      locale: 'en-US', tabs: ['Resale & clothing', 'Nails', 'Sushi & coffee'], kicker: 'Example · ', title: 'What Neuri does in this chat',
      hint: 'Tap the replies on the phone or type them yourself.', restart: 'Start over', inputPh: 'Type or tap an option…',
      hash: '#signup', done: ' (done)', pending: ' (pending)', listLabel: 'Steps in this chat',
      money: function (n) { return '$' + n.toFixed(2); },
      nails: { name: 'Nails by Caro', svc: 'gel manicure', price: '$35',
        intro: 'A client asks if you have a spot. You’re with someone else; Neuri checks your calendar and books it.',
        cta: 'Get my booking assistant', ask: 'Hi, do you have a spot Saturday for a gel manicure?',
        offer: function (list) { return 'For gel manicure I have these times:\n' + list + '\nReply with the number (1, 2 or 3).'; },
        confirm: function (w) { return 'Done! Your gel manicure appointment is set for ' + w + ' ($35). To change or cancel it, message me "cancel my appointment".'; },
        deposit: 'To hold your spot, leave the $10 deposit here: pay.example/nailsbycaro. Your appointment is confirmed once the business sees it.',
        reminder: function (w) { return 'The day before, they get: “Reminder: your gel manicure appointment is tomorrow, ' + w + ', at Nails by Caro.”'; },
        tagOffer: 'Open times from your calendar', tagConfirm: 'Booked by Neuri', tagDeposit: 'Only if you add your deposit link',
        list: ['Offers 3 open times from your calendar', 'Books the one they pick and confirms the price', 'Asks for a deposit with your link, if you add one', 'Reminds them the day before and the same day'] },
      food: { name: 'Sushi Kai', roll: 'California Roll', rollPrice: 9, coffees: [['Americano', 3], ['Latte', 4.5]],
        intro: 'Orders come in by DM while you cook. Neuri takes the order with your menu and hands it to you ready.',
        cta: 'Get my food assistant', ask: 'I want 2 california rolls and a coffee', which: 'Which coffee?',
        cart: function (lines, sub) { return 'Your order:\n' + lines + '\nSubtotal: ' + sub + '\nAnything else?'; },
        doneLabel: 'That’s all', time: 'What time?\n1. As soon as possible (around 2:20 PM)\nOr tell me a time, e.g. "at 3".',
        asapLabel: '1 · As soon as possible', asapKey: 'soon', at3: 'At 3', ats: ['today at 2:20 PM', 'today at 3:00 PM'],
        confirm: function (lines, total, at) { return 'Done! Your order #12:\n' + lines + '\nTotal: ' + total + '\nPickup, ready ' + at + '. I’ll message you here when it’s ready.'; },
        ready: 'When you mark it Ready, they get: “Your order #12 is ready! You can pick it up at Sushi Kai.”',
        tagMenu: 'From your menu', tagCart: 'Totaled with your prices', tagTime: 'Within your kitchen hours', tagConfirm: 'Lands in Today’s orders',
        list: ['Understands the order and asks what’s missing', 'Totals it with your prices', 'Asks what time, within your hours', 'Confirms with total and order number', 'Sends “ready” when you mark it'] }
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
    var n = (st.name || '').trim() || 'your business';
    return [
      'Hi! I’m the assistant for ' + n + '. How can I help?',
      'Hi, how can I help?',
      'Good day. This is the assistant for ' + n + '. How may I assist you?',
      'Hey there! ' + n + ' assistant here. Ask me anything!'
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
      if (hit) a = { t: hit.n + ' is ' + hit.p + (asksAv ? ' and yes, it’s available' : '') + '.', s: hit.n + ': ' + hit.p + '.' + (asksAv ? ' Available.' : '') };
      else { var lst = own.map(function (o) { return o.n + ' ' + o.p; }).join(', '); a = { t: 'We have: ' + lst + '. Which one interests you?', s: lst + '.' }; }
    } else if (intent === 'precio' && biz.soloPrecio && !/disponible|sigue|todav|hay|still|availab|have/i.test(q || '')) a = biz.soloPrecio;
    var t = this.state.tone;
    if (t === 0) return 'Sure! ' + a.t + ' Anything else I can help with?';
    if (t === 1) return a.s;
    if (t === 2) return 'Happy to help: ' + a.s;
    return 'You got it! ' + a.t + ' See you soon!';
  }
  handoff() {
    var o = this.bizCur().owner;
    return [
      'Good question. I’ll pass it to ' + o + ' for a reply shortly.',
      'Checking with ' + o + '. I’ll let you know.',
      'Allow me to check with ' + o + '. We’ll reply shortly.',
      'Ooh, ' + o + ' will answer that one personally! Already let them know.'
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
      var tag = handed ? 'Passed to ' + self.bizCur().owner : 'Answered by Neuri in ' + secs + ' s';
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
    var slug = ((st.name || '').toLowerCase().normalize ? (st.name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') : (st.name || '').toLowerCase()).replace(/[^a-z0-9]/g, '') || 'yourbusiness';
    var nm = (st.name || '').trim() || 'Your business';
    var ini = nm.split(/\s+/).filter(function (w) { return w.length > 2 || /^[A-ZÁÉÍÓÚ]/.test(w); }).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('') || 'YB';
    var enabledIntents = ['precio', 'apartar', 'horario', 'pago', 'ubicacion'].filter(function (i) { return st.skills[self.intentSkill[i]]; });
    var suggList = enabledIntents.slice(0, 3).map(function (i) { return { label: biz.ans[i].q, intent: i }; }).concat([{ label: biz.otro, intent: null }]);
    if (sc) { var stp = sc.steps[st.sStep]; suggList = stp ? stp.opts.map(function (o, i) { return { label: o.label, act: function () { self.scriptRun(i); } }; }) : [{ label: LL.restart, act: function () { self.setScenario(st.scen); } }]; }
    var checkTexts = ['Learning your business: ' + biz.label.toLowerCase(), 'Writing replies that sound ' + this.toneDefs[st.tone].toLowerCase(), 'Connecting Instagram and Messenger'];
    var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
    var lostT = this.lostTarget(st);
    var be = Math.max(1, Math.ceil(49 / st.lcTicket));
    var sliders = [
      { key: 'msgs', label: 'Messages you get per day', min: 5, max: 200, step: 5, value: st.lcMsgs, display: st.lcMsgs, field: 'lcMsgs' },
      { key: 'late', label: 'Of those, how many get a late answer or none?', min: 10, max: 90, step: 5, value: st.lcLate, display: st.lcLate + '%', field: 'lcLate' },
      { key: 'close', label: 'Out of 100 you do answer, how many buy?', min: 5, max: 50, step: 1, value: st.lcClose, display: st.lcClose + '%', field: 'lcClose' },
      { key: 'ticket', label: 'Your average sale', min: 10, max: 1000, step: 5, value: st.lcTicket, display: money(st.lcTicket), field: 'lcTicket' }
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
      breakEven: be === 1 ? 'Win back 1 sale a month and it pays for itself.' : 'Win back ' + be + ' sales a month and it pays for itself.',
      ownFilters: [['all', 'All · ' + rowsAll.length], ['hand', 'Passed to you · ' + hasHand], ['apart', 'On hold · ' + hasApart]].map(function (f) {
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
        { need: 'Answers at 2 am', a: 'Only if you’re awake', b: 'Only on their shift', c: 'Yes', d: 'Yes, always', aC: R, bC: R, cC: N },
        { need: 'What it costs', a: 'Your time and your sleep', b: 'A paycheck every month', c: 'A plan plus your hours building it', d: 'From $49 a month', aC: N, bC: R, cC: N },
        { need: 'Ready in', a: 'Now', b: 'Weeks of hiring and training', c: 'Days or weeks', d: 'Sets itself up in minutes', aC: G, bC: R, cC: R },
        { need: 'Uses your prices, never makes them up', a: 'Yes', b: 'Once they learn them', c: 'Depends on how you build it', d: 'Answers only from your sheet', aC: G, bC: N, cC: N },
        { need: 'Hands you the tricky ones', a: 'N/A', b: 'Yes', c: 'If you program it', d: 'Haggling and odd questions go to you', aC: N, bC: G, cC: N },
        { need: 'No tech skills needed', a: 'Yes', b: 'Yes', c: 'No', d: 'Yes, we build it for you', aC: G, bC: G, cC: R }
      ],
      faqs: [
        { q: 'What if it gets something wrong?', a: 'It only answers from your sheet. If a buyer asks something it doesn’t know, it doesn’t make things up: it passes you the conversation and tells the buyer you’ll reply. You can pause it anytime.' },
        { q: 'What do I need to get started?', a: 'Your Instagram account or Facebook Page, and a sheet with your items or services, prices, pickup or delivery, and payment options. Sign-up takes 3 minutes.' },
        { q: 'Can I try it first?', a: 'Yes. We give you a test code so you can message it from your personal account and see how it answers before turning it on for your buyers.' },
        { q: 'What about WhatsApp?', a: 'It’s on the way. We’re opening Instagram and Messenger first (pending Meta’s approval); as soon as WhatsApp is ready, we’ll let you know so you can connect it.' },
        { q: 'Can I cancel?', a: 'Yes, anytime. It’s billed month to month with no contract.' },
        { q: 'Do you charge per message or per contact?', a: 'No. You pay the same flat monthly price no matter how many buyers message you: there’s no per-contact or per-message fee. For safety, each account answers up to 1,000 messages a day.' },
        { q: 'Who helps me if something breaks?', a: 'In My assistant, tap “Something’s not right”: it checks your Instagram, your sheet and whether it’s paused, and gives you a button to fix each one. If it still doesn’t work, it goes to a person at Neuri and we reply by email.' },
        { q: 'What about Marketplace’s own auto-reply?', a: 'Facebook already has an auto-reply for “is this still available?” inside Marketplace. neuri.bots answers on your Instagram and on your Facebook Page’s Messenger: prices, delivery, holds and your link for people who comment, using the info in your sheet. If you only sell on Marketplace from your personal profile, Facebook’s reply may be enough.' },
        { q: 'Why not use Instagram’s built-in auto-replies?', a: 'Instagram’s built-in replies greet a first message and send an away message, and they’re free: if that’s all you need, use them. neuri.bots answers each different question with the info in your sheet (still available, price, delivery, holds) and DMs your link to people who comment on your posts.' },
        { q: 'Do I get a receipt or invoice?', a: 'Yes, a receipt: once billing starts, every payment has a receipt you can download from the Stripe billing portal, which you open from My assistant. Neuri LLC is a US company; we don’t issue Mexican CFDI invoices yet.' },
        { q: 'What happens when the 7-day trial ends?', a: 'Three days before, you get an email to add your card; nothing is charged before the trial ends. If you don’t add it, you get a 5-day grace period, then your assistant pauses, with nothing deleted. No surprise charges.' },
        { q: 'Is anyone using it yet?', a: 'We’re opening with our first 10 sellers. That’s why setup is free and you get a 7-day free trial: all we ask in return is your honest feedback.' }
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
      waShare: 'https://wa.me/?text=' + encodeURIComponent('My neuri.bots demo with my products: ' + 'https://neuri.tech/en/still-available/?' + ((st.nameEdited && String(st.name || '').trim()) ? 'business=' + encodeURIComponent(String(st.name).trim().slice(0, 36)) + '&' : '') + 'products=' + encodeURIComponent(String(st.prods || '').trim().slice(0, 160)) + '&src=demo-wa'),
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
      buildLabel: building ? 'Neuri is building your bot…' : (ready ? 'Bot ready · try it on the phone' : 'Build my bot'),
      buildStyle: 'font: inherit; border: none; font-weight: 700; font-size: 18px; padding: 18px 22px; border-radius: 16px; min-height: 60px; display: flex; align-items: center; justify-content: center; gap: 10px; ' + (building ? 'background: #24372E; color: #8FA79A; cursor: default;' : (ready ? 'background: #24372E; color: #8FE0B4; cursor: pointer; border: 1.5px solid #8FE0B4;' : 'background: #8FE0B4; color: #05080D; cursor: pointer;')),
      showChecks: st.phase !== 'setup',
      checks: checkTexts.map(function (t, i) {
        var done = st.bChecks > i; var active = building && st.bChecks === i;
        return { text: t, done: done, active: active, pending: !done && !active, rowStyle: done ? 'color: #FFFFFF;' : (active ? 'color: #8FE0B4;' : 'color: #6B8577;') };
      }),
      chList: ['ig', 'fb', 'wa'].map(function (k) {
        var on = st.ch === k;
        return { label: k === 'wa' ? 'WhatsApp · soon' : CH[k].label, icon: CH[k].icon, selected: on ? 'true' : 'false',
          style: 'font: inherit; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; font-weight: 700; font-size: 14px; padding: 9px 14px; border-radius: 999px; border: none; min-height: 40px; ' + (on ? 'background: #FFFFFF; color: #05080D;' : 'background: transparent; color: #C5D2CB;'),
          pick: function () { self.setState({ ch: k }); } };
      }),
      phoneBodyStyle: 'background: ' + c.body + '; border-radius: 34px; overflow: hidden; color: #05080D; display: flex; flex-direction: column;',
      phHeadStyle: 'background: ' + c.head + '; color: ' + c.headText + '; padding: 18px; display: flex; align-items: center; gap: 12px; ' + c.border,
      phSubStyle: 'font-size: 12px; color: ' + c.sub,
      bizIni: ini,
      phTitle: st.ch === 'ig' ? slug : nm,
      phSub: st.ch === 'wa' ? 'WhatsApp coming soon · preview' : st.typing ?'typing…' : (ready ? (st.ch === 'ig' ? nm + ' · replies instantly' : 'online · replies instantly') : 'Your bot isn’t built yet'),
      phIdle: !ready,
      idleText: building ? 'Building your bot…' : 'Set up your bot and tap “Build my bot.”',
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
      inputPh: sc ? LL.inputPh : ready ? 'Message it like a buyer…' : 'Build your bot first',
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
      status: typing ? 'Neuri is typing…' : 'online · replies instantly'
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
    // v3: la demo ya no está en el hero; se monta igual en un rato libre después de cargar (como antes) aunque no se vea
    later();
  } else { __nBoot(); }
})();
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('[data-scenario]');
  if (a) __nBoot().setScenario(a.getAttribute('data-scenario'));
});
