/* Lightweight progressive enhancements; all core content is in static HTML. */
(()=>{'use strict';
document.documentElement.classList.add('js');
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
const hero=document.querySelector('.hero');const contact=document.getElementById('contact')||document.querySelector('.contact-section, .contact-standalone');const footer=document.getElementById('footer');
function updateFloating(){if(!floating)return;const pastHero=hero? !heroVisible :scrollY>430;floating.classList.toggle('is-visible',pastHero&&!contactVisible&&!footerVisible)}
if('IntersectionObserver'in window){if(hero)new IntersectionObserver(es=>{heroVisible=es[0].isIntersecting;updateFloating()},{threshold:.04}).observe(hero);if(contact)new IntersectionObserver(es=>{contactVisible=es[0].isIntersecting;updateFloating()},{threshold:0}).observe(contact);if(footer)new IntersectionObserver(es=>{footerVisible=es[0].isIntersecting;updateFloating()},{threshold:0}).observe(footer)}
window.addEventListener('scroll',()=>{header?.classList.toggle('has-scrolled',scrollY>14);updateFloating()},{passive:true});updateFloating();
const links=[...document.querySelectorAll('.desktop-nav [data-nav],.mobile-menu [data-nav]')];
if(document.body.classList.contains('home-page')&&'IntersectionObserver'in window){const targets={home:'home',about:'about',process:'process',faq:'faq'};const spy=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);if(!visible.length)return;let selected=Object.keys(targets).find(k=>targets[k]===visible[0].target.id);if(selected)links.forEach(a=>a.classList.toggle('is-active',a.dataset.nav===selected))},{rootMargin:'-21% 0px -49% 0px',threshold:[0,.1,.5]});Object.values(targets).forEach(k=>{const el=document.getElementById(k);if(el)spy.observe(el)})}
if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const reveals=[...document.querySelectorAll('.reveal')];const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-revealed');observer.unobserve(e.target)}})},{rootMargin:'0px 0px -40px 0px',threshold:.06});reveals.forEach(el=>{const bounds=el.getBoundingClientRect();if(bounds.top<innerHeight*.95)el.classList.add('is-revealed');else observer.observe(el)});document.body.classList.add('motion-ready')}

// Three testimonial demos: arrows switch cards in a compact, non-scrolling mobile carousel.
const reviewCards=[...document.querySelectorAll('.reviews-grid .review-card')];
const reviewNext=document.querySelector('.review-next');const reviewPrev=document.querySelector('.review-prev');const reviewPage=document.querySelector('.reviews-page');
let reviewIndex=0;
function showReview(i){if(!reviewCards.length)return;reviewIndex=(i+reviewCards.length)%reviewCards.length;
 reviewCards.forEach((c,j)=>{c.classList.toggle('is-active',j===reviewIndex);c.setAttribute('aria-hidden',String(matchMedia('(max-width:680px)').matches&&j!==reviewIndex))});
 if(reviewPage)reviewPage.textContent=(reviewIndex+1)+' מתוך '+reviewCards.length;}
if(reviewCards.length){showReview(0);reviewNext?.addEventListener('click',()=>showReview(reviewIndex+1));reviewPrev?.addEventListener('click',()=>showReview(reviewIndex-1));
 matchMedia('(max-width:680px)').addEventListener?.('change',()=>showReview(reviewIndex));}

const message='היי דניאל, הגעתי דרך האתר ואשמח לתאם שיחת היכרות בנושא הדרכת הורים.';
const normalizePhone=str=>String(str||'').replace(/[^\d]/g,'');
document.querySelectorAll('[data-contact]').forEach(a=>{a.addEventListener('click',e=>{const type=a.dataset.contact;let url='';if(type==='whatsapp'&&normalizePhone(config.whatsappNumber))url='https://wa.me/'+normalizePhone(config.whatsappNumber)+'?text='+encodeURIComponent(message);
if(type==='phone'&&normalizePhone(config.phone))url='tel:'+normalizePhone(config.phone);
if(type==='email'&&config.email)url='mailto:'+config.email+'?subject='+encodeURIComponent('פנייה מהאתר – הדרכת הורים');
if(type==='instagram'&&/^https:\/\//.test(config.instagram||''))url=config.instagram;
if(type==='facebook'&&/^https:\/\//.test(config.facebook||''))url=config.facebook;
if(url){e.preventDefault();if(type==='whatsapp'||type==='instagram'||type==='facebook')window.open(url,'_blank','noopener,noreferrer');else location.href=url}
else{e.preventDefault();if(type==='instagram'||type==='facebook')notify('הקישור לרשת החברתית יתווסף לאחר הגדרת הפרטים.');else{const dest=document.getElementById('contact');if(dest){dest.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});notify('פרטי ההתקשרות עדיין לא הוגדרו. אפשר להשתמש בטופס לאחר חיבור שירות השליחה.')}else{location.href=a.href}}}})});
// No false success claims: a backend must confirm the submission.
for(const form of document.querySelectorAll('.contact-form')){
 form.addEventListener('submit',async e=>{
  e.preventDefault();const feedback=form.querySelector('.form-feedback');
  const tel=form.querySelector('input[name="phone"]');const phoneDigits=String(tel?.value||'').replace(/[^\d]/g,'');
  if(!form.checkValidity()||phoneDigits.length<9){const bad=phoneDigits.length<9?tel:form.querySelector(':invalid');bad?.focus();if(feedback)feedback.textContent='יש להזין שם ומספר טלפון תקין כדי לשלוח את הפנייה.';return;}
  const isNetlify=location.hostname.endsWith('.netlify.app')||config.formProvider==='netlify';
  const endpoint=String(config.formEndpoint||'').trim();const isExternal=/^https:\/\/formspree\.io\/f\/[\w-]+$/.test(endpoint);
  if(!isNetlify&&!isExternal){if(feedback)feedback.textContent='טופס הפנייה עדיין לא מחובר לשירות שליחה. ניתן לפנות דרך פרטי הקשר לאחר הגדרתם.';return;}
  const button=form.querySelector('[type="submit"]');const oldLabel=button?.innerHTML;
  if(button){button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='הפנייה נשלחת…'}
  if(feedback)feedback.textContent='';
  try {const fields=new FormData(form);const res=isExternal?await fetch(endpoint,{method:'POST',headers:{'Accept':'application/json'},body:fields}):await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(fields).toString()});if(!res.ok)throw new Error('HTTP '+res.status);
   location.href=form.getAttribute('action')||'/thanks/';
  }catch{if(feedback)feedback.textContent='לא הצלחנו לשלוח את הפנייה. אנא נסו שוב או פנו בדרך חלופית.'}
  finally{if(button){button.disabled=false;button.removeAttribute('aria-busy');button.innerHTML=oldLabel}}
 });
 form.querySelectorAll('input').forEach(el=>el.addEventListener('input',()=>{el.setAttribute('aria-invalid',String(!el.checkValidity()&&el.value.length>0));const fb=form.querySelector('.form-feedback');if(fb)fb.textContent=''}));
}
const filters=[...document.querySelectorAll('[data-filter]')];if(filters.length){const cards=[...document.querySelectorAll('.blog-cards [data-category]')];filters.forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.filter;filters.forEach(c=>{c.classList.toggle('is-active',b===c);c.setAttribute('aria-pressed',String(b===c))});cards.forEach(c=>{c.hidden=(f!=='all'&&c.dataset.category!==f)})}))}
})();
