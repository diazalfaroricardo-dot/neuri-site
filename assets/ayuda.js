// J3-bots: ayuda antes del alta. Un prospecto escribe su duda y se contesta al instante con la FAQ de la
// página (JSON-LD = una sola fuente de verdad, sin backend ni IA). Solo si no hay respuesta aparece el correo.
// dc-lite reemplaza el HTML estático con su plantilla, así que la caja se inyecta (y se re-inyecta) por JS.
(function (g) {
  var STOP = "a al como con de del el en es la las lo los me mi mis o para por que qué se si su sus te tu un una y yo hay puedo puede tengo the a an and are can do does i if is it my of on or to what how you your me".split(" ");
  // Sinónimos por posición de la FAQ (mismo orden en ES y EN).
  var SYN = [
    "bloquear bloqueo bloquean ban banear seguro segura riesgo oficial pirata blocked block banned safe risk official",
    "mal error equivoca inventa falla respuesta incorrecta wrong mistake mistakes invent incorrect",
    "empezar empiezo necesito requisitos inicio arrancar alta registro start need requirements sign signup",
    "probar prueba demo gratis antes test try trial free",
    "whatsapp wa",
    "cancelar cancelo contrato plazo salir baja permanencia cancel contract quit leave",
    "cobran cobro costo cuesta precio precios mensaje mensajes contacto contactos cuanto charge charges cost price pricing per message contact much",
    "ayuda soporte falla problema persona humano funciona help support broken breaks problem person human works",
    "marketplace facebook perfil personal",
    "instagram nativa nativas nativo trae incluidas saludo ausencia built native included greeting away",
    "termina mes gratis tarjeta cargo cargos sorpresa pagar ends free month card charged surprise pay",
    "usa clientes alguien negocios opiniones usando using anyone customers reviews sellers",
  ];
  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ ]+/g, " ");
  }
  function toks(s) {
    return norm(s).split(/\s+/).filter(function (t) { return t.length > 1 && STOP.indexOf(t) < 0; });
  }
  // Devuelve {i, q, a} de la mejor pregunta o null si nada encaja.
  function ayudaMatch(query, faqs) {
    var qt = toks(query);
    if (!qt.length) return null;
    var best = null, bestScore = 0;
    faqs.forEach(function (f, i) {
      var keys = toks(f.q + " " + (SYN[i] || ""));
      var score = 0;
      qt.forEach(function (t) {
        for (var k = 0; k < keys.length; k++) {
          var key = keys[k];
          if (key === t || (t.length > 4 && key.length > 4 && (key.indexOf(t.slice(0, 5)) === 0))) { score++; break; }
        }
      });
      if (score > bestScore) { bestScore = score; best = { i: i, q: f.q, a: f.a }; }
    });
    return bestScore > 0 ? best : null;
  }
  g.ayudaMatch = ayudaMatch;
  if (typeof document === "undefined") return;

  function faqsFromPage() {
    var out = [];
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function (s) {
      try {
        var j = JSON.parse(s.textContent);
        (j["@graph"] || [j]).forEach(function (n) {
          if (n["@type"] === "FAQPage") n.mainEntity.forEach(function (q) { out.push({ q: q.name, a: q.acceptedAnswer.text }); });
        });
      } catch (e) {}
    });
    return out;
  }
  var en = (document.documentElement.lang || "es").indexOf("en") === 0;
  var T = en
    ? { h: "Have a question? Ask it here", ph: "e.g. Do I need a contract?", btn: "Ask", none: "We don’t have that answer here yet.", mail: "Email us and we’ll reply", from: "From the FAQ:", ex: "Try: “how much is it”, “can I cancel”, “WhatsApp”." }
    : { h: "¿Tienes una duda? Pregúntala aquí", ph: "Ej. ¿Hay contrato?", btn: "Preguntar", none: "Esa todavía no la tenemos aquí.", mail: "Escríbenos y te contestamos", from: "De las preguntas frecuentes:", ex: "Prueba: «cuánto cuesta», «puedo cancelar», «WhatsApp»." };

  // La plantilla de escritorio se vuelve a clonar al animar el demo (ver A247): guardamos lo escrito y la
  // última respuesta para restaurarlos cuando la caja se re-inyecta.
  var state = { q: "", asked: "", focus: false };
  function mount() {
    var sec = document.getElementById("preguntas") || document.getElementById("faq-section");
    if (!sec || sec.querySelector("#ayuda-box")) return;
    var h2 = sec.querySelector("h2");
    if (!h2) return;
    var box = document.createElement("form");
    box.id = "ayuda-box";
    box.setAttribute("role", "search");
    box.style.cssText = "display:flex;flex-direction:column;gap:10px;background:#F4F6F1;border:1px solid #E1E3DC;border-radius:16px;padding:18px";
    box.innerHTML =
      '<label for="ayuda-q" style="font-weight:700;font-size:17px">' + T.h + "</label>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><input id="ayuda-q" name="q" type="search" autocomplete="off" placeholder="' + T.ph + '" style="flex:1 1 220px;min-height:48px;font-size:17px;padding:10px 14px;border:1px solid #8A948D;border-radius:12px;background:#fff;color:#0E1512">' +
      '<button type="submit" style="min-height:48px;padding:0 20px;border:0;border-radius:12px;background:#0B5E3A;color:#fff;font-weight:700;font-size:16px;cursor:pointer">' + T.btn + "</button></div>" +
      '<p id="ayuda-ex" style="margin:0;font-size:14px;color:#4A554F">' + T.ex + "</p>" +
      '<div id="ayuda-r" role="status" aria-live="polite" style="font-size:16px;line-height:1.5"></div>';
    h2.insertAdjacentElement("afterend", box);
    var inp = box.querySelector("#ayuda-q");
    inp.value = state.q;
    inp.addEventListener("input", function () { state.q = inp.value; });
    inp.addEventListener("focus", function () { state.focus = true; });
    inp.addEventListener("blur", function () { state.focus = false; });
    if (state.focus) inp.focus();
    if (state.asked) answer(box, sec, state.asked, false);
    box.addEventListener("submit", function (e) {
      e.preventDefault();
      state.q = state.asked = inp.value;
      answer(box, sec, inp.value, true);
    });
  }
  function answer(box, sec, q, track) {
      var r = box.querySelector("#ayuda-r");
      var m = ayudaMatch(q, faqsFromPage());
      r.textContent = "";
      if (m) {
        var p1 = document.createElement("p"); p1.style.margin = "0 0 4px"; p1.style.color = "#4A554F"; p1.style.fontSize = "14px"; p1.textContent = T.from;
        var p2 = document.createElement("p"); p2.style.margin = "0"; var b = document.createElement("b"); b.textContent = m.q + " "; p2.appendChild(b); p2.appendChild(document.createTextNode(m.a));
        r.appendChild(p1); r.appendChild(p2);
        sec.querySelectorAll("summary").forEach(function (s) { if (s.textContent.trim().indexOf(m.q) === 0 && s.parentElement) s.parentElement.open = true; });
      } else {
        var p = document.createElement("p"); p.style.margin = "0"; p.textContent = T.none + " ";
        var a = document.createElement("a"); a.href = "mailto:hola@neuri.tech?subject=" + encodeURIComponent((en ? "Question neuri.bots: " : "Duda neuri.bots: ") + q.slice(0, 80)); a.textContent = T.mail; a.style.color = "#0B5E3A"; a.style.fontWeight = "700";
        p.appendChild(a); r.appendChild(p);
      }
      if (track) try { g.posthog && g.posthog.capture && g.posthog.capture("ayuda_landing", { encontrada: !!m, i: m ? m.i : -1 }); } catch (e2) {}
  }
  function start() {
    mount();
    new MutationObserver(function () { mount(); }).observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})(typeof window !== "undefined" ? window : globalThis);
