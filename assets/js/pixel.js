'use strict';
const menu=document.querySelector('.mobile-menu');
const nav=document.querySelector('.primary-nav');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));menu.setAttribute('aria-label',open?'פתיחת תפריט':'סגירת תפריט');nav?.classList.toggle('open',!open)});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu?.setAttribute('aria-expanded','false');nav.classList.remove('open')}));
document.getElementById('year').textContent=new Date().getFullYear();
const f=document.getElementById('contact-form');
f?.addEventListener('submit',e=>{e.preventDefault();const msg=document.getElementById('form-message');const name=f.elements.name.value.trim();const phone=f.elements.phone.value.replace(/[^\d+]/g,'');if(name.length<2||phone.length<9){msg.textContent='אנא מלאו שם וטלפון תקין.';return;}msg.textContent='הטופס נמצא בגרסת הדגמה. פרטי הקשר וערוץ השליחה יחוברו לפני פרסום האתר.';});
