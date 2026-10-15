// Keep existing controls alive between moves: focus and CSS transitions survive.
export function updateDOM(target, html) {
 const template=document.createElement('template');template.innerHTML=html;
 function sync(parent, desired) {
  const children=[...desired.childNodes];
  children.forEach((next,i)=>{
   let old=parent.childNodes[i];
   if(!old){parent.append(next.cloneNode(true));return}
   const key=n=>n.nodeType===1?['data-cell','data-word','data-action','data-number'].map(a=>n.getAttribute(a)||'').join('|'):'';
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
export function animate(selector,kind='pop') {
 if(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const frames={pop:[{transform:'scale(.85)'},{transform:'scale(1.08)',offset:.65},{transform:'scale(1)'}],shake:[{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(-3px)'},{transform:'translateX(0)'}],reveal:[{opacity:0,transform:'translateY(10px) scale(.96)'},{opacity:1,transform:'translateY(0) scale(1)'}]};
 document.querySelectorAll(selector).forEach(el=>el.animate?.(frames[kind],{duration:kind==='shake'?300:380,easing:'cubic-bezier(.2,.8,.2,1)'}));
}
export function celebrate(){
 if(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const host=document.createElement('div');host.className='confetti';host.setAttribute('aria-hidden','true');
 for(let i=0;i<28;i++){const bit=document.createElement('i');bit.style.cssText=`--x:${Math.round((i/27)*100)}vw;--drift:${Math.round(Math.sin(i*3)*100)}px;--delay:${i%7*35}ms;--spin:${i%2?'-':'+'}300deg;background:${['#b6ca8e','#e7b08e','#b7a1d6','#91bed0','#e4c16b'][i%5]}`;host.append(bit)}
 document.body.append(host);setTimeout(()=>host.remove(),2000);
}
