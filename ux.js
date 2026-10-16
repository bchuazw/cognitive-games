// Keep existing controls alive between moves: focus and CSS transitions survive.
export function updateDOM(target, html) {
 const template=document.createElement('template');template.innerHTML=html;
 function sync(parent, desired) {
  const children=[...desired.childNodes];
  children.forEach((next,i)=>{
   let old=parent.childNodes[i];
   if(!old){parent.append(next.cloneNode(true));return}
   const key=n=>n.nodeType===1?['data-cell','data-word','data-action','data-number','data-quick','data-slot','data-plant'].map(a=>n.getAttribute(a)||'').join('|'):'';
   if(old.nodeType!==next.nodeType||old.nodeName!==next.nodeName||key(old)!==key(next)){old.replaceWith(next.cloneNode(true));return}
   if(next.nodeType===3){if(old.textContent!==next.textContent)old.textContent=next.textContent;return}
   if(next.nodeType!==1)return;
   for(const a of [...old.attributes])if(!next.hasAttribute(a.name))old.removeAttribute(a.name);
   for(const a of [...next.attributes])if(old.getAttribute(a.name)!==a.value)old.setAttribute(a.name,a.value);
   sync(old,next);
  });
  while(parent.childNodes.length>children.length)parent.lastChild.remove();
 }
 sync(target,template.content);
}
export function crownProblems(cells,regions) {
 const crowns=cells.flatMap((v,i)=>v===1?[i]:[]),bad=new Set();let reason='';
 for(const a of crowns)for(const b of crowns)if(a<b){
  let issue='';
  if(Math.floor(a/5)===Math.floor(b/5))issue='These crowns share a row.';
  else if(a%5===b%5)issue='These crowns share a column.';
  else if(regions[a]===regions[b])issue='These crowns share a colored region.';
  else if(Math.abs(a%5-b%5)<=1&&Math.abs(Math.floor(a/5)-Math.floor(b/5))<=1)issue='These crowns touch diagonally.';
  if(issue){bad.add(a);bad.add(b);reason=issue}
 }
 return {bad,reason};
}
const motionByElement=new WeakMap(),liveMotion=new Set();
const reduceMotion=()=>Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
let lastHaptic=-Infinity;
export function haptic(kind='tap'){
 if(reduceMotion()||document.hidden||typeof navigator.vibrate!=='function')return;
 const now=Date.now();if(now-lastHaptic<90)return;lastHaptic=now;
 try{navigator.vibrate(kind==='error'?[10,35,10]:kind==='success'?12:5)}catch{}
}
export function animate(selector,kind='pop') {
 if(reduceMotion())return;
 const frames={
  tap:[{transform:'scale(1)'},{transform:'scale(.965)',offset:.4},{transform:'scale(1)'}],
  pop:[{transform:'scale(.93)'},{transform:'scale(1.035)',offset:.65},{transform:'scale(1)'}],
  shake:[{transform:'translateX(0)'},{transform:'translateX(-4px) rotate(-.45deg)'},{transform:'translateX(4px) rotate(.45deg)'},{transform:'translateX(-3px)'},{transform:'translateX(2px)'},{transform:'translateX(0)'}],
  reveal:[{opacity:.2,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],
  success:[{transform:'scale(.97)',filter:'brightness(1)'},{transform:'scale(1.035)',filter:'brightness(1.07)',offset:.5},{transform:'scale(1)',filter:'brightness(1)'}],
  clear:[{opacity:.5,transform:'scale(.96)'},{opacity:1,transform:'scale(1)'}],
  draw:[{strokeDashoffset:100},{strokeDashoffset:0}],
  settle:[{transform:'translateY(-3px) scale(1.025)'},{transform:'translateY(1px) scale(.99)',offset:.65},{transform:'translateY(0) scale(1)'}],
  complete:[{opacity:0,transform:'scale(.85) rotate(-10deg)'},{opacity:1,transform:'scale(1.045) rotate(3deg)',offset:.7},{opacity:1,transform:'scale(1) rotate(0deg)'}]
 };
 const elements=typeof selector==='string'?document.querySelectorAll(selector):selector?[selector]:[];
 if(kind==='shake')haptic('error');
 elements.forEach((el,i)=>{
  motionByElement.get(el)?.cancel?.();
  const effect=el.animate?.(frames[kind]||frames.pop,{duration:kind==='shake'?290:kind==='complete'?620:kind==='tap'?180:340,delay:kind==='reveal'?Math.min(i*25,125):0,easing:'cubic-bezier(.22,.8,.25,1)'});
  if(!effect)return;motionByElement.set(el,effect);liveMotion.add(effect);
  const finish=()=>{liveMotion.delete(effect);if(motionByElement.get(el)===effect)motionByElement.delete(el)};
  effect.addEventListener?.('finish',finish,{once:true});effect.addEventListener?.('cancel',finish,{once:true});
 });
}
export function clearFeedback(){
 for(const motion of liveMotion)motion.cancel?.();liveMotion.clear();
 document.querySelectorAll('.touch-ring').forEach(el=>el.remove());
}
export function initTactileFeedback(){
 const selector='button[data-cell],button[data-word],button[data-number],button[data-quick],button[data-slot],button[data-plant],.primary,.secondary,.board-tools button';
 function contact(event){
  const el=event.target.closest?.(selector);if(!el||el.disabled||reduceMotion()||event.button>0)return;
  const rect=el.getBoundingClientRect();if(!rect.width||!rect.height)return;
  const ring=document.createElement('span');ring.className='touch-ring';ring.setAttribute('aria-hidden','true');
  const size=Math.min(64,Math.max(28,Math.min(rect.width,rect.height)*.8));
  const x=Number.isFinite(event.clientX)?event.clientX:rect.left+rect.width/2,y=Number.isFinite(event.clientY)?event.clientY:rect.top+rect.height/2;
  ring.style.cssText=`left:${x}px;top:${y}px;width:${size}px;height:${size}px`;document.body.append(ring);
  ring.addEventListener('animationend',()=>ring.remove(),{once:true});setTimeout(()=>ring.remove(),500);
 }
 document.addEventListener('pointerdown',contact,{capture:true,passive:true});
 const preference=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
 const changed=()=>{if(reduceMotion())clearFeedback()};preference?.addEventListener?.('change',changed);
 return()=>{document.removeEventListener('pointerdown',contact,true);preference?.removeEventListener?.('change',changed);clearFeedback()};
}
export function celebrate(){
 if(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const host=document.createElement('div');host.className='confetti';host.setAttribute('aria-hidden','true');
 for(let i=0;i<28;i++){const bit=document.createElement('i');bit.style.cssText=`--x:${Math.round((i/27)*100)}vw;--drift:${Math.round(Math.sin(i*3)*100)}px;--delay:${i%7*35}ms;--spin:${i%2?'-':'+'}300deg;background:${['#b6ca8e','#e7b08e','#b7a1d6','#91bed0','#e4c16b'][i%5]}`;host.append(bit)}
 document.body.append(host);setTimeout(()=>host.remove(),2000);
}
