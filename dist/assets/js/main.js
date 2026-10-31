/* Lightweight progressive enhancements; all core content is in static HTML. */
(()=>{'use strict';
const config=window.DANIEL_SITE||{};
const header=document.querySelector('.site-header');
const toggle=document.querySelector('.menu-toggle');
const menu=document.querySelector('.mobile-menu');
const toast=document.getElementById('action-status');
function notify(msg){if(!toast)return;toast.textContent=msg;toast.classList.add('is-visible');clearTimeout(notify.t);notify.t=setTimeout(()=>toast.classList.remove('is-visible'),6000)}
function setMenu(open){if(!menu||!toggle)return;menu.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'סגירת תפריט ניווט':'פתיחת תפריט ניווט');menu.inert=!open;document.body.classList.toggle('menu-is-open',open&&innerWidth<=870)}
if(toggle){toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){setMenu(false);toggle.focus()}});document.addEventListener('click',e=>{if(menu?.classList.contains('is-open')&&!header?.contains(e.target))setMenu(false)});menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)))}
window.addEventListener('resize',()=>{if(innerWidth>870)setMenu(false)},{passive:true});
const floating=document.getElementById('floating-cta');let heroVisible=true,contactVisible=false,footerVisible=false;
const hero=document.querySelector('.hero');const contact=document.getElementById('contact');const footer=document.getElementById('footer');
function updateFloating(){if(!floating)return;const pastHero=hero? !heroVisible :scrollY>430;floating.classList.toggle('is-visible',pastHero&&!contactVisible&&!footerVisible)}
if('IntersectionObserver'in window){if(hero)new IntersectionObserver(es=>{heroVisible=es[0].isIntersecting;updateFloating()},{threshold:.04}).observe(hero);if(contact)new IntersectionObserver(es=>{contactVisible=es[0].isIntersecting;updateFloating()},{threshold:0}).observe(contact);if(footer)new IntersectionObserver(es=>{footerVisible=es[0].isIntersecting;updateFloating()},{threshold:0}).observe(footer)}
window.addEventListener('scroll',()=>{header?.classList.toggle('has-scrolled',scrollY>14);updateFloating()},{passive:true});updateFloating();
const links=[...document.querySelectorAll('.desktop-nav [data-nav],.mobile-menu [data-nav]')];
if(document.body.classList.contains('home-page')&&'IntersectionObserver'in window){const targets={home:'home',about:'about',process:'process',faq:'faq'};const spy=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);if(!visible.length)return;let selected=Object.keys(targets).find(k=>targets[k]===visible[0].target.id);if(selected)links.forEach(a=>a.classList.toggle('is-active',a.dataset.nav===selected))},{rootMargin:'-21% 0px -49% 0px',threshold:[0,.1,.5]});Object.values(targets).forEach(k=>{const el=document.getElementById(k);if(el)spy.observe(el)})}
if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const reveals=[...document.querySelectorAll('.reveal')];const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-revealed');observer.unobserve(e.target)}})},{rootMargin:'0px 0px -40px 0px',threshold:.06});reveals.forEach(el=>{const bounds=el.getBoundingClientRect();if(bounds.top<innerHeight*.95)el.classList.add('is-revealed');else observer.observe(el)});document.body.classList.add('motion-ready')}
const message='היי דניאל, הגעתי דרך האתר ואשמח לתאם שיחת היכרות בנושא הדרכת הורים.';
const normalizePhone=str=>String(str||'').replace(/[^\d]/g,'');
document.querySelectorAll('[data-contact]').forEach(a=>{a.addEventListener('click',e=>{const type=a.dataset.contact;let url='';if(type==='whatsapp'&&normalizePhone(config.whatsappNumber))url='https://wa.me/'+normalizePhone(config.whatsappNumber)+'?text='+encodeURIComponent(message);
if(type==='phone'&&normalizePhone(config.phone))url='tel:'+normalizePhone(config.phone);
if(type==='email'&&config.email)url='mailto:'+config.email+'?subject='+encodeURIComponent('פנייה מהאתר – הדרכת הורים');
if(type==='instagram'&&/^https:\/\//.test(config.instagram||''))url=config.instagram;
if(type==='facebook'&&/^https:\/\//.test(config.facebook||''))url=config.facebook;
if(url){e.preventDefault();if(type==='whatsapp'||type==='instagram'||type==='facebook')window.open(url,'_blank','noopener,noreferrer');else location.href=url}
else{e.preventDefault();if(type==='instagram'||type==='facebook')notify('הקישור לרשת החברתית יתווסף לאחר הגדרת הפרטים.');else{const dest=document.getElementById('contact');if(dest){dest.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});notify('פרטי ההתקשרות עדיין לא הוגדרו. אפשר להשתמש בטופס לאחר חיבור שירות השליחה.')}else{location.href=a.href}}}})});
const form=document.querySelector('.contact-form');if(form){form.addEventListener('submit',e=>{const feedback=form.querySelector('.form-feedback');if(!form.checkValidity()){e.preventDefault();const bad=form.querySelector(':invalid');bad?.focus();if(feedback)feedback.textContent='יש למלא שם ומספר טלפון תקין כדי לשלוח את הפנייה.';return}
const host=location.protocol==='file:'||['localhost','127.0.0.1'].includes(location.hostname);if(host){e.preventDefault();if(feedback)feedback.textContent='הטופס יוכל לשלוח פניות לאחר פרסום באתר התומך ב־Netlify Forms. בתצוגה המקומית אין שליחה.'}}
);form.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input',()=>{el.setAttribute('aria-invalid',String(!el.checkValidity()&&el.value.length>0));const fb=form.querySelector('.form-feedback');if(fb)fb.textContent=''}))}
const filters=[...document.querySelectorAll('[data-filter]')];if(filters.length){const cards=[...document.querySelectorAll('.blog-cards [data-category]')];filters.forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.filter;filters.forEach(c=>{c.classList.toggle('is-active',b===c);c.setAttribute('aria-pressed',String(b===c))});cards.forEach(c=>{c.hidden=(f!=='all'&&c.dataset.category!==f)})}))}
})();
