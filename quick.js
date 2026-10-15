import {rng,shuffle} from './engine.js';

export const quickGames=[
 {id:'spot',name:'Oddly',tag:'One of these has other plans',skill:'Attention',time:'20–45 sec',color:'coral',icon:'✦',quick:true,desc:'Spot the shape that doesn’t belong. Eight tiny aha moments.',rules:['Tap the one shape that is different.','Find eight odd ones in 45 seconds. Mistakes only affect your score.']},
 {id:'math',name:'Sumthing',tag:'A little number magic',skill:'Mental maths',time:'25–45 sec',color:'electric',icon:'±',quick:true,desc:'A missing number. Four possibilities. Make the equation click.',rules:['Tap the number that completes the equation.','Solve eight equations in 45 seconds. A wrong choice can be tried again.']},
 {id:'pairs',name:'Peel',tag:'Good things come in pairs',skill:'Memory',time:'25–45 sec',color:'pink',icon:'◒',quick:true,desc:'Flip a little fruit market. Find all six delicious pairs.',rules:['Flip two cards. Matching fruit stays face up.','Find six pairs in 45 seconds. Mismatches flip back after a moment.']},
 {id:'order',name:'Upbeat',tag:'Find your next number',skill:'Sequencing',time:'15–45 sec',color:'aqua',icon:'↗',quick:true,desc:'From 1 to 16, one satisfying tap at a time. Find your rhythm.',rules:['Tap the numbers in order, starting at 1.','Reach 16 in 45 seconds. The next number is always shown above the board.']},
 {id:'switch',name:'Glow',tag:'Make a little light',skill:'Spatial logic',time:'20–45 sec',color:'violet',icon:'☼',quick:true,desc:'Tap a light. Its neighbors flip too. Light up three little boards.',rules:['Tap a tile to switch it and its up, down, left, and right neighbors.','Make all nine lights glow. Complete three boards in 45 seconds.','Every fresh board can be solved in three taps. You can reset the current board.']}
];
export const fruits=['🍋','🍒','🥑','🍇','🍊','🍓'];
export const fruitNames=['lemon','cherries','avocado','grapes','orange','strawberry'];
export const shapeNames=['circle','triangle','diamond','rounded square','four-point star','cross'];
export function flipLights(board,i){return board.map((v,j)=>j===i||Math.abs(i%3-j%3)+Math.abs(Math.floor(i/3)-Math.floor(j/3))===1?!v:v)}
export function createQuick(id,seed){
 const r=rng(seed);const s={seconds:0,hints:0,done:false,started:false,errors:0,round:0,feedback:'',solved:false};
 if(id==='spot')s.rounds=Array.from({length:8},(_,n)=>{const count=n<4?9:16,shape=Math.floor(r()*6);return{count,shape,oddShape:(shape+1+Math.floor(r()*5))%6,odd:Math.floor(r()*count)}});
 if(id==='math')s.rounds=Array.from({length:8},(_,i)=>{let a,b,answer,op;if(i%3===0){a=2+Math.floor(r()*9);b=2+Math.floor(r()*9);answer=a+b;op='+'}else if(i%3===1){a=12+Math.floor(r()*15);b=2+Math.floor(r()*(a-3));answer=a-b;op='−'}else{a=2+Math.floor(r()*5);b=2+Math.floor(r()*5);answer=a*b;op='×'}return{a,b,op,answer,choices:shuffle([answer,answer+1,Math.max(0,answer-2),answer+3],r)}});
 if(id==='pairs'){s.deck=shuffle([...Array(6).keys(),...Array(6).keys()],r);s.faceup=[];s.matched=[];s.locked=false}
 if(id==='order'){s.numbers=shuffle(Array.from({length:16},(_,i)=>i+1),r);s.next=1}
 if(id==='switch'){s.puzzles=Array.from({length:3},()=>{const solution=shuffle([...Array(9).keys()],r).slice(0,3);let board=Array(9).fill(true);solution.forEach(i=>board=flipLights(board,i));return{board,solution}});s.lights=[...s.puzzles[0].board];s.moves=0}
 return s;
}
export function quickProgress(id,s){return id==='order'?(s.next-1)/16:id==='pairs'?s.matched.length/12:id==='switch'?s.round/3:s.round/8}
export function quickScore(id,s){return Math.max(0,Math.round(quickProgress(id,s)*800+(s.solved?Math.max(0,45-s.seconds)*4:0)-s.errors*15))}
export function quickMove(id,s,value){
 if(!s.started||s.done||s.locked)return {ignored:true};
 let correct=false,complete=false;
 if(id==='spot'||id==='math'){
  const target=id==='spot'?s.rounds[s.round].odd:s.rounds[s.round].answer;
  if(value===target){s.round++;correct=true;complete=s.round===8}else{s.errors++;s.feedback=id==='spot'?'Look for a different outline. You’ve got this.':'Not that one. Try another number.'}
 }
 if(id==='order'){if(value===s.next){s.next++;correct=true;complete=s.next===17}else if(value<s.next)return{ignored:true};else{s.errors++;s.feedback=`Find ${s.next} next. One step at a time.`}}
 if(id==='pairs'){
  if(s.matched.includes(value)||s.faceup.includes(value))return{ignored:true};
  s.faceup.push(value);if(s.faceup.length===2){const [a,b]=s.faceup;if(s.deck[a]===s.deck[b]){s.matched.push(a,b);s.faceup=[];correct=true;complete=s.matched.length===12}else{s.errors++;s.locked=true;s.feedback='Take a little mental picture…';return{mismatch:true}}}
 }
 if(id==='switch'){s.lights=flipLights(s.lights,value);s.moves++;if(s.lights.every(Boolean)){s.round++;correct=true;complete=s.round===3;if(!complete){s.locked=true;s.feedback='All aglow! Next board coming up.';return{nextBoard:true,correct:true}}}}
 if(correct)s.feedback=['Nice find!','You’re on a roll.','Lovely work.','That clicked!'][Math.floor(quickProgress(id,s)*16)%4];
 if(complete)s.solved=true;
 return{correct,complete};
}
export function shapeSVG(n){const shapes=['<circle cx="30" cy="30" r="17"/>','<path d="M30 9 51 48H9Z"/>','<path d="M30 7 53 30 30 53 7 30Z"/>','<rect x="12" y="12" width="36" height="36" rx="8"/>','<path d="M30 7 36 23 53 30 36 37 30 53 23 37 7 30 23 23Z"/>','<path d="M24 9H36V24H51V36H36V51H24V36H9V24H24Z"/>'];return `<svg viewBox="0 0 60 60" aria-hidden="true">${shapes[n]}</svg>`}
export function quickPreview(g){
 if(g.id==='spot')return `<div class="spot-preview">${[0,0,4,0].map(shapeSVG).join('')}</div>`;
 if(g.id==='math')return '<div class="math-preview"><span>7 + 5</span><strong>12<span>✦</span></strong></div>';
 if(g.id==='pairs')return '<div class="pair-preview"><span>🍋</span><span>🍋</span></div>';
 if(g.id==='order')return '<div class="order-preview"><span>1</span><span>2</span><span>3 ↗</span></div>';
 return `<div class="glow-preview">${Array.from({length:9},(_,i)=>`<i class="${[0,2,4,6,8].includes(i)?'on':''}"></i>`).join('')}</div>`;
}
export function quickBoard(g,s){
 const disabled=!s.started||s.done||s.locked?'disabled':'';
 const progress=quickProgress(g.id,s),labels={spot:`${s.round}/8 found`,math:`${s.round}/8 solved`,pairs:`${s.matched?.length/2||0}/6 pairs`,order:`${Math.min(16,s.next-1)}/16 in order`,switch:`${s.round}/3 boards`};
 let tiles='';
 if(g.id==='spot'){const p=s.rounds[Math.min(7,s.round)];tiles=`<div class="sprint-grid spot-grid" style="--columns:${p.count===9?3:4}">${Array.from({length:p.count},(_,i)=>`<button data-quick="${i}" ${disabled} aria-label="Shape ${i+1}, ${shapeNames[i===p.odd?p.oddShape:p.shape]}" class="spot-tile">${shapeSVG(i===p.odd?p.oddShape:p.shape)}</button>`).join('')}</div>`}
 if(g.id==='math'){const p=s.rounds[Math.min(7,s.round)];tiles=`<div class="equation" aria-label="${p.a} ${p.op} ${p.b} equals what?"><span>${p.a}</span><b>${p.op}</b><span>${p.b}</span><b>=</b><strong>?</strong></div><div class="math-options">${p.choices.map((n,i)=>`<button data-quick="${n}" ${disabled}><small>${i+1}</small>${n}</button>`).join('')}</div><span class="keyboard-tip">Choose an answer · keyboard keys 1–4</span>`}
 if(g.id==='pairs')tiles=`<div class="sprint-grid pair-grid">${s.deck.map((n,i)=>{const shown=s.faceup.includes(i)||s.matched.includes(i);return `<button data-quick="${i}" ${disabled||s.matched.includes(i)?'disabled':''} class="fruit-card ${shown?'flipped':''} ${s.matched.includes(i)?'matched':''}" aria-label="Card ${i+1}${shown?', '+fruitNames[n]:', face down'}"><span class="fruit-inner" aria-hidden="true"><span class="fruit-back">✳</span><span class="fruit-front">${fruits[n]}</span></span></button>`}).join('')}</div>`;
 if(g.id==='order')tiles=`<div class="next-number">NEXT UP <strong>${Math.min(16,s.next)}</strong><span>Follow your rhythm ↗</span></div><div class="sprint-grid order-grid">${s.numbers.map(n=>`<button data-quick="${n}" ${disabled||n<s.next?'disabled':''} class="order-tile ${n<s.next?'cleared':''}" aria-label="${n}${n<s.next?', completed':''}">${n<s.next?'✓':n}</button>`).join('')}</div>`;
 if(g.id==='switch')tiles=`<div class="glow-label"><span>○ OFF</span><span>☼ ON</span><span>${s.moves} taps</span></div><div class="sprint-grid glow-grid">${s.lights.map((on,i)=>`<button data-quick="${i}" ${disabled} class="glow-tile ${on?'lit':''}" aria-label="Light ${i+1}, ${on?'on':'off'}" aria-pressed="${on}"><span>${on?'☼':'○'}</span></button>`).join('')}</div><button class="glow-reset" data-action="quick-reset" ${disabled}>↶ Reset this board</button>`;
 return `<div class="sprint-score"><span>${labels[g.id]}</span><strong><span class="score-value">${quickScore(g.id,s)}</span> pts</strong></div><div class="sprint-meter" role="progressbar" aria-label="Round progress" aria-valuenow="${Math.round(progress*100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${progress*100}%"></i></div><div class="quick-arena ${!s.started?'waiting':''}">${tiles}${!s.started?`<div class="start-overlay"><span class="start-spark">${g.icon}</span><h2>Got 45 seconds?</h2><p>${g.rules[0]}</p><button class="primary" data-action="quick-start">Let’s go <span>↗</span></button><small>The clock starts when you do.</small></div>`:''}</div><p class="sprint-feedback" role="status">${s.feedback||'A tiny challenge. A good little feeling.'}</p>`;
}
