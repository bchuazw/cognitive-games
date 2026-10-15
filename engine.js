export const dayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export function rng(seed){let n=2166136261;for(const c of String(seed))n=Math.imul(n^c.charCodeAt(0),16777619);return()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
export function shuffle(a,r){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export const adjacent=(a,b,n)=>Math.abs(a%n-b%n)+Math.abs(Math.floor(a/n)-Math.floor(b/n))===1;
export function trail(r){let path=[];for(let row=0;row<5;row++)for(let c=0;c<5;c++)path.push(row*5+(row%2?4-c:c));for(let k=0;k<120;k++){const end=path.at(-1),near=path.map((v,i)=>adjacent(end,v,5)&&i<23?i:-1).filter(i=>i>=0);if(near.length){const i=near[Math.floor(r()*near.length)];path=[...path.slice(0,i+1),...path.slice(i+1).reverse()]}}if(r()<.5)path.reverse();return {solution:path,anchors:[0,5,10,15,20,24].map((i,j)=>({cell:path[i],label:j+1}))}}
export function crowns(r){const options=[];function visit(a){if(a.length===5){options.push(a);return}for(let c=0;c<5;c++)if(!a.includes(c)&&(!a.length||Math.abs(c-a.at(-1))>1))visit([...a,c])}visit([]);const cols=options[Math.floor(r()*options.length)],solution=cols.map((c,i)=>i*5+c),regions=Array(25).fill(-1);solution.forEach((v,i)=>regions[v]=i);while(regions.includes(-1)){const candidates=[];regions.forEach((v,i)=>{if(v<0)for(let j=0;j<25;j++)if(regions[j]>=0&&adjacent(i,j,5))candidates.push([i,regions[j]])});const [i,v]=candidates[Math.floor(r()*candidates.length)];regions[i]=v}return{solution,regions}}
export function validCrowns(cells,regions){return cells.length===5&&cells.every((a,i)=>cells.every((b,j)=>i===j||(a%5!==b%5&&Math.floor(a/5)!==Math.floor(b/5)&&regions[a]!==regions[b]&&(Math.abs(a%5-b%5)>1||Math.abs(Math.floor(a/5)-Math.floor(b/5))>1))))}
export function completeCrowns(pinned,regions){
 function search(row,placed){
  if(row===5)return validCrowns(placed,regions)&&pinned.every(i=>placed.includes(i))?placed:null;
  const fixed=pinned.filter(i=>Math.floor(i/5)===row);
  if(fixed.length>1)return null;
  for(const i of fixed.length?fixed:Array.from({length:5},(_,c)=>row*5+c)){
   if(placed.some(j=>i%5===j%5||regions[i]===regions[j]||(Math.abs(i%5-j%5)<=1&&Math.abs(row-Math.floor(j/5))<=1)))continue;
   const result=search(row+1,[...placed,i]);if(result)return result;
  }
  return null;
 }
 return search(0,[]);
}
export function sudokuSolutions(board,limit=2){let count=0;function go(){let chosen=-1,opts=[];for(let i=0;i<36;i++)if(!board[i]){const p=[1,2,3,4,5,6].filter(v=>!conflicts(board,i,v));if(!p.length)return;if(chosen<0||p.length<opts.length){chosen=i;opts=p}}if(chosen<0){count++;return}for(const v of opts){board[chosen]=v;go();board[chosen]=0;if(count>=limit)return}}go();return count}
export function conflicts(board,i,v){return board.some((x,j)=>x===v&&i!==j&&(Math.floor(i/6)===Math.floor(j/6)||i%6===j%6||(Math.floor(i/12)===Math.floor(j/12)&&Math.floor(i%6/3)===Math.floor(j%6/3))))}
export function sudoku(r){const digits=shuffle([1,2,3,4,5,6],r),rows=shuffle([0,1,2],r).flatMap(b=>shuffle([b*2,b*2+1],r)),cols=shuffle([0,1],r).flatMap(b=>shuffle([b*3,b*3+1,b*3+2],r));const solution=rows.flatMap(row=>cols.map(col=>digits[(row*3+Math.floor(row/2)+col)%6]));const givens=[...solution];for(const i of shuffle([...Array(36).keys()],r)){const v=givens[i];givens[i]=0;if(sudokuSolutions([...givens])!==1)givens[i]=v;if(givens.filter(Boolean).length<=15)break}return{solution,givens}}
export const wordSets=[
[['Things with keys','PIANO','KEYBOARD','LOCK','MAP'],['Shades of green','SAGE','MINT','OLIVE','EMERALD'],['In the night sky','MOON','STAR','COMET','PLANET'],['Ways to move','SKIP','HOP','CRAWL','SPRINT']],
[['Parts of a book','SPINE','COVER','PAGE','CHAPTER'],['Pasta shapes','PENNE','FUSILLI','RIGATONI','FARFALLE'],['Weather','HAIL','SLEET','RAIN','SNOW'],['Chess pieces','ROOK','PAWN','BISHOP','KNIGHT']],
[['On a tree','BARK','BRANCH','LEAF','ROOT'],['Types of dance','SALSA','TANGO','WALTZ','BALLET'],['Units of time','SECOND','MINUTE','HOUR','WEEK'],['At the beach','SAND','SHELL','WAVE','DUNE']],
[['Things you can tie','KNOT','SHOELACE','RIBBON','NECKTIE'],['Citrus fruit','LEMON','LIME','ORANGE','GRAPEFRUIT'],['Things with wheels','CAR','BUS','SCOOTER','SKATEBOARD'],['In a toolbox','HAMMER','PLIERS','WRENCH','DRILL']],
[['Card suits','HEARTS','CLUBS','SPADES','DIAMONDS'],['Baking ingredients','FLOUR','YEAST','SUGAR','BUTTER'],['Types of boat','CANOE','KAYAK','YACHT','FERRY'],['Big cats','LION','TIGER','JAGUAR','LEOPARD']],
[['Computer actions','SAVE','COPY','PASTE','UNDO'],['Garden flowers','ROSE','TULIP','DAISY','IRIS'],['Greek letters','ALPHA','BETA','GAMMA','DELTA'],['Parts of a shoe','SOLE','HEEL','LACE','TONGUE']],
[['Coffee orders','LATTE','MOCHA','ESPRESSO','CAPPUCCINO'],['In an orchestra','CELLO','OBOE','VIOLIN','BASSOON'],['Swimming strokes','FREESTYLE','BACKSTROKE','BREASTSTROKE','BUTTERFLY'],['Shapes','CIRCLE','SQUARE','TRIANGLE','HEXAGON']],
[['Ways to cook','BAKE','STEAM','ROAST','FRY'],['Precious stones','RUBY','SAPPHIRE','OPAL','TOPAZ'],['On a bicycle','PEDAL','SADDLE','HANDLEBAR','CHAIN'],['Baby animals','CUB','CALF','FOAL','KITTEN']]
];
export function words(r){const groups=wordSets[Math.floor(r()*wordSets.length)];return{groups,tiles:shuffle(groups.flatMap(g=>g.slice(1)),r)}}
