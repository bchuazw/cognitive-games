import test from 'node:test';
import assert from 'node:assert/strict';
import {createQuick,quickMove,quickProgress,quickScore,flipLights} from '../quick.js';

test('100 Glow seeds have three distinct-tap solutions for all three boards',()=>{
 for(let seed=0;seed<100;seed++)for(const p of createQuick('switch',seed).puzzles){assert.equal(new Set(p.solution).size,3);let board=[...p.board];p.solution.forEach(i=>board=flipLights(board,i));assert.ok(board.every(Boolean));assert.ok(p.board.some(v=>!v))}
});
test('Sumthing has exactly one correct option and correct arithmetic across 100 seeds',()=>{
 for(let seed=0;seed<100;seed++)for(const p of createQuick('math',seed).rounds){assert.equal(new Set(p.choices).size,4);assert.ok(p.choices.includes(p.answer));assert.equal(p.answer,p.op==='+'?p.a+p.b:p.op==='−'?p.a-p.b:p.a*p.b)}
});
test('Oddly always has one different shape, and each Peel deck has six pairs',()=>{
 for(let seed=0;seed<100;seed++){
  for(const r of createQuick('spot',seed).rounds){assert.notEqual(r.shape,r.oddShape);assert.ok(r.odd>=0&&r.odd<r.count)}
  const deck=createQuick('pairs',seed).deck;assert.equal(deck.length,12);for(let n=0;n<6;n++)assert.equal(deck.filter(v=>v===n).length,2);
 }
});
test('quick engines reject input before start and after the round finishes',()=>{
 for(const id of ['spot','math','order','pairs','switch']){const s=createQuick(id,'test'),before=JSON.stringify(s);assert.ok(quickMove(id,s,0).ignored);assert.equal(JSON.stringify(s),before);s.started=true;s.done=true;assert.ok(quickMove(id,s,0).ignored)}
});
test('quick completion and scores reward accuracy and time',()=>{
 const s=createQuick('order','test');s.started=true;assert.equal(quickMove('order',s,3).correct,false);assert.equal(s.errors,1);
 for(let n=1;n<=16;n++)quickMove('order',s,n);
 assert.equal(quickProgress('order',s),1);assert.ok(s.solved);assert.equal(quickScore('order',s),965);s.seconds=45;assert.equal(quickScore('order',s),785);
});
