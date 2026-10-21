// A page reloaded is put back where it was read, every time. The browser does this itself only for a
// page loaded fresh: once a link inside the site has been followed, the router turns the browser's
// own restoration off for that page and keeps no position of its own, so a reload went to the top.
// Which of the two you got depended on how you had come to the page. So the page keeps its own place:
// it is noted as the page is left, and on a reload (or a back or forward that loads it again) a small
// script at the end of <body> scrolls back to it, before the first paint and before the app starts,
// so nothing is seen at the top first. A #hash still wins, as does a fresh visit, which starts at the top.
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'keep-place' },
  setup(_, nuxt) {
    const script = `(function(){try{
var K='folio-place',here=function(){return location.pathname+location.search};
var read=function(){try{return JSON.parse(sessionStorage.getItem(K)||'{}')||{}}catch(e){return {}}};
addEventListener('pagehide',function(){try{var p=read();p[here()]=Math.round(scrollY);sessionStorage.setItem(K,JSON.stringify(p))}catch(e){}});
var n=performance.getEntriesByType('navigation')[0],t=n&&n.type;
if((t!=='reload'&&t!=='back_forward')||location.hash)return;
var y=read()[here()];
if(typeof y!=='number'||y<=0)return;
history.scrollRestoration='manual';
scrollTo({top:y,left:0,behavior:'instant'});
}catch(e){}})()`
    nuxt.options.app.head.script ||= []
    nuxt.options.app.head.script.push({ key: 'keep-place', innerHTML: script, tagPosition: 'bodyClose' })
  },
})
