window.MI=window.MI||{};
MI.TOKENS={pawn:{name:'بيدق',icon:'♟️',color:'#38c86b'},car:{name:'سيارة',icon:'🚗',color:'#2d8cf0'},hat:{name:'قبعة',icon:'🎩',color:'#f2b92f'},plane:{name:'طائرة',icon:'✈️',color:'#a85bea'},horse:{name:'حصان',icon:'🐎',color:'#22bdc7'},ship:{name:'سفينة',icon:'⛵',color:'#f0782c'}};
MI.GROUPS={brown:{name:'بغداد القديمة',color:'#8b5a2b'},cyan:{name:'بغداد الحديثة',color:'#69cbe8'},pink:{name:'مجموعة الفرات',color:'#d64aa0'},orange:{name:'مجموعة الوسط',color:'#e88a31'},red:{name:'مجموعة الجنوب',color:'#d94b43'},yellow:{name:'مجموعة الشمال',color:'#e1c82f'},green:{name:'الشمال الشرقي',color:'#3aa35b'},blue:{name:'مجموعة الجبال',color:'#2756a3'}};
MI.BOARD=[
{type:'go',name:'نقطة البداية',icon:'🚩'},
{type:'property',name:'الأعظمية',group:'brown',price:60,rent:2},
{type:'community',name:'صندوق الحظ',icon:'🎁'},
{type:'property',name:'الكاظمية',group:'brown',price:60,rent:4},
{type:'tax',name:'رسوم البلدية',amount:200,icon:'🏛️'},
{type:'railroad',name:'محطة بغداد',price:200,icon:'🚂'},
{type:'property',name:'الكرادة',group:'cyan',price:100,rent:6},
{type:'chance',name:'فرصة',icon:'❓'},
{type:'property',name:'المنصور',group:'cyan',price:100,rent:6},
{type:'property',name:'الجادرية',group:'cyan',price:120,rent:8},
{type:'jail',name:'السجن / زيارة فقط',icon:'⛓️'},
{type:'property',name:'الحلة',group:'pink',price:140,rent:10},
{type:'utility',name:'الكهرباء',price:150,icon:'💡'},
{type:'property',name:'بابل',group:'pink',price:140,rent:10},
{type:'property',name:'كربلاء',group:'pink',price:160,rent:12},
{type:'railroad',name:'محطة الفرات',price:200,icon:'🚂'},
{type:'property',name:'النجف',group:'orange',price:180,rent:14},
{type:'community',name:'صندوق الحظ',icon:'🎁'},
{type:'property',name:'الكوفة',group:'orange',price:180,rent:14},
{type:'property',name:'الديوانية',group:'orange',price:200,rent:16},
{type:'free',name:'الاستراحة',icon:'🅿️'},
{type:'property',name:'الناصرية',group:'red',price:220,rent:18},
{type:'chance',name:'فرصة',icon:'❓'},
{type:'property',name:'العمارة',group:'red',price:220,rent:18},
{type:'property',name:'البصرة',group:'red',price:240,rent:20},
{type:'railroad',name:'محطة الجنوب',price:200,icon:'🚂'},
{type:'property',name:'سامراء',group:'yellow',price:260,rent:22},
{type:'property',name:'تكريت',group:'yellow',price:260,rent:22},
{type:'utility',name:'الماء',price:150,icon:'🚰'},
{type:'property',name:'الموصل',group:'yellow',price:280,rent:24},
{type:'gotojail',name:'اذهب إلى السجن',icon:'👮'},
{type:'property',name:'كركوك',group:'green',price:300,rent:26},
{type:'property',name:'أربيل',group:'green',price:300,rent:26},
{type:'community',name:'صندوق الحظ',icon:'🎁'},
{type:'property',name:'السليمانية',group:'green',price:320,rent:28},
{type:'railroad',name:'محطة الشمال',price:200,icon:'🚂'},
{type:'chance',name:'فرصة',icon:'❓'},
{type:'property',name:'دهوك',group:'blue',price:350,rent:35},
{type:'tax',name:'ضريبة الرفاهية',amount:100,icon:'💎'},
{type:'property',name:'زاخو',group:'blue',price:400,rent:50}
];
MI.PURCHASABLE=new Set(MI.BOARD.map((s,i)=>s.price?i:null).filter(i=>i!==null));
MI.$=s=>document.querySelector(s); MI.$$=s=>Array.from(document.querySelectorAll(s));
MI.fmt=n=>Number(n||0).toLocaleString('en-US'); MI.sleep=ms=>new Promise(r=>setTimeout(r,ms));
MI.diceFace=n=>['⚀','⚁','⚂','⚃','⚄','⚅'][Math.max(1,Math.min(6,Number(n)||1))-1];
MI.tokenInfo=id=>MI.TOKENS[id]||MI.TOKENS.pawn;
MI.esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
MI.gridPosition=i=>{if(i===0)return{r:11,c:1,side:'side-bottom'};if(i<10)return{r:11-i,c:1,side:'side-left'};if(i===10)return{r:1,c:1,side:'side-left'};if(i<20)return{r:1,c:i-9,side:'side-top'};if(i===20)return{r:1,c:11,side:'side-top'};if(i<30)return{r:i-19,c:11,side:'side-right'};if(i===30)return{r:11,c:11,side:'side-right'};return{r:11,c:41-i,side:'side-bottom'};};
MI.rawPos=pos=>{if(pos===0)return{x:6,y:94};if(pos<10)return{x:6,y:94-pos*8.8};if(pos===10)return{x:6,y:6};if(pos<20)return{x:6+(pos-10)*8.8,y:6};if(pos===20)return{x:94,y:6};if(pos<30)return{x:94,y:6+(pos-20)*8.8};if(pos===30)return{x:94,y:94};return{x:94-(pos-30)*8.8,y:94};};
MI.tokenPosition=(pos,i)=>{const off=[[-1.3,-1.3],[1.3,-1.3],[-1.3,1.3],[1.3,1.3],[0,-2.4],[0,2.4]][i%6],b=MI.rawPos(pos);return{x:b.x+off[0],y:b.y+off[1]};};
MI.buildBoard=()=>{const board=MI.$('#board');if(!board)return;MI.$$('.space').forEach(x=>x.remove());MI.BOARD.forEach((s,i)=>{const p=MI.gridPosition(i),el=document.createElement('div');el.className=`space ${p.side}${[0,10,20,30].includes(i)?' corner':''}`;el.dataset.index=i;el.style.gridRow=p.r;el.style.gridColumn=p.c;if(s.group){el.style.setProperty('--group',MI.GROUPS[s.group].color);el.innerHTML='<div class="bar"></div>';}el.innerHTML+=`<div class="inner"><div class="icon">${s.icon||'🏘️'}</div><div class="name">${s.name}</div>${s.price?`<div class="price">${MI.fmt(s.price)} د.ع</div>`:''}</div><div class="buildings"></div>`;board.appendChild(el);});};