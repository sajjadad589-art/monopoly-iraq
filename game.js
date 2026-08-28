'use strict';

const CURRENCY = 'د.ع';
const START_CASH = 1500;
const GO_REWARD = 200;
const JAIL_FINE = 50;

const TOKEN_OPTIONS = [
  { id: 'pawn', name: 'بيدق', icon: '♟️', color: '#38c86b' },
  { id: 'car', name: 'سيارة', icon: '🚗', color: '#2d8cf0' },
  { id: 'hat', name: 'قبعة', icon: '🎩', color: '#f2b92f' },
  { id: 'plane', name: 'طائرة', icon: '✈️', color: '#a85bea' },
  { id: 'horse', name: 'حصان', icon: '🐎', color: '#22bdc7' },
  { id: 'ship', name: 'سفينة', icon: '⛵', color: '#f0782c' }
];

const GROUPS = {
  brown:{name:'بغداد القديمة',color:'#8b5a2b'}, cyan:{name:'بغداد الحديثة',color:'#69cbe8'},
  pink:{name:'مجموعة الفرات',color:'#d64aa0'}, orange:{name:'مجموعة الوسط',color:'#e88a31'},
  red:{name:'مجموعة الجنوب',color:'#d94b43'}, yellow:{name:'مجموعة الشمال',color:'#e1c82f'},
  green:{name:'الشمال الشرقي',color:'#3aa35b'}, blue:{name:'مجموعة الجبال',color:'#2756a3'}
};

const BOARD = [
{type:'go',name:'نقطة البداية',icon:'🚩'},
{type:'property',name:'الأعظمية',group:'brown',price:60,rent:[2,10,30,90,160,250]},
{type:'community',name:'صندوق الحظ',icon:'🎁'},
{type:'property',name:'الكاظمية',group:'brown',price:60,rent:[4,20,60,180,320,450]},
{type:'tax',name:'رسوم البلدية',amount:200,icon:'🏛️'},
{type:'railroad',name:'محطة بغداد',price:200,icon:'🚂'},
{type:'property',name:'الكرادة',group:'cyan',price:100,rent:[6,30,90,270,400,550]},
{type:'chance',name:'فرصة',icon:'❓'},
{type:'property',name:'المنصور',group:'cyan',price:100,rent:[6,30,90,270,400,550]},
{type:'property',name:'الجادرية',group:'cyan',price:120,rent:[8,40,100,300,450,600]},
{type:'jail',name:'السجن / زيارة فقط',icon:'⛓️'},
{type:'property',name:'الحلة',group:'pink',price:140,rent:[10,50,150,450,625,750]},
{type:'utility',name:'الكهرباء',price:150,icon:'💡'},
{type:'property',name:'بابل',group:'pink',price:140,rent:[10,50,150,450,625,750]},
{type:'property',name:'كربلاء',group:'pink',price:160,rent:[12,60,180,500,700,900]},
{type:'railroad',name:'محطة الفرات',price:200,icon:'🚂'},
{type:'property',name:'النجف',group:'orange',price:180,rent:[14,70,200,550,750,950]},
{type:'community',name:'صندوق الحظ',icon:'🎁'},
{type:'property',name:'الكوفة',group:'orange',price:180,rent:[14,70,200,550,750,950]},
{type:'property',name:'الديوانية',group:'orange',price:200,rent:[16,80,220,600,800,1000]},
{type:'free',name:'الاستراحة',icon:'🅿️'},
{type:'property',name:'الناصرية',group:'red',price:220,rent:[18,90,250,700,875,1050]},
{type:'chance',name:'فرصة',icon:'❓'},
{type:'property',name:'العمارة',group:'red',price:220,rent:[18,90,250,700,875,1050]},
{type:'property',name:'البصرة',group:'red',price:240,rent:[20,100,300,750,925,1100]},
{type:'railroad',name:'محطة الجنوب',price:200,icon:'🚂'},
{type:'property',name:'سامراء',group:'yellow',price:260,rent:[22,110,330,800,975,1150]},
{type:'property',name:'تكريت',group:'yellow',price:260,rent:[22,110,330,800,975,1150]},
{type:'utility',name:'الماء',price:150,icon:'🚰'},
{type:'property',name:'الموصل',group:'yellow',price:280,rent:[24,120,360,850,1025,1200]},
{type:'gotojail',name:'اذهب إلى السجن',icon:'👮'},
{type:'property',name:'كركوك',group:'green',price:300,rent:[26,130,390,900,1100,1275]},
{type:'property',name:'أربيل',group:'green',price:300,rent:[26,130,390,900,1100,1275]},
{type:'community',name:'صندوق الحظ',icon:'🎁'},
{type:'property',name:'السليمانية',group:'green',price:320,rent:[28,150,450,1000,1200,1400]},
{type:'railroad',name:'محطة الشمال',price:200,icon:'🚂'},
{type:'chance',name:'فرصة',icon:'❓'},
{type:'property',name:'دهوك',group:'blue',price:350,rent:[35,175,500,1100,1300,1500]},
{type:'tax',name:'ضريبة الرفاهية',amount:100,icon:'💎'},
{type:'property',name:'زاخو',group:'blue',price:400,rent:[50,200,600,1400,1700,2000]}
];

const state={players:[],current:0,owners:Array(40).fill(null),buildings:Array(40).fill(0),rolling:false,pendingPurchase:null,lastRoll:[1,1],gameStarted:false,afterMove:false};
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const money=n=>`${Number(n).toLocaleString('en-US')} ${CURRENCY}`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const diceFace=n=>['⚀','⚁','⚂','⚃','⚄','⚅'][n-1];
const isPurchasable=s=>['property','railroad','utility'].includes(s.type);

function setupUI(){
  renderNameInputs(4);
  const root=$('#playerCount');
  root.innerHTML='';
  [2,3,4,5,6].forEach(n=>{const b=document.createElement('button');b.className='count-btn'+(n===4?' active':'');b.textContent=n;b.onclick=()=>{$$('.count-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderNameInputs(n)};root.appendChild(b)});
  $('#startBtn').onclick=startGame; $('#rollBtn').onclick=rollDice; $('#buyBtn').onclick=buyCurrentSpace; $('#endTurnBtn').onclick=endTurn;
  $('#manageBtn').onclick=()=>showMessage('أملاكك',renderOwnedList(currentPlayer()));
  $('#tradeBtn').onclick=()=>showMessage('التداول','<p>ميزة التداول نضيفها بالمرحلة التالية.</p>');
}

function renderNameInputs(count){
  const names=['سجاد','فرح','علي','نور','حسين','مريم']; const root=$('#nameInputs'); root.innerHTML='';
  for(let i=0;i<count;i++){
    const row=document.createElement('div'); row.className='setup-player-row';
    row.innerHTML=`<input data-name="${i}" value="${names[i]||`اللاعب ${i+1}`}" placeholder="اسم اللاعب ${i+1}"><select data-token="${i}">${TOKEN_OPTIONS.map((t,j)=>`<option value="${t.id}" ${i%TOKEN_OPTIONS.length===j?'selected':''}>${t.icon} ${t.name}</option>`).join('')}</select>`;
    root.appendChild(row);
  }
}

function startGame(){
  const ns=$$('#nameInputs [data-name]'), ts=$$('#nameInputs [data-token]');
  state.players=ns.map((input,i)=>{const token=TOKEN_OPTIONS.find(t=>t.id===ts[i].value)||TOKEN_OPTIONS[i%TOKEN_OPTIONS.length];return{id:i,name:input.value.trim()||`اللاعب ${i+1}`,icon:token.icon,color:token.color,cash:START_CASH,pos:0,inJail:false,jailTurns:0,bankrupt:false}});
  state.current=0;state.owners=Array(40).fill(null);state.buildings=Array(40).fill(0);state.pendingPurchase=null;state.gameStarted=true;
  $('#setupScreen').classList.add('hidden');$('#gameScreen').classList.remove('hidden');buildBoard();renderAll();log(`بدأت اللعبة. الرصيد الابتدائي <b>${money(START_CASH)}</b>.`);beginTurn();
}

function gridPosition(i){
  if(i===0)return{r:11,c:1,side:'side-bottom'}; if(i>0&&i<10)return{r:11-i,c:1,side:'side-left'}; if(i===10)return{r:1,c:1,side:'side-left'};
  if(i>10&&i<20)return{r:1,c:i-9,side:'side-top'}; if(i===20)return{r:1,c:11,side:'side-top'}; if(i>20&&i<30)return{r:i-19,c:11,side:'side-right'};
  if(i===30)return{r:11,c:11,side:'side-right'}; return{r:11,c:41-i,side:'side-bottom'};
}

function buildBoard(){
  const board=$('#board'); $$('.space').forEach(x=>x.remove());
  BOARD.forEach((s,i)=>{const el=document.createElement('div');el.className='space';el.dataset.index=i;const p=gridPosition(i);el.classList.add(p.side);if([0,10,20,30].includes(i))el.classList.add('corner');el.style.gridRow=p.r;el.style.gridColumn=p.c;
    if(s.group){el.style.setProperty('--group',GROUPS[s.group].color);const bar=document.createElement('div');bar.className='bar';el.appendChild(bar)}
    const inner=document.createElement('div');inner.className='inner';inner.innerHTML=`<div class="icon">${s.icon||'🏘️'}</div><div class="name">${s.name}</div>${s.price?`<div class="price">${money(s.price)}</div>`:''}`;el.appendChild(inner);const b=document.createElement('div');b.className='buildings';el.appendChild(b);board.appendChild(el)});
}

function currentPlayer(){return state.players[state.current]}
function renderAll(){renderPlayers();renderBoardState();renderTokens();renderSpaceCard();renderButtons()}

function renderPlayers(){const root=$('#playersPanel');root.innerHTML='';state.players.forEach((p,i)=>{const d=document.createElement('div');d.className='player-card'+(i===state.current?' active':'')+(p.bankrupt?' bankrupt':'');d.style.setProperty('--pc',p.color);d.innerHTML=`<div class="player-head"><strong>${p.icon} ${p.name}</strong></div><div class="cash">${money(p.cash)}</div><div class="asset-count">${state.owners.filter(o=>o===p.id).length} ملكية</div>${p.inJail?'<div class="jail-label">⛓️ في السجن</div>':''}`;root.appendChild(d)})}

function renderBoardState(){
  $$('.space').forEach(el=>el.classList.remove('current-space'));
  const p=currentPlayer();if(p){const c=$(`.space[data-index="${p.pos}"]`);if(c)c.classList.add('current-space')}
  BOARD.forEach((s,i)=>{const el=$(`.space[data-index="${i}"]`);if(!el)return;const owner=state.owners[i];el.classList.toggle('owned',owner!==null);if(owner!==null)el.style.setProperty('--owner',state.players[owner].color);const b=el.querySelector('.buildings');b.innerHTML='';if(state.buildings[i]===5)b.innerHTML='🏨';else for(let j=0;j<state.buildings[i];j++)b.innerHTML+='🏠'})
}

function rawTokenPosition(pos){if(pos===0)return{x:6,y:94};if(pos<10)return{x:6,y:94-pos*8.8};if(pos===10)return{x:6,y:6};if(pos<20)return{x:6+(pos-10)*8.8,y:6};if(pos===20)return{x:94,y:6};if(pos<30)return{x:94,y:6+(pos-20)*8.8};if(pos===30)return{x:94,y:94};return{x:94-(pos-30)*8.8,y:94}}
function tokenPosition(pos,i){const os=[[-1.2,-1.2],[1.2,-1.2],[-1.2,1.2],[1.2,1.2],[0,-2.4],[0,2.4]][i%6],b=rawTokenPosition(pos);return{x:b.x+os[0],y:b.y+os[1]}}
function renderTokens(){const layer=$('#tokensLayer');layer.innerHTML='';state.players.forEach((p,i)=>{if(p.bankrupt)return;const el=document.createElement('div');el.className='token';el.textContent=p.icon;el.style.setProperty('--pc',p.color);const pt=tokenPosition(p.pos,i);el.style.left=pt.x+'%';el.style.top=pt.y+'%';layer.appendChild(el)})}

function metaForSpace(s){if(s.type==='go')return`استلم ${money(GO_REWARD)} عند المرور.`;if(s.type==='tax')return`ادفع ${money(s.amount)}.`;if(s.type==='chance')return'اسحب بطاقة فرصة.';if(s.type==='community')return'اسحب بطاقة صندوق الحظ.';if(s.type==='jail')return'زيارة فقط أو سجن.';if(s.type==='free')return'استراحة مجانية.';if(s.type==='gotojail')return'اذهب مباشرة إلى السجن.';if(s.price)return`سعر الشراء ${money(s.price)}.`;return''}
function renderSpaceCard(){const p=currentPlayer();if(!p)return;const s=BOARD[p.pos];$('#spaceName').textContent=s.name;$('#spaceMeta').textContent=metaForSpace(s);$('#spaceColor').style.background=s.group?GROUPS[s.group].color:'#7d8fa3';const owner=state.owners[p.pos];$('#spaceOwner').textContent=owner!==null?`المالك: ${state.players[owner].name}`:''}

function renderButtons(){const p=currentPlayer();if(!p)return;$('#buyBtn').classList.add('hidden');$('#endTurnBtn').classList.add('hidden');$('#rollBtn').classList.remove('hidden');if(state.pendingPurchase!==null){$('#buyBtn').classList.remove('hidden');$('#endTurnBtn').classList.remove('hidden');$('#rollBtn').classList.add('hidden')}else if(state.afterMove){$('#endTurnBtn').classList.remove('hidden');$('#rollBtn').classList.add('hidden')}}
function beginTurn(){state.pendingPurchase=null;state.afterMove=false;renderAll();$('#statusStrip').textContent=`دور ${currentPlayer().name}. اضغط رمي النرد.`}

async function rollDice(){const p=currentPlayer();if(!p||state.rolling||state.pendingPurchase!==null)return;state.rolling=true;const d1=Math.floor(Math.random()*6)+1,d2=Math.floor(Math.random()*6)+1;state.lastRoll=[d1,d2];await animateDice(d1,d2);const total=d1+d2;$('#statusStrip').textContent=`${p.name} حصل على ${total}`;await movePlayerSmooth(p,total);await handleLanding(p);state.afterMove=true;state.rolling=false;renderAll()}
async function animateDice(d1,d2){const a=$('#die1'),b=$('#die2');a.classList.add('rolling');b.classList.add('rolling');for(let i=0;i<8;i++){a.textContent=diceFace(Math.floor(Math.random()*6)+1);b.textContent=diceFace(Math.floor(Math.random()*6)+1);await sleep(65)}a.textContent=diceFace(d1);b.textContent=diceFace(d2);await sleep(180);a.classList.remove('rolling');b.classList.remove('rolling')}
async function movePlayerSmooth(p,steps){for(let i=0;i<steps;i++){p.pos=(p.pos+1)%40;if(p.pos===0){p.cash+=GO_REWARD;log(`${p.name} عبر البداية واستلم ${money(GO_REWARD)}.`)}renderBoardState();renderTokens();renderSpaceCard();await sleep(320)}}

async function handleLanding(p){const i=p.pos,s=BOARD[i];log(`${p.icon} <b>${p.name}</b> وصل إلى <b>${s.name}</b>.`);if(s.type==='gotojail'){p.pos=10;p.inJail=true;$('#statusStrip').textContent=`${p.name} ذهب إلى السجن.`;return}if(s.type==='tax'){p.cash-=s.amount;log(`${p.name} دفع ${money(s.amount)}.`);return}if(s.type==='chance'||s.type==='community'){const delta=[-50,-25,20,50,100][Math.floor(Math.random()*5)];p.cash+=delta;log(`${s.name}: ${delta>=0?'استلم':'دفع'} ${money(Math.abs(delta))}.`);return}if(!isPurchasable(s))return;const owner=state.owners[i];if(owner===null){state.pendingPurchase=i;$('#statusStrip').textContent=`${s.name} متاح للشراء. اشترِ العقار أو أنهِ الدور بدون شراء.`;return}if(owner===p.id){$('#statusStrip').textContent='هذا العقار ملكك.';return}const rent=calculateRent(i);p.cash-=rent;state.players[owner].cash+=rent;log(`${p.name} دفع إيجار ${money(rent)} إلى ${state.players[owner].name}.`)}
function calculateRent(i){const s=BOARD[i];if(s.type==='railroad'){const owner=state.owners[i],count=state.owners.filter((o,j)=>o===owner&&BOARD[j].type==='railroad').length;return[0,25,50,100,200][count]||25}if(s.type==='utility'){const owner=state.owners[i],count=state.owners.filter((o,j)=>o===owner&&BOARD[j].type==='utility').length;return(state.lastRoll[0]+state.lastRoll[1])*(count===2?10:4)}return s.rent? s.rent[state.buildings[i]||0]:0}
function buyCurrentSpace(){if(state.pendingPurchase===null)return;const i=state.pendingPurchase,p=currentPlayer(),s=BOARD[i];if(p.cash<s.price){$('#statusStrip').textContent='الرصيد غير كافي.';return}p.cash-=s.price;state.owners[i]=p.id;state.pendingPurchase=null;log(`${p.name} اشترى ${s.name} بـ ${money(s.price)}.`);renderAll();$('#statusStrip').textContent=`تم شراء ${s.name}. يمكنك إنهاء الدور.`}
function endTurn(){if(state.rolling)return;state.pendingPurchase=null;state.afterMove=false;do{state.current=(state.current+1)%state.players.length}while(state.players[state.current].bankrupt);beginTurn()}
function renderOwnedList(p){const arr=state.owners.map((o,i)=>({o,i})).filter(x=>x.o===p.id);return arr.length?`<ul>${arr.map(x=>`<li>${BOARD[x.i].name}</li>`).join('')}</ul>`:'<p>ما عندك أملاك حالياً.</p>'}
function showMessage(title,body){const root=$('#modalRoot'),tpl=$('#modalTemplate');root.innerHTML='';const node=tpl.content.firstElementChild.cloneNode(true);node.querySelector('.modal-title').textContent=title;node.querySelector('.modal-body').innerHTML=body;node.querySelector('.modal-close').onclick=()=>root.innerHTML='';root.appendChild(node)}
function log(msg){const el=$('#gameLog');if(!el)return;const d=document.createElement('div');d.className='log-entry';d.innerHTML=msg;el.prepend(d)}

setupUI();
