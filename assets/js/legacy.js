(() => {
  'use strict';
  document.querySelectorAll('[data-year]').forEach(el => {el.textContent = new Date().getFullYear();});
  const menu = document.querySelector('.menu-button');
  const nav = document.querySelector('#primary-navigation');
  const closeMenu = () => {
    if (!menu || !nav) return;
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label','פתיחת התפריט');
    const svgUse = menu.querySelector('use');
    if (svgUse) svgUse.setAttribute('href','#ico-menu');
  };
  if(menu && nav) {
    menu.addEventListener('click', () => {
      const next = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open',next);
      menu.setAttribute('aria-expanded',String(next));
      menu.setAttribute('aria-label', next ? 'סגירת התפריט' : 'פתיחת התפריט');
      menu.querySelector('use')?.setAttribute('href',next?'#ico-close':'#ico-menu');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
    document.addEventListener('click',e=>{if(!nav.contains(e.target) && !menu.contains(e.target))closeMenu();});
    window.addEventListener('resize',()=>{if(window.innerWidth>920)closeMenu();});
  }
  // Only show the mobile sticky contact CTA after the hero CTA has left view.
  const heroActions = document.querySelector('.hero-actions');
  if (heroActions && 'IntersectionObserver' in window) {
    document.body.classList.add('hero-inview');
    const observer = new IntersectionObserver(entries => {
      document.body.classList.toggle('hero-inview', entries[0].isIntersecting);
    }, {threshold: 0, rootMargin:'-69px 0px 0px 0px'});
    observer.observe(heroActions);
  }
  // Blog filtering/search work even when previewed directly from disk.
  const filters = [...document.querySelectorAll('[data-filter]')];
  const search = document.querySelector('#article-search');
  const results = [...document.querySelectorAll('#blog-results .article-card')];
  if (results.length) {
    let filter = 'הכול';
    const refresh = () => {
      const q = (search?.value||'').trim().toLocaleLowerCase('he');
      let shown = 0;
      results.forEach(card => {
        const matchesCategory = filter==='הכול' || card.dataset.category===filter;
        const searchable = `${card.dataset.title||''} ${card.dataset.category||''} ${card.textContent||''}`.toLocaleLowerCase('he');
        const visible = matchesCategory && (!q || searchable.includes(q));
        card.hidden = !visible;
        if(visible)shown++;
      });
      const empty = document.querySelector('#blog-empty');
      if(empty)empty.hidden=shown!==0;
    };
    filters.forEach(btn=>btn.addEventListener('click',()=>{
      filter=btn.dataset.filter;
      filters.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
      refresh();
    }));
    search?.addEventListener('input',refresh);
  }
  // Contact: send only to a verified configured destination. Without one,
  // copy the composed text and explicitly inform the visitor; never fake success.
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-result');
  const config = window.DANIEL_SITE_CONFIG || {};
  const button = document.querySelector('#contact-submit');
  if (button && (config.whatsapp || config.email || config.formEndpoint)) {
    button.innerHTML = `שליחת פנייה <svg class="icon icon--small" aria-hidden="true"><use href="#ico-arrow"></use></svg>`;
  }
  async function copyText(txt) {
    try{if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(txt);return true;}}catch{}
    const el = document.createElement('textarea');el.value=txt;el.setAttribute('readonly','');el.style.position='fixed';el.style.opacity='0';document.body.append(el);el.select();
    let success=false;try{success=document.execCommand('copy');}catch{}el.remove();return success;
  }
  form?.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!form.reportValidity())return;
    const name=form.elements.namedItem('name').value.trim();
    const phone=form.elements.namedItem('phone').value.trim();
    const message=form.elements.namedItem('message').value.trim();
    if(!/^[+\d\- ()]{9,20}$/.test(phone)){
      status.textContent='נא להזין מספר טלפון תקין.';
      form.elements.namedItem('phone').focus();
      return;
    }
    const text=`שלום דניאל, אשמח לשיחת היכרות.\nשם: ${name}\nטלפון: ${phone}${message ? `\nהודעה: ${message}` : ''}`;
    status.textContent='';
    if(config.formEndpoint && /^https:\/\//.test(config.formEndpoint)){
      button.disabled=true;
      try{
        const response=await fetch(config.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name,phone,message})});
        if(!response.ok)throw new Error('request failed');
        status.textContent='הפנייה התקבלה במערכת. תודה!';form.reset();
      }catch{status.textContent='לא ניתן היה לשלוח את הפנייה. אפשר לנסות שוב או לפנות באמצעות פרטי הקשר המפורסמים באתר.';}
      finally{button.disabled=false;}
    }else if(/^972\d{8,10}$/.test(config.whatsapp||'')){
      const url='https://wa.me/'+config.whatsapp+'?text='+encodeURIComponent(text);
      const w=window.open(url,'_blank','noopener,noreferrer');
      if(!w)window.location.href=url;
      status.textContent='נפתח WhatsApp עם הודעה מוכנה. יש לאשר את השליחה שם.';
    }else if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email||'')){
      window.location.href=`mailto:${config.email}?subject=${encodeURIComponent('פנייה מהאתר - הדרכת הורים')}&body=${encodeURIComponent(text)}`;
      status.textContent='תוכנת הדואר נפתחה עם הודעה מוכנה. יש לשלוח אותה משם.';
    }else{
      const copied=await copyText(text);
      status.textContent=copied?'פרטי הפנייה הועתקו ללוח. גרסת ההדגמה עדיין אינה מחוברת לשליחה — יש להוסיף פרטי קשר לפני הפרסום.':'גרסת ההדגמה אינה מחוברת לשליחה. יש להגדיר ערוץ קשר לפני הפרסום.';
    }
  });
})();
