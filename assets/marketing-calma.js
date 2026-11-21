/* DESPUÉS: las animaciones GSAP infinitas (salvo el listón) corren una vez, cortas, al entrar a su sección. */
(function(){var g=window.gsap;if(!g)return;
function el0(t){try{return typeof t==="string"?document.querySelector(t):(t&&t.nodeType?t:(t&&t[0]))}catch(e){return null}}
function fix(t,v){if(!v||v.repeat!==-1)return v;var el=el0(t);if(el&&el.matches&&el.matches(".track"))return v;
v.repeat=0;v.yoyo=false;v.repeatDelay=0;if(typeof v.duration==="number")v.duration=Math.min(v.duration,3.2);
var sec=el&&el.closest&&el.closest("section,header,footer");
if(sec&&!v.scrollTrigger&&window.ScrollTrigger){v.scrollTrigger={trigger:sec,start:"top 85%",toggleActions:"play none none none"}}return v}
var to=g.to.bind(g),ft=g.fromTo.bind(g);
g.to=function(t,v){return to(t,fix(t,v))};g.fromTo=function(t,a,b){return ft(t,a,fix(t,b))};})();
