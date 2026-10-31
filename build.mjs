/**
 * Static publication helper. Usage: node build.mjs https://your-real-domain.com
 * Creates dist/ with canonical URLs, Open Graph URLs, robots.txt and sitemap.xml.
 * Running without a URL creates a preview build with NO invented canonical domain.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const cwd=path.dirname(fileURLToPath(import.meta.url));
const dist=path.join(cwd,'dist');
const arg=(process.argv[2]||'').trim().replace(/\/$/,'');
let origin='';
if(arg){const parsed=new URL(arg);if(parsed.protocol!=='https:'||!parsed.hostname.includes('.'))throw new Error('Please enter a genuine HTTPS domain, e.g. https://www.yourdomain.co.il');origin=parsed.origin}
const keep=new Set(['assets','index.html','blog','autism-parent-guidance','parent-guidance-kiryat-ono','privacy','accessibility','terms','thanks']);
await fs.rm(dist,{recursive:true,force:true});await fs.mkdir(dist,{recursive:true});
async function copy(src,target){const stat=await fs.stat(src);if(stat.isDirectory()){await fs.mkdir(target,{recursive:true});for(const f of await fs.readdir(src))await copy(path.join(src,f),path.join(target,f));}else await fs.copyFile(src,target)}
for(const name of keep)await copy(path.join(cwd,name),path.join(dist,name));
const publicPaths=['/','/autism-parent-guidance/','/parent-guidance-kiryat-ono/','/blog/','/blog/parent-child-connection/','/blog/toddler-tantrums/','/blog/sleep-and-routines/'];
const legalPaths=['/privacy/','/accessibility/','/terms/','/thanks/'];
for(const urlPath of [...publicPaths,...legalPaths]){
 const file=path.join(dist,urlPath.slice(1),'index.html');let html=await fs.readFile(file,'utf8');
 if(origin){
  const canonical=origin+urlPath;
  html=html.replace('<!--SITE_CANONICAL-->',`<link rel="canonical" href="${canonical}"><meta property="og:url" content="${canonical}">`);
  html=html.replace(/<meta property="og:image" content="(?:\.\/|\.\.\/)+assets\/images\/([^"]+)">/g,(_,n)=>`<meta property="og:image" content="${origin}/assets/images/${n}">`);
  html=html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,(_,start,body,end)=>{
   try {const data=JSON.parse(body);if(data['@type']==='BlogPosting'){data.mainEntityOfPage=canonical;data.image=origin+'/assets/images/'+({'/blog/parent-child-connection/':'blog-connection.webp','/blog/toddler-tantrums/':'blog-tantrums.webp','/blog/sleep-and-routines/':'blog-sleep.webp'}[urlPath]||'daniel-hero.webp')}else if(data['@graph']){data['@graph'][0].url=canonical;data['@graph'][0]['@id']=origin+'/#organization';data['@graph'][1].url=origin+'/#daniel-savir-hazan'}return start+JSON.stringify(data)+end}catch{return start+body+end}
  });
 }else html=html.replace('<!--SITE_CANONICAL-->','');
 await fs.writeFile(file,html);
}
const robots='User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n'+(origin?'\nSitemap: '+origin+'/sitemap.xml\n':'');
await fs.writeFile(path.join(dist,'robots.txt'),robots);
if(origin){const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+publicPaths.map(p=>`  <url><loc>${origin+p}</loc></url>`).join('\n')+'\n</urlset>\n';await fs.writeFile(path.join(dist,'sitemap.xml'),sitemap)}
console.log('Production files:',dist,'\nDomain:',origin||'Not supplied — preview build, no canonical/sitemap generated');
