// The page is lit by the sun before its first paint. The home page is cached HTML, the same for
// everyone, so the server cannot bake in the hour; and lighting it once the app has loaded made the
// ground change under the reader on every refresh. So the build lights it ahead of time: the light
// at every half degree of sun height goes into a small script at the top of <head>, with the same
// functions the app uses (sunAt, varsFor), and the script picks the light for the sun at that
// moment, where Hugo was last seen, before anything is drawn. The app then takes over as before.
import { defineNuxtModule } from '@nuxt/kit'
import { firstLightTable, LONDON, sunAt, varsFor } from '../app/utils/daylight'

export default defineNuxtModule({
  meta: { name: 'first-light' },
  setup(_, nuxt) {
    const script = `(function(){try{
if(/^\\/things(\\/|$)/.test(location.pathname)){
var el=document.documentElement,v={'--ui-bg':'#FAF9F7','--ui-bg-muted':'#F7F6F3','--ui-bg-elevated':'#F3F2EE','--ui-bg-inverted':'#111111','--ui-text-highlighted':'#111111','--ui-text':'#222222','--ui-text-toned':'#3A3A3A','--ui-text-muted':'#6B6B6B','--ui-text-dimmed':'#9A9A9A','--ui-border':'#E8E6E1','--ui-border-muted':'#F0EEE9','--code-bg':'#F7F6F3','--code-border':'#E8E6E1'};
el.classList.add('things-studio','light');el.classList.remove('dark');
for(var k in v)el.style.setProperty(k,v[k]);
el.style.setProperty('--ui-primary','#CD1919','important');
var m=document.createElement('meta');m.name='theme-color';m.content='#FAF9F7';document.head.appendChild(m);
return;
}
if(sessionStorage.getItem('folio-theme-manual')||/[?&](hour|speed)=/.test(location.search))return;
var rad=Math.PI/180,LONDON=${JSON.stringify(LONDON)},T=${JSON.stringify(firstLightTable())};
var sunAt=${sunAt.toString()};
var varsFor=${varsFor.toString()};
var w=LONDON;try{var c=JSON.parse(localStorage.getItem('folio-whereabouts')||'null');if(c&&typeof c.lat==='number'&&typeof c.lon==='number')w=c}catch(e){}
var s=sunAt(new Date(),w),dark=s.elevation<0,rows=T[s.morning?0:1],x=Math.max(0,Math.min(37,s.elevation+18.5)),i=Math.min(36,Math.floor(x)),f=x-i,a=rows[i],b=rows[i+1];
if((-18.5+i<0)!==(-17.5+i<0)){a=b=rows[dark?i:i+1];f=0}
var r=a.map(function(v,j){return typeof v==='number'?v+(b[j]-v)*f:(f<0.5?v:b[j])});
var v=varsFor([r[0],r[1],r[2]],r.slice(3,8),dark,s.elevation),el=document.documentElement;
for(var k in v)el.style.setProperty(k,v[k]);
el.style.setProperty('--ui-primary',r[8],'important');
el.classList.remove(dark?'light':'dark');el.classList.add(dark?'dark':'light');
try{localStorage.setItem('nuxt-color-mode',dark?'dark':'light')}catch(e){}
var x2=document.createElement('canvas').getContext('2d');if(x2){x2.fillStyle=v['--ui-bg'];x2.fillRect(0,0,1,1);var px=x2.getImageData(0,0,1,1).data,m=document.createElement('meta');m.name='theme-color';m.content='rgb('+px[0]+' '+px[1]+' '+px[2]+')';document.head.appendChild(m)}
}catch(e){}})()`
    nuxt.options.app.head.script ||= []
    nuxt.options.app.head.script.push({ key: 'first-light', innerHTML: script, tagPosition: 'head', tagPriority: 'critical' })
  },
})
