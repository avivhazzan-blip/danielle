/** Build static deployment with absolute SEO metadata; requires SITE_URL. No dependencies. */
import fs from 'node:fs';
import path from 'node:path';
const origin=(process.env.SITE_URL||'').replace(/\/$/,'');
if(!/^https:\/\/[a-z\d.-]+(?::\d+)?(?:\/[^\s]*)?$/i.test(origin)){
  console.error('Set SITE_URL to your confirmed HTTPS domain, e.g. SITE_URL=https://www.your-domain.co.il node build.mjs');
  process.exit(1);
}
const base=new URL(origin);
if(base.pathname!=='/' || base.search || base.hash){console.error('SITE_URL must contain only scheme and host.');process.exit(1);}
const out=path.resolve('dist');
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
const excluded=new Set(['dist','node_modules','.git']);
function copy(dir,relative=''){
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(excluded.has(e.name)||['generate.py','make_images.py','build.mjs','README.md'].includes(e.name))continue;
    const rel=path.join(relative,e.name),abs=path.join(dir,e.name),dest=path.join(out,rel);
    if(e.isDirectory()){fs.mkdirSync(dest,{recursive:true});copy(abs,rel);}
    else if(e.name.endsWith('.html')){
      let html=fs.readFileSync(abs,'utf8');
      const getMeta=(n)=>(html.match(new RegExp(`<meta name="${n}" content="([^"]+)"`))||[])[1]||'';
      const clean=(x)=>x.replaceAll('&amp;','&').replaceAll('&quot;','"');
      const sitePath=getMeta('site-path');
      const imgPath=getMeta('site-og-image');
      if(!sitePath.startsWith('/'))throw new Error('Missing path: '+rel);
      const pageUrl=origin+sitePath;
      const pageTitle=clean((html.match(/<title>(.*?)<\/title>/)||[])[1]||'');
      const desc=clean((html.match(/<meta name="description" content="([^"]+)"/ )||[])[1]||'');
      const ogType=(html.match(/<meta property="og:type" content="([^"]+)"/ )||[])[1];
      const person={"@type":"Person","@id":origin+'/#daniel',name:'דניאל סביר חזן',jobTitle:['עובדת סוציאלית קלינית','מדריכת הורים','מטפלת רגשית'],knowsAbout:['הדרכת הורים','הורות לילדים על הרצף האוטיסטי']};
      const page={"@type":ogType==='article'?'BlogPosting':'WebPage',"@id":pageUrl+'#page',url:pageUrl,name:pageTitle,description:desc,inLanguage:'he-IL'};
      if(ogType==='article'){
        page.headline=pageTitle.split(' | ')[0];page.author={"@id":origin+'/#daniel'};page.image=origin+'/'+imgPath;
      }
      const graph=[person,page];
      if(sitePath==='/'){
        graph.push({"@type":"WebSite","@id":origin+'/#website',url:origin+'/',name:'דניאל סביר חזן | הדרכת הורים',inLanguage:'he-IL'});
        graph.push({"@type":"Service","@id":origin+'/#guidance',name:'הדרכת הורים',serviceType:'הדרכת הורים',provider:{"@id":origin+'/#daniel'},areaServed:{"@type":"City",name:'קריית אונו'}});
      }
      if(sitePath==='/autism-parent-guidance/')graph.push({"@type":"Service",name:'הדרכת הורים לילדים על הרצף האוטיסטי',provider:{"@id":origin+'/#daniel'}});
      const seo=`<link rel="canonical" href="${pageUrl}"><meta property="og:url" content="${pageUrl}"><meta property="og:image" content="${origin+'/'+imgPath}"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>`;
      html=html.replace('<!-- PROD_SEO -->',seo);
      fs.writeFileSync(dest,html);
    }else fs.copyFileSync(abs,dest);
  }
}
copy(process.cwd());
const pages=[];function getPages(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){if(f.isDirectory())getPages(path.join(dir,f.name));else if(f.name==='index.html'){const rel=path.relative(out,path.join(dir,f.name)).replaceAll('\\','/');pages.push(origin+'/'+(rel==='index.html'?'':rel.replace(/index\.html$/,'')));}}}
getPages(out);
const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.sort().map(p=>`  <url><loc>${p.replaceAll('&','&amp;')}</loc></url>`).join('\n')+'\n</urlset>\n';
fs.writeFileSync(path.join(out,'sitemap.xml'),xml);
fs.writeFileSync(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Built ${pages.length} pages into dist/ for ${origin}`);
