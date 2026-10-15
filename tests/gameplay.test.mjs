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

test('All ten cards share one grid, with the five new games directly after the original five',async()=>{
 const t=await setup();try{assert.equal(t.w.document.querySelectorAll('.game-cards').length,1);assert.deepEqual([...t.w.document.querySelectorAll('.game-cards [data-game]')].map(el=>el.dataset.game),['trail','crowns','words','sudoku','echo','spot','math','pairs','order','switch']);assert.match(t.text(),/0\/10 complete/)}finally{t.dom.window.close()}
});
test('Oddly and Sumthing complete all eight rounds with visible score and replay',async()=>{
 for(const id of ['spot','math']){const t=await setup();try{t.click(`[data-game="${id}"]`);assert.ok(t.w.document.querySelector('[data-quick]').disabled);t.click('[data-action="quick-start"]');const s=t.w.testApi.getState();
  for(let r=0;r<8;r++)t.click(`[data-quick="${id==='spot'?s.rounds[r].odd:s.rounds[r].answer}"]`);
  assert.ok(s.done&&s.solved);assert.ok(t.w.document.querySelector('.sprint-result'));assert.ok(JSON.parse(t.w.localStorage.getItem('lbl-v1')).best[id]>0);t.click('[data-action="practice"]');assert.equal(t.w.testApi.getState().started,false);assert.equal(t.w.testApi.getState().done,false);
 }finally{t.dom.window.close()}}
});
test('Peel rejects double taps, waits on mismatches and completes six pairs',async()=>{
 const t=await setup();try{t.click('[data-game="pairs"]');t.click('[data-action="quick-start"]');const s=t.w.testApi.getState();const pending=new Map();let next=0;t.w.setTimeout=(fn,delay)=>{pending.set(++next,{fn,delay});return next};t.w.clearTimeout=id=>pending.delete(id);
  t.click('[data-quick="0"]');t.click('[data-quick="0"]');assert.equal(s.faceup.length,1);
  const mismatch=s.deck.findIndex(n=>n!==s.deck[0]);t.click(`[data-quick="${mismatch}"]`);assert.ok(s.locked);assert.ok([...t.w.document.querySelectorAll('[data-quick]')].every(el=>el.disabled));
  for(const [id,task] of pending)if(task.delay===850){task.fn();pending.delete(id)}assert.equal(s.locked,false);assert.equal(s.faceup.length,0);
  for(let fruit=0;fruit<6;fruit++)for(let i=0;i<12;i++)if(s.deck[i]===fruit)t.click(`[data-quick="${i}"]`);
  assert.ok(s.done&&s.solved);assert.equal(s.matched.length,12);
 }finally{t.dom.window.close()}
});
test('Upbeat ignores completed numbers and finishes in order',async()=>{
 const t=await setup();try{t.click('[data-game="order"]');t.click('[data-action="quick-start"]');t.click('[data-quick="5"]');assert.match(t.text(),/Find 1 next/);for(let n=1;n<=16;n++)t.click(`[data-quick="${n}"]`);assert.ok(t.w.testApi.getState().done)}finally{t.dom.window.close()}
});
test('Glow reveals three solved boards, locks transitions and preserves a partial board on return',async()=>{
 const t=await setup();try{t.click('[data-game="switch"]');t.click('[data-action="quick-start"]');const s=t.w.testApi.getState();t.click('[data-quick="0"]');const lights=[...s.lights];t.click('[data-action="home"]');t.click('[data-game="switch"]');assert.deepEqual([...t.w.testApi.getState().lights],lights);t.click('[data-action="quick-start"]');t.click('[data-action="quick-reset"]');
  const pending=[];t.w.setTimeout=(fn,delay)=>{pending.push({fn,delay});return pending.length};t.w.clearTimeout=()=>{};
  for(let round=0;round<3;round++){for(const i of s.puzzles[round].solution)t.click(`[data-quick="${i}"]`);if(round<2){assert.ok(s.locked);const transition=pending.findLast(t=>t.delay===550);transition.fn();assert.equal(s.locked,false)}}
  assert.ok(s.done&&s.solved);
 }finally{t.dom.window.close()}
});
test('Each quick game ends at 45 seconds, never starts while reading, and pauses in help',async()=>{
 for(const id of ['spot','math','pairs','order','switch']){const t=await setup();try{
  t.click(`[data-game="${id}"]`);const s=t.w.testApi.getState();s.seconds=44;t.w.testApi.tick();assert.equal(s.seconds,44);assert.ok(!s.done);
  t.click('[data-action="quick-start"]');t.click('[data-action="help"]');s.seconds=45;t.w.testApi.tick();assert.ok(!s.done);t.click('.dialog-close');t.w.testApi.tick();assert.ok(s.done);assert.equal(s.seconds,45);assert.equal(s.solved,false);assert.match(t.text(),/ROUND COMPLETE/);assert.ok(!t.w.document.querySelector('[data-quick]'));
 }finally{t.dom.window.close()}}
});
test('Returning from a hidden tab does not charge background time to a quick round',async()=>{
 const t=await setup();try{t.click('[data-game="order"]');t.click('[data-action="quick-start"]');const s=t.w.testApi.getState();s.seconds=10;let now=t.w.Date.now();t.w.Date.now=()=>now;Object.defineProperty(t.w.document,'hidden',{configurable:true,value:true});t.w.document.dispatchEvent(new t.w.Event('visibilitychange'));now+=60000;Object.defineProperty(t.w.document,'hidden',{configurable:true,value:false});t.w.document.dispatchEvent(new t.w.Event('visibilitychange'));now+=100;t.w.testApi.tick();assert.ok(s.seconds<10.2);assert.ok(!s.done)}finally{t.dom.window.close()}
});
