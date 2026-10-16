import {rng,shuffle} from './engine.js';

// Mix prefixes and suffixes: the answer must bridge all three fragments.
export const bridgeSets=[
 ['FIELD',[['BATTLE',''],['','WORK'],['','TRIP']],['GROUND','SPACE','LAND','LINE','HOUSE']],
 ['BREAK',[['DAY',''],['','FAST'],['','THROUGH']],['LIGHT','TIME','OUT','DOWN','POINT']],
 ['LIGHT',[['HIGH',''],['','HOUSE'],['DAY','']],['LAND','FIRE','SUN','HEAD','STAR']],
 ['WORK',[['NET',''],['','SHOP'],['FRAME','']],['HOUSE','LINE','WORD','SPACE','PLACE']],
 ['BOARD',[['KEY',''],['','ROOM'],['SKATE','']],['NOTE','HOUSE','WORD','WALK','DECK']],
 ['LINE',[['HEAD',''],['','UP'],['DEAD','']],['LIGHT','TIME','WORK','WAY','LOCK']],
 ['POINT',[['CHECK',''],['','LESS'],['VIEW','']],['MARK','LINE','LOOK','TIME','SPOT']],
 ['GROUND',[['BACK',''],['','WORK'],['PLAY','']],['FIELD','HOUSE','SPACE','ROOM','STAGE']],
 ['SPACE',[['HEAD',''],['','CRAFT'],['WORK','']],['ROOM','SHIP','TIME','BOARD','LIGHT']],
 ['TIME',[['LIFE',''],['','TABLE'],['PART','']],['WORK','LINE','LONG','DAY','WAY']],
 ['HOUSE',[['GREEN',''],['','HOLD'],['LIGHT','']],['ROOM','FIELD','WORK','LAND','BOARD']],
 ['BACK',[['FEED',''],['','BONE'],['PAPER','']],['LINE','HEAD','WORK','LIGHT','SIDE']],
 ['OVER',[['','LOOK'],['TAKE',''],['','TIME']],['OUT','DOWN','UP','OFF','BACK']],
 ['OUT',[['','LINE'],['WORK',''],['','LOOK']],['OVER','UP','DOWN','OFF','BACK']],
 ['SIDE',[['BED',''],['','WALK'],['SEA','']],['ROOM','LINE','FIELD','WAY','BOARD']]
];
export const hopSets=[
 {path:['COLD','CORD','CARD','WARD','WARM'],clues:['A cable or thick string','A king or queen in a deck','A hospital room'],decoys:['CART','WORD','WORM']},
 {path:['HEAD','HEAL','TEAL','TELL','TALL'],clues:['Recover from an injury','A blue-green color','Say something to someone'],decoys:['HEAT','TEAM','TAIL']},
 {path:['CAT','COT','DOT','DOG','DIG'],clues:['A small camp bed','A tiny round mark','A pet that barks'],decoys:['CUT','POT','FOG']},
 {path:['SAND','HAND','HARD','HARE','HIRE'],clues:['It has five fingers','The opposite of easy','A long-eared cousin of a rabbit'],decoys:['BAND','HARM','HERE']},
 {path:['BOOK','BOOT','BOAT','COAT','COST'],clues:['Footwear that covers the ankle','A small vessel on water','An outer layer worn in winter'],decoys:['BOOM','BEAT','GOAT']},
 {path:['FALL','BALL','BELL','BELT','MELT'],clues:['A round object you throw','It rings to make a sound','It holds up your trousers'],decoys:['WALL','BILL','BEST']},
 {path:['MIND','MINT','MIST','MISS','MOSS'],clues:['A fresh-tasting herb','A fine fog in the air','Fail to hit a target'],decoys:['WIND','LIST','MASS']},
 {path:['HAT','HOT','DOT','DOG','DIG'],clues:['The opposite of cold','A tiny round mark','A pet that barks'],decoys:['HIT','POT','LOG']}
];
export const oneLetter=(a,b)=>a.length===b.length&&[...a].filter((c,i)=>c!==b[i]).length===1;
export function validDuet(board){
 if(board.some(v=>v===null))return false;
 for(let n=0;n<4;n++)if(board.slice(n*4,n*4+4).reduce((a,b)=>a+b,0)!==2||[0,1,2,3].reduce((a,r)=>a+board[r*4+n],0)!==2)return false;
 return [5,6,9,10].reduce((a,i)=>a+board[i],0)===2;
}
const duetBoards=[];
for(let mask=0;mask<65536;mask++){const board=Array.from({length:16},(_,i)=>(mask>>i)&1);if(validDuet(board))duetBoards.push(board)}
export function duetCandidates(board){return duetBoards.filter(b=>board.every((v,i)=>v===null||v===b[i]))}
export function makeDuet(r){const solution=[...duetBoards[Math.floor(r()*duetBoards.length)]],givens=[...solution];let blanks=0;for(const i of shuffle([...Array(16).keys()],r)){const prev=givens[i];givens[i]=null;if(duetCandidates(givens).length!==1)givens[i]=prev;else blanks++;if(blanks===9)break}return{solution,givens,board:[...givens],brush:1}}

export const quickGames=[
 {id:'spot',name:'Oddly',tag:'A detail makes the difference',skill:'Attention',time:'5 patterns',color:'coral',icon:'✦',quick:true,desc:'Same shapes. Different angles. One tile breaks the pattern.',rules:['Find the tile with a different set of shapes. Rotation does not count.','Each tile has four shapes. Compare which shapes it contains, not where they sit. Find all five patterns.']},
 {id:'math',name:'Sumthing',tag:'Think a step ahead',skill:'Mental maths',time:'4 equations',color:'electric',icon:'±',quick:true,desc:'Four missing numbers. Work forwards, then reason backwards.',rules:['Find the missing number. Work through both steps of the equation.','Choose an answer or use keys 1–4. There is no time limit.']},
 {id:'thread',name:'Thread',tag:'One word ties it together',skill:'Wordplay',time:'1 connection',color:'pink',icon:'⌁',quick:true,desc:'One word fits three gaps. Sometimes before, sometimes after.',rules:['Find one word that completes all three compound words.','The gap may come before or after the clue. Unfold the third clue when you need another angle.']},
 {id:'hop',name:'Wordhop',tag:'A few letters from here',skill:'Language',time:'3 little hops',color:'aqua',icon:'↗',quick:true,desc:'Bridge two words with three little hops. Just one letter changes.',rules:['Fill each gap with the word that matches its clue.','Every neighboring word must differ by exactly one letter. Tap a gap, then a word below.']},
 {id:'duet',name:'Duet',tag:'Find the balance',skill:'Logic',time:'1 compact grid',color:'violet',icon:'◐',quick:true,desc:'Ink and ivory. Balance the rows, columns, and the inner square.',rules:['Put two ink and two ivory tiles in every row and column.','The four outlined center squares also need two of each. Choose ink or ivory, then tap a square.','Tiles marked with a dot are fixed clues. Tap your own tile again to clear it.']}
];
export const shapeNames=['circle','triangle','diamond','rounded square','four-point star','cross'];
export function createQuick(id,seed){const r=rng(seed),s={version:2,seconds:0,hints:0,done:false,started:true,errors:0,round:0,feedback:'',solved:false};
 if(id==='spot')s.rounds=Array.from({length:5},()=>{const shapes=shuffle([0,1,2,3,4,5],r).slice(0,3),base=[shapes[0],shapes[1],shapes[2],shapes[0]],oddPattern=[shapes[0],shapes[1],shapes[2],shapes[1]],odd=Math.floor(r()*9);return{count:9,base,oddPattern,odd,turns:Array.from({length:9},()=>Math.floor(r()*4))}});
 if(id==='math')s.rounds=Array.from({length:4},(_,i)=>{const a=4+Math.floor(r()*9),b=3+Math.floor(r()*6),c=3+Math.floor(r()*12),inverse=i%2===1,answer=inverse?a:a*b-c;return{a,b,c,inverse,result:a*b+c,answer,choices:shuffle([answer,answer+1,answer-2,answer+3],r)}});
 if(id==='thread'){const [answer,fragments,decoys]=bridgeSets[Math.floor(r()*bridgeSets.length)];Object.assign(s,{answer,fragments,choices:shuffle([answer,...decoys],r),revealed:2,rejected:[]})}
 if(id==='hop'){const puzzle=hopSets[Math.floor(r()*hopSets.length)];Object.assign(s,{...puzzle,bank:shuffle([...puzzle.path.slice(1,4),...puzzle.decoys],r),slots:[puzzle.path[0],null,null,null,puzzle.path[4]],selected:1})}
 if(id==='duet')Object.assign(s,makeDuet(r));return s;
}
export function quickProgress(id,s){if(id==='thread')return s.solved?1:0;if(id==='hop')return s.slots.slice(1,4).filter((v,i)=>v===s.path[i+1]).length/3;if(id==='duet'){const blanks=s.givens.filter(v=>v===null).length;return s.board.filter((v,i)=>s.givens[i]===null&&v!==null).length/blanks}return s.round/s.rounds.length}
export function quickScore(id,s){return Math.max(0,Math.round(quickProgress(id,s)*1000-s.errors*20-s.hints*40))}
export function quickMove(id,s,value){if(!s.started||s.done)return{ignored:true};let correct=false,complete=false;
 if(id==='spot'||id==='math'){const target=id==='spot'?s.rounds[s.round].odd:s.rounds[s.round].answer;if(value===target){s.round++;correct=true;complete=s.round===s.rounds.length}else{s.errors++;s.feedback=id==='spot'?'Look for a different outline. You’ve got this.':'Not that one. Try another number.'}}
 if(id==='thread'){if(s.rejected.includes(value)||!s.choices[value])return{ignored:true};if(s.choices[value]===s.answer){correct=true;complete=true}else{s.rejected.push(value);s.errors++;s.feedback='It needs to fit every ending. Try another thread.'}}
 if(id==='hop'){const word=s.bank[value];if(!word||s.slots.includes(word))return{ignored:true};s.slots[s.selected]=word;correct=word===s.path[s.selected];if(!correct){s.errors++;s.feedback='Check the clue and change just one letter between neighbors.'}else{s.feedback='That word fits. A little closer.'}complete=s.slots.every((w,i)=>w===s.path[i]);if(correct&&!complete){const next=s.slots.findIndex((w,i)=>i>0&&i<4&&w!==s.path[i]);s.selected=next}}
 if(id==='duet'){if(value<0||value>15||s.givens[value]!==null)return{ignored:true};s.board[value]=s.board[value]===s.brush?null:s.brush;complete=validDuet(s.board);s.feedback=duetConflict(s.board)||'Keep each row, column and the center balanced.'}
 if(correct&&id!=='hop')s.feedback=['Nice find!','That clicked!','Lovely work.'][s.round%3];if(complete)s.solved=true;return{correct,complete};
}
export function shapeSVG(n){const shapes=['<circle cx="30" cy="30" r="17"/>','<path d="M30 9 51 48H9Z"/>','<path d="M30 7 53 30 30 53 7 30Z"/>','<rect x="12" y="12" width="36" height="36" rx="8"/>','<path d="M30 7 36 23 53 30 36 37 30 53 23 37 7 30 23 23Z"/>','<path d="M24 9H36V24H51V36H36V51H24V36H9V24H24Z"/>'];return `<svg viewBox="0 0 60 60" aria-hidden="true">${shapes[n]}</svg>`}
export function quickPreview(g){if(g.id==='spot')return `<div class="spot-preview">${[0,0,4,0].map(shapeSVG).join('')}</div>`;if(g.id==='math')return '<div class="math-preview"><span>7 + 5</span><strong>12<span>✦</span></strong></div>';if(g.id==='thread')return '<div class="thread-preview"><span>RAIN</span><i>↳ BOW<br>↳ COAT</i></div>';if(g.id==='hop')return '<div class="hop-preview"><span>COLD</span><i>↓</i><span>CORD</span></div>';return '<div class="duet-preview"><span>●</span><span>○</span><span>○</span><span>●</span></div>'}
function plant(v){return v===1?'●':v===0?'○':''}
export function quickBoard(g,s){const disabled=s.done?'disabled':'';let label='',tiles='';
 if(g.id==='spot'){const p=s.rounds[Math.min(s.rounds.length-1,s.round)];label=`${s.round} of ${s.rounds.length} patterns found`;tiles=`<div class="sprint-grid spot-grid" style="--columns:3">${Array.from({length:p.count},(_,i)=>{const shapes=i===p.odd?p.oddPattern:p.base;return `<button data-quick="${i}" ${disabled} aria-label="Tile ${i+1}: ${shapes.map(n=>shapeNames[n]).join(', ')}" class="spot-tile"><span class="shape-motif" style="transform:rotate(${p.turns[i]*90}deg)">${shapes.map(shapeSVG).join('')}</span></button>`}).join('')}</div>`}
 if(g.id==='math'){const p=s.rounds[Math.min(s.rounds.length-1,s.round)];label=`${s.round} of ${s.rounds.length} solved`;tiles=`<div class="equation two-step">${p.inverse?`<strong>?</strong><b>×</b><span>${p.b}</span><b>+</b><span>${p.c}</span><b>=</b><span>${p.result}</span>`:`<span>${p.a}</span><b>×</b><span>${p.b}</span><b>−</b><span>${p.c}</span><b>=</b><strong>?</strong>`}</div><div class="math-options">${p.choices.map((n,i)=>`<button data-quick="${n}" ${disabled}><small>${i+1}</small>${n}</button>`).join('')}</div><span class="keyboard-tip">Choose an answer · keyboard keys 1–4</span>`}
 if(g.id==='thread'){label='One word. Three connections.';tiles=`<div class="thread-clues">${s.fragments.map(([before,after],i)=>`<div class="thread-clue ${i>=s.revealed?'folded':''}">${i<s.revealed?`${before?`<strong>${before}</strong>`:''}<span class="thread-blank">?</span>${after?`<strong>${after}</strong>`:''}`:'<button data-action="unfold">Unfold third clue ↗</button>'}</div>`).join('')}</div><div class="thread-bank">${s.choices.map((w,i)=>`<button data-quick="${i}" ${s.rejected.includes(i)?'disabled':''}>${w}${s.rejected.includes(i)?' ×':''}</button>`).join('')}</div>`}
 if(g.id==='hop'){label=`${s.slots.slice(1,4).filter((v,i)=>v===s.path[i+1]).length} of 3 bridges placed`;tiles=`<div class="word-ladder">${s.slots.map((w,i)=>`<div class="ladder-row ${i===s.selected?'active':''} ${i===0||i===4?'endpoint':''}"><span class="ladder-step">${i===0?'START':i===4?'FINISH':i}</span>${i===0||i===4?`<strong>${w}</strong>`:`<button data-slot="${i}" aria-pressed="${i===s.selected}" class="${w&&w!==s.path[i]?'wrong-word':''}">${w||'· '.repeat(s.path[i].length)}<small>${s.clues[i-1]}</small></button>`}${i>0&&w&&s.slots[i-1]?`<span class="link-check" aria-label="${oneLetter(w,s.slots[i-1])?'one letter changed':'change more than one letter'}">${oneLetter(w,s.slots[i-1])?'✓':'↯'}</span>`:''}</div>`).join('')}</div><div class="hop-bank">${s.bank.map((w,i)=>`<button data-quick="${i}" ${s.slots.includes(w)?'disabled':''}>${w}</button>`).join('')}</div><button class="hop-clear" data-action="hop-clear" ${!s.slots[s.selected]?'disabled':''}>Clear selected gap</button>`}
 if(g.id==='duet'){const center=[5,6,9,10],flowers=center.filter(i=>s.board[i]===1).length,leaves=center.filter(i=>s.board[i]===0).length;label=`Center: ${flowers}/2 ink · ${leaves}/2 ivory`;tiles=`<div class="plant-tools"><button data-plant="1" aria-pressed="${s.brush===1}">● Ink</button><button data-plant="0" aria-pressed="${s.brush===0}">○ Ivory</button></div><div class="garden-frame"><div class="garden-columns">${[0,1,2,3].map(c=>`<span>${[0,1,2,3].filter(r=>s.board[r*4+c]===1).length}/2 ●</span>`).join('')}</div><div class="garden-grid">${s.board.map((v,i)=>`<button data-quick="${i}" ${s.givens[i]!==null?'disabled':''} class="garden-tile ${v===1?'flower':v===0?'leaf':'empty'} ${center.includes(i)?'center-garden':''} ${s.givens[i]!==null?'fixed':''}" aria-label="Row ${Math.floor(i/4)+1}, column ${i%4+1}, ${v===null?'empty':v===1?'ink':'ivory'}${s.givens[i]!==null?', fixed clue':''}">${plant(v)}${s.givens[i]!==null?'<small>•</small>':''}</button>`).join('')}</div><div class="garden-rows">${[0,1,2,3].map(r=>`<span>${s.board.slice(r*4,r*4+4).filter(v=>v===1).length}/2 ●</span>`).join('')}</div></div><div class="garden-caption">Each row & column: 2 ● + 2 ○<br>Outlined center: 2 ● + 2 ○</div>`}
 const progress=quickProgress(g.id,s);return `<div class="sprint-score"><span>${label}</span><strong><span class="score-value">${quickScore(g.id,s)}</span> pts</strong></div><div class="sprint-meter" role="progressbar" aria-label="Puzzle progress" aria-valuenow="${Math.round(progress*100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${progress*100}%"></i></div><div class="quick-arena">${tiles}</div><p class="sprint-feedback" role="status">${s.feedback||'A little curiosity is all you need.'}</p>`;
}

export function duetConflict(board){const groups=[...Array.from({length:4},(_,r)=>({name:`Row ${r+1}`,cells:[0,1,2,3].map(c=>r*4+c)})),...Array.from({length:4},(_,c)=>({name:`Column ${c+1}`,cells:[0,1,2,3].map(r=>r*4+c)})),{name:"The outlined center",cells:[5,6,9,10]}];for(const g of groups)for(const v of [0,1])if(g.cells.filter(i=>board[i]===v).length>2)return `${g.name} has too many ${v?"ink":"ivory"} tiles. Aim for two of each.`;return ""}
