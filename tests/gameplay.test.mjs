import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import * as engine from '../engine.js';
import * as quick from '../quick.js';

async function setup(storage){
 const dom=new JSDOM('<div id="app"></div><div id="toast"></div>',{url:'http://localhost:4173',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;Object.assign(w,engine,quick);w.scrollTo=()=>{};
 if(storage)w.localStorage.setItem('lbl-v1',storage);
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};
 w.HTMLDialogElement.prototype.close=function(){this.dispatchEvent(new w.Event('close'))};
 const source=(await readFile(new URL('../app.js',import.meta.url),'utf8')).replace(/^import [^\n]+\r?\n/gm,'');
 const ux=(await readFile(new URL('../ux.js',import.meta.url),'utf8')).replace(/export /g,'');
 w.eval(ux+'\n'+source+'\nwindow.testApi={getState:()=>state,openGame,watch,cell,tick,finishQuick};');
 return{dom,w,click:(s)=>{const b=w.document.querySelector(s);assert.ok(b,`Missing ${s}`);b.click()},text:()=>w.document.body.textContent};
}
test('Trail completes, saves, reloads and starts a fresh practice puzzle',async()=>{
 const t=await setup();try{t.click('[data-game="trail"]');const solution=[...t.w.testApi.getState().solution];for(const i of solution)t.click(`[data-cell="${i}"]`);assert.match(t.text(),/There’s your aha/);assert.ok(Object.keys(JSON.parse(t.w.localStorage.getItem('lbl-v1')).records).length===1);t.click('[data-action="home"]');t.click('[data-game="trail"]');assert.match(t.text(),/There’s your aha/);t.click('[data-action="practice"]');assert.equal(t.w.testApi.getState().done,false);assert.match(t.text(),/FREE PLAY/)}finally{t.dom.window.close()}
});
test('Crown automatically completes a valid arrangement',async()=>{const t=await setup();try{t.click('[data-game="crowns"]');for(const i of t.w.testApi.getState().solution)t.click(`[data-cell="${i}"]`);assert.equal(t.w.testApi.getState().done,true)}finally{t.dom.window.close()}});
test('Kinship handles incorrect guesses and all four correct groups',async()=>{const t=await setup();try{t.click('[data-game="words"]');const groups=t.w.testApi.getState().groups;for(const g of groups)t.click(`[data-word="${g[1]}"]`);t.click('[data-action="check"]');assert.equal(t.w.testApi.getState().misses,1);t.click('[data-action="deselect"]');for(const group of groups){for(const word of group.slice(1))t.click(`[data-word="${word}"]`);t.click('[data-action="check"]')}assert.equal(t.w.testApi.getState().done,true)}finally{t.dom.window.close()}});
test('Sixfold notes, undo, and number input complete the puzzle',async()=>{const t=await setup();try{t.click('[data-game="sudoku"]');let s=t.w.testApi.getState(),i=s.givens.findIndex(v=>!v);t.click(`[data-cell="${i}"]`);t.click('[data-action="notes"]');t.click('[data-number="2"]');assert.ok(t.w.testApi.getState().pencils[i].includes(2));t.click('[data-action="undo"]');assert.equal(t.w.testApi.getState().pencils[i],undefined);t.click('[data-action="notes"]');s=t.w.testApi.getState();for(let j=0;j<36;j++)if(!s.givens[j]){t.click(`[data-cell="${j}"]`);t.click(`[data-number="${s.solution[j]}"]`)}assert.equal(t.w.testApi.getState().done,true)}finally{t.dom.window.close()}});
test('Echo plays sequences, retries mistakes, and completes five rounds',async()=>{const t=await setup();try{
 t.click('[data-game="echo"]');let pending=[];t.w.setTimeout=(fn,ms)=>{pending.push({fn,ms});return pending.length};t.w.clearTimeout=()=>{};
 const playback=()=>{t.click('[data-action="watch"]');const tasks=pending;pending=[];tasks.sort((a,b)=>a.ms-b.ms).forEach(t=>t.fn())};
 playback();t.click(`[data-cell="${(t.w.testApi.getState().sequence[0]+1)%9}"]`);assert.equal(t.w.testApi.getState().mistakes,1);
 for(let r=1;r<=5;r++){playback();const s=t.w.testApi.getState();for(const i of s.sequence.slice(0,r+2))t.click(`[data-cell="${i}"]`)}assert.equal(t.w.testApi.getState().done,true)
 }finally{t.dom.window.close()}});
test('Hints, help and restart work; elapsed time and hint counts survive undo',async()=>{const t=await setup();try{t.click('[data-game="trail"]');t.click('[data-action="help"]');assert.ok(t.w.document.querySelector('dialog[open]'));t.click('.dialog-close');t.click('[data-action="hint"]');assert.equal(t.w.testApi.getState().path.length,1);t.click('[data-action="undo"]');assert.equal(t.w.testApi.getState().path.length,0);assert.equal(t.w.testApi.getState().hints,1);t.click('[data-action="restart"]');t.click('#confirm-restart');assert.equal(t.w.testApi.getState().hints,0)}finally{t.dom.window.close()}});

test('Trail explains invalid first moves and keeps pointer targets alive for dragging and rewinding',async()=>{
 const t=await setup();try{
  t.click('[data-game="trail"]');const s=t.w.testApi.getState(),[first,second,third]=s.solution;
  t.click(`[data-cell="${second}"]`);assert.equal(s.path.length,0);assert.match(t.w.document.querySelector('#toast').textContent,/Start at 1/);
  const target=t.w.document.querySelector(`[data-cell="${first}"]`);
  target.dispatchEvent(new t.w.Event('pointerdown',{bubbles:true,cancelable:true}));
  assert.equal(t.w.document.querySelector(`[data-cell="${first}"]`),target);
  assert.equal(s.path.length,1);
  for(const n of [second,third,second]){t.w.document.elementFromPoint=()=>t.w.document.querySelector(`[data-cell="${n}"]`);t.w.document.dispatchEvent(new t.w.Event('pointermove',{bubbles:true}))}
  t.w.document.dispatchEvent(new t.w.Event('pointerup'));
  assert.deepEqual([...s.path],[first,second]);
  assert.ok(t.w.document.querySelectorAll('.available').length>0);
 }finally{t.dom.window.close()}
});

test('Crown tap toggles cleanly, marking is explicit, and conflicts explain the rule',async()=>{
 const t=await setup();try{
  t.click('[data-game="crowns"]');t.click('[data-cell="0"]');t.click('[data-cell="0"]');assert.equal(t.w.testApi.getState().cells[0],0);
  t.click('[data-action="mark-mode"]');t.click('[data-cell="0"]');assert.equal(t.w.testApi.getState().cells[0],2);
  t.click('[data-action="crown-mode"]');t.click('[data-cell="0"]');t.click('[data-cell="1"]');
  assert.equal(t.w.document.querySelectorAll('.crown-conflict').length,2);assert.match(t.text(),/share a row/);
  t.click('[data-cell="1"]');assert.equal(t.w.document.querySelectorAll('.crown-conflict').length,0);
 }finally{t.dom.window.close()}
});

test('Kinship keeps keyboard focus and selected tiles; wrong guesses preserve selections for editing',async()=>{
 const t=await setup();try{
  t.click('[data-game="words"]');const groups=t.w.testApi.getState().groups;
  const tile=t.w.document.querySelector(`[data-word="${groups[0][1]}"]`);tile.focus();tile.click();assert.equal(t.w.document.activeElement,tile);
  for(const group of groups.slice(1))t.click(`[data-word="${group[1]}"]`);
  t.click('[data-action="check"]');assert.equal(t.w.testApi.getState().picked.length,4);
  t.click(`[data-word="${groups[0][1]}"]`);assert.equal(t.w.testApi.getState().picked.length,3);
  assert.ok(t.w.document.querySelector('[data-action="check"]').disabled);
 }finally{t.dom.window.close()}
});

test('Sixfold explains duplicate numbers and clears conflict after erasing',async()=>{
 const t=await setup();try{
  t.click('[data-game="sudoku"]');assert.ok(t.w.document.querySelector('[data-number="1"]').disabled);
  const s=t.w.testApi.getState();let i=s.board.findIndex((v,i)=>!v&&s.board.some((n,j)=>n&&Math.floor(j/6)===Math.floor(i/6)));
  const duplicate=s.board.find((v,j)=>v&&Math.floor(j/6)===Math.floor(i/6));
  t.click(`[data-cell="${i}"]`);const tile=t.w.document.querySelector(`[data-cell="${i}"]`);t.click(`[data-number="${duplicate}"]`);
  assert.equal(t.w.document.querySelector(`[data-cell="${i}"]`),tile);assert.match(t.text(),/Repeated number/);assert.ok(tile.classList.contains('conflict'));
  t.click('[data-number="0"]');assert.ok(!tile.classList.contains('conflict'));
 }finally{t.dom.window.close()}
});

test('Daily progress survives a real application reload',async()=>{
 const first=await setup();let storage;let path;
 try{first.click('[data-game="trail"]');path=first.w.testApi.getState().solution.slice(0,4);for(const i of path)first.click(`[data-cell="${i}"]`);storage=first.w.localStorage.getItem('lbl-v1')}finally{first.dom.window.close()}
 const second=await setup(storage);try{second.click('[data-game="trail"]');assert.deepEqual([...second.w.testApi.getState().path],path)}finally{second.dom.window.close()}
});

test('Echo cancels playback when help opens, without accepting unseen input',async()=>{
 const t=await setup();try{
  t.click('[data-game="echo"]');const pending=new Map();let id=0;t.w.setTimeout=(fn)=>{pending.set(++id,fn);return id};t.w.clearTimeout=id=>pending.delete(id);
  t.click('[data-action="watch"]');assert.ok(t.w.document.querySelector('[data-cell="0"]').disabled);assert.ok(pending.size>0);
  t.click('[data-action="help"]');assert.equal(pending.size,0);t.click('.dialog-close');assert.equal(t.w.testApi.getState().ready,false);assert.ok(!t.w.document.querySelector('[data-action="watch"]').disabled);
 }finally{t.dom.window.close()}
});

test('Reduced motion skips interaction animations and confetti but retains completion feedback',async()=>{
 const t=await setup();try{
  t.w.matchMedia=()=>({matches:true});let animations=0;t.w.HTMLElement.prototype.animate=()=>{animations++};
  t.click('[data-game="crowns"]');for(const i of t.w.testApi.getState().solution)t.click(`[data-cell="${i}"]`);
  assert.equal(animations,0);assert.equal(t.w.document.querySelector('.confetti'),null);assert.equal(t.w.testApi.getState().done,true);
 }finally{t.dom.window.close()}
});

test('Every board has a short inline rule without opening help',async()=>{
 const t=await setup();try{for(const id of ['trail','crowns','words','sudoku','echo']){t.w.testApi.openGame(id);const guide=t.w.document.querySelector('.quick-guide');assert.ok(guide.textContent.length>35);assert.ok(!t.w.document.querySelector('dialog'));assert.ok(!guide.textContent.includes('?'))}}finally{t.dom.window.close()}
});


test('All ten games share a grid and retired games are absent',async()=>{const t=await setup();try{assert.equal(t.w.document.querySelectorAll('.game-cards').length,1);assert.deepEqual([...t.w.document.querySelectorAll('.game-cards [data-game]')].map(el=>el.dataset.game),['trail','crowns','words','sudoku','echo','spot','math','thread','hop','duet'])}finally{t.dom.window.close()}});
test('The five short puzzles start immediately and have no countdown or forced timeout',async()=>{for(const id of ['spot','math','thread','hop','duet']){const t=await setup();try{t.click(`[data-game="${id}"]`);assert.ok(!t.w.document.querySelector('.start-overlay'));assert.ok(!t.w.document.querySelector('.timer'));assert.doesNotMatch(t.text(),/45[- ]second|seconds|UNDER A MINUTE/);const s=t.w.testApi.getState();s.seconds=1000;t.w.testApi.tick();assert.ok(!s.done);assert.ok(t.w.document.querySelector('[data-quick]:not([disabled])'))}finally{t.dom.window.close()}}});
test('Oddly and Sumthing finish their compact rounds and can replay',async()=>{for(const id of ['spot','math']){const t=await setup();try{t.click(`[data-game="${id}"]`);const s=t.w.testApi.getState();for(const p of s.rounds)t.click(`[data-quick="${id==='spot'?p.odd:p.answer}"]`);assert.ok(s.done&&s.solved);assert.match(t.text(),/CLEAN SOLVE/);t.click('[data-action="practice"]');assert.ok(!t.w.testApi.getState().done)}finally{t.dom.window.close()}}});
test('Thread handles rejection, unfolding and a complete compound-word reveal',async()=>{const t=await setup();try{t.click('[data-game="thread"]');const s=t.w.testApi.getState();const wrong=s.choices.findIndex(w=>w!==s.answer);t.click(`[data-quick="${wrong}"]`);assert.equal(s.errors,1);assert.ok(t.w.document.querySelector(`[data-quick="${wrong}"]`).disabled);t.click('[data-action="unfold"]');assert.equal(s.revealed,3);assert.equal(s.hints,1);t.click(`[data-quick="${s.choices.indexOf(s.answer)}"]`);assert.ok(s.done);assert.equal(t.w.document.querySelectorAll('.solution-reveal span').length,3)}finally{t.dom.window.close()}});
test('Wordhop allows correction and returning a misplaced word to the bank',async()=>{const t=await setup();try{t.click('[data-game="hop"]');const s=t.w.testApi.getState();t.click(`[data-quick="${s.bank.indexOf(s.path[2])}"]`);assert.equal(s.slots[1],s.path[2]);t.click('[data-action="hop-clear"]');assert.equal(s.slots[1],null);for(let n=1;n<=3;n++){t.click(`[data-slot="${n}"]`);t.click(`[data-quick="${s.bank.indexOf(s.path[n])}"]`)}assert.ok(s.done);assert.match(t.text(),/SOLVED/)}finally{t.dom.window.close()}});
test('Duet keeps clues locked, supports removal, and accepts the valid solution',async()=>{const t=await setup();try{t.click('[data-game="duet"]');const s=t.w.testApi.getState(),blank=s.givens.findIndex(v=>v===null),fixed=s.givens.findIndex(v=>v!==null);assert.ok(t.w.document.querySelector(`[data-quick="${fixed}"]`).disabled);t.click('[data-plant="1"]');t.click(`[data-quick="${blank}"]`);t.click(`[data-quick="${blank}"]`);assert.equal(s.board[blank],null);for(let i=0;i<16;i++)if(s.givens[i]===null){t.click(`[data-plant="${s.solution[i]}"]`);t.click(`[data-quick="${i}"]`)}assert.ok(s.done)}finally{t.dom.window.close()}});
test('Versioned short-puzzle progress resumes without reviving old timed sessions',async()=>{const t=await setup(JSON.stringify({records:{},sessions:{[`${engine.dayKey()}:spot`]:{done:true,round:8}}}));let storage;try{t.click('[data-game="spot"]');const s=t.w.testApi.getState();assert.equal(s.round,0);t.click(`[data-quick="${s.rounds[0].odd}"]`);storage=t.w.localStorage.getItem('lbl-v1')}finally{t.dom.window.close()}const reloaded=await setup(storage);try{reloaded.click('[data-game="spot"]');assert.equal(reloaded.w.testApi.getState().round,1)}finally{reloaded.dom.window.close()}});

test('Repeated tile feedback cancels the previous effect and navigation clears active effects',async()=>{
 const t=await setup();try{
  t.click('[data-game="duet"]');const s=t.w.testApi.getState(),i=s.givens.findIndex(v=>v===null),tile=t.w.document.querySelector(`[data-quick="${i}"]`),effects=[];
  tile.animate=(frames,options)=>{const handlers={},effect={cancelled:false,cancel(){this.cancelled=true;handlers.cancel?.()},addEventListener(type,fn){handlers[type]=fn},frames,options};effects.push(effect);return effect};
  t.click(`[data-quick="${i}"]`);t.click(`[data-quick="${i}"]`);
  assert.equal(effects.length,2);assert.ok(effects[0].cancelled);assert.equal(s.board[i],null);assert.equal(tile,t.w.document.querySelector(`[data-quick="${i}"]`));
  t.click('[data-action="home"]');assert.ok(effects[1].cancelled);
 }finally{t.dom.window.close()}
});
test('Pointer contact creates a noninteractive touch ring; disabled and reduced-motion controls do not',async()=>{
 const t=await setup();try{
  t.click('[data-game="duet"]');const s=t.w.testApi.getState(),i=s.givens.findIndex(v=>v===null),fixed=s.givens.findIndex(v=>v!==null),tile=t.w.document.querySelector(`[data-quick="${i}"]`);
  tile.getBoundingClientRect=()=>({left:0,top:0,width:60,height:60});
  const event=()=>new t.w.MouseEvent('pointerdown',{bubbles:true,clientX:25,clientY:30,button:0});tile.dispatchEvent(event());
  const ring=t.w.document.querySelector('.touch-ring');assert.ok(ring);assert.equal(ring.getAttribute('aria-hidden'),'true');assert.equal(s.board[i],null);
  t.w.clearFeedback();t.w.document.querySelector(`[data-quick="${fixed}"]`).dispatchEvent(event());assert.ok(!t.w.document.querySelector('.touch-ring'));
  t.w.matchMedia=()=>({matches:true});tile.dispatchEvent(event());assert.ok(!t.w.document.querySelector('.touch-ring'));
 }finally{t.dom.window.close()}
});
test('Haptics are rate limited, optional, safe on unsupported devices and respect reduced motion',async()=>{
 const t=await setup();try{
  let now=1000;const calls=[];t.w.Date.now=()=>now;t.w.navigator.vibrate=pattern=>{calls.push(pattern);return true};
  t.w.haptic('error');t.w.haptic('error');assert.equal(calls.length,1);assert.deepEqual([...calls[0]],[10,35,10]);now+=100;t.w.haptic('success');assert.equal(calls.length,2);
  now+=100;t.w.matchMedia=()=>({matches:true});t.w.haptic('success');assert.equal(calls.length,2);
  t.w.matchMedia=()=>({matches:false});t.w.navigator.vibrate=()=>{throw Error('Unavailable')};now+=100;assert.doesNotThrow(()=>t.w.haptic('tap'));
 }finally{t.dom.window.close()}
});
test('Trail splits its settled line from the live segment and keeps both correct after rewinding',async()=>{
 const t=await setup();try{
  t.click('[data-game="trail"]');const s=t.w.testApi.getState();for(const i of s.solution.slice(0,4))t.click(`[data-cell="${i}"]`);
  const assertLine=()=>{const end=s.path.at(-1),prev=s.path.at(-2),line=t.w.document.querySelector('.path-step');assert.equal(+line.getAttribute('x1'),prev%5*100+50);assert.equal(+line.getAttribute('y2'),Math.floor(end/5)*100+50);assert.equal(line.getAttribute('pathLength'),'100')};
  assertLine();t.click(`[data-cell="${s.solution[1]}"]`);assert.equal(s.path.length,2);assertLine();
 }finally{t.dom.window.close()}
});
