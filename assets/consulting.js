document.documentElement.classList.add('js');
(()=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');
if(e.target.id==='funnel')e.target.querySelectorAll('.bar i').forEach(i=>i.style.width=i.dataset.w+'%');
if(e.target.id==='prog')e.target.querySelector('i').style.width='100%';io.unobserve(e.target)}),{threshold:.25});
document.querySelectorAll('.rv,#funnel,#prog').forEach(el=>io.observe(el));})();