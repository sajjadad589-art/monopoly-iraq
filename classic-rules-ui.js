window.MI=window.MI||{};
(()=>{
  const oldRenderControls=MI.renderControls;
  const oldRenderBoardState=MI.renderBoardState;
  const oldRenderLog=MI.renderLog;
  const oldOpenAssets=MI.openAssets;
  let lastCardShown=0;

  MI.showClassicCard=action=>{
    if(!action||action.action_type!=='card')return;
    const p=action.payload||{};
    const deck=p.deck==='chance'?'فرصة':'صندوق الحظ';
    const icon=p.deck==='chance'?'❓':'🎁';
    MI.modal(`${icon} ${deck}`,`<div class="classic-card ${p.deck==='chance'?'chance-card':'community-card'}"><div class="classic-card-deck">${icon} ${deck}</div><h2>${MI.esc(p.title||'بطاقة')}</h2><p>${MI.esc(p.description||'')}</p>${Number(p.amount||0)!==0?`<div class="classic-card-effect ${Number(p.amount)>0?'gain':'loss'}">${Number(p.amount)>0?'+':''}${MI.fmt(p.amount)} د.ع</div>`:''}<button class="btn primary big" onclick="document.getElementById('modalRoot').innerHTML=''">متابعة اللعب</button></div>`);
  };

  MI.renderBoardState=()=>{
    oldRenderBoardState();
    MI.state.properties.forEach(p=>{
      if(!p.owner_user_id)return;
      const e=MI.$(`.space[data-index="${p.space_index}"]`);
      const b=e?.querySelector('.buildings');
      if(!b)return;
      b.innerHTML='';
      if(Number(p.buildings)===5)b.innerHTML='<span class="hotel-marker">🏨</span>';
      else for(let i=0;i<Number(p.buildings||0);i++)b.innerHTML+='<span class="house-marker">🏠</span>';
    });
  };

  MI.payJailFine=async()=>{const {error}=await MI.db.rpc('leave_jail',{p_match_id:MI.state.match.id,p_method:'fine'});if(error){MI.modal('تعذر الخروج من السجن',`<p>${MI.esc(MI.errorText(error))}</p>`);return;}await MI.refreshGame();};
  MI.useJailCard=async method=>{const {error}=await MI.db.rpc('leave_jail',{p_match_id:MI.state.match.id,p_method:method});if(error){MI.modal('تعذر استخدام البطاقة',`<p>${MI.esc(MI.errorText(error))}</p>`);return;}await MI.refreshGame();};
  MI.buildProperty=async space=>{const {data,error}=await MI.db.rpc('build_property',{p_match_id:MI.state.match.id,p_space:space});if(error){MI.modal('تعذر البناء',`<p>${MI.esc(MI.errorText(error))}</p>`);return;}MI.$('#modalRoot').innerHTML='';await MI.refreshGame();MI.$('#statusStrip').textContent=Number(data.buildings)===5?'تم بناء فندق 🏨':'تم بناء بيت 🏠';};
  MI.sellBuilding=async space=>{const {error}=await MI.db.rpc('sell_building',{p_match_id:MI.state.match.id,p_space:space});if(error){MI.modal('تعذر بيع البناء',`<p>${MI.esc(MI.errorText(error))}</p>`);return;}MI.$('#modalRoot').innerHTML='';await MI.refreshGame();};

  MI.openAssets=()=>{
    const owned=MI.state.properties.filter(p=>p.owner_user_id===MI.state.user.id);
    if(!owned.length){MI.modal('إدارة الأملاك','<p>ما عندك أملاك حالياً.</p>');return;}
    const rows=owned.map(p=>{const s=MI.BOARD[p.space_index],count=Number(p.buildings||0),building=count===5?'🏨 فندق':count?`🏠 ${count} بيت`:'بدون بناء',mv=Math.floor((s.price||0)/2),uc=Math.ceil((s.price||0)*.55);return `<div class="asset-item"><h4>${MI.esc(s.name)}</h4><p>${building} • ${p.mortgaged?'🔒 مرهون':'✅ غير مرهون'}</p><div class="asset-buttons">${s.group&&!p.mortgaged&&count<5?`<button class="mini-btn good" data-build="${p.space_index}">➕ بناء</button>`:''}${count>0?`<button class="mini-btn" data-sell-building="${p.space_index}">➖ بيع بناء</button>`:''}${p.mortgaged?`<button class="mini-btn good" data-unmortgage="${p.space_index}">فك الرهن ${MI.fmt(uc)}</button>`:`<button class="mini-btn" data-mortgage="${p.space_index}">رهن ${MI.fmt(mv)}</button>`}${MI.state.match?.phase==='recovery'?`<button class="mini-btn bad" data-sell="${p.space_index}">عرض بالمزاد</button>`:''}</div></div>`}).join('');
    MI.modal('🏦 إدارة الأملاك',`<div class="bank-stock">🏠 بيوت البنك: <b>${MI.state.match?.houses_available??32}</b> &nbsp; 🏨 فنادق البنك: <b>${MI.state.match?.hotels_available??12}</b></div><div class="asset-grid">${rows}</div>`);
    setTimeout(()=>{MI.$$('[data-build]').forEach(b=>b.onclick=()=>MI.buildProperty(Number(b.dataset.build)));MI.$$('[data-sell-building]').forEach(b=>b.onclick=()=>MI.sellBuilding(Number(b.dataset.sellBuilding)));MI.$$('[data-mortgage]').forEach(b=>b.onclick=()=>MI.mortgageProperty(Number(b.dataset.mortgage)));MI.$$('[data-unmortgage]').forEach(b=>b.onclick=()=>MI.unmortgageProperty(Number(b.dataset.unmortgage)));MI.$$('[data-sell]').forEach(b=>b.onclick=()=>MI.sellPropertyAuction(Number(b.dataset.sell)));},0);
  };

  MI.ensureClassicControls=()=>{
    const bar=MI.$('.action-bar'); if(!bar)return;
    if(!MI.$('#jailFineBtn')){const b=document.createElement('button');b.id='jailFineBtn';b.className='btn gold hidden';b.textContent='🔓 دفع 50 والخروج';b.onclick=MI.payJailFine;bar.appendChild(b);}
    if(!MI.$('#jailChanceBtn')){const b=document.createElement('button');b.id='jailChanceBtn';b.className='btn secondary hidden';b.textContent='❓ استخدام بطاقة خروج';b.onclick=()=>MI.useJailCard('chance');bar.appendChild(b);}
    if(!MI.$('#jailCommunityBtn')){const b=document.createElement('button');b.id='jailCommunityBtn';b.className='btn secondary hidden';b.textContent='🎁 استخدام بطاقة خروج';b.onclick=()=>MI.useJailCard('community');bar.appendChild(b);}
  };

  MI.renderControls=()=>{
    oldRenderControls(); MI.ensureClassicControls();
    const me=MI.myPlayer(),m=MI.state.match,mine=m?.status==='active'&&m.current_turn_user_id===MI.state.user.id&&!me?.bankrupt,jailed=mine&&m.phase==='roll'&&me?.in_jail;
    MI.$('#jailFineBtn')?.classList.toggle('hidden',!jailed);
    MI.$('#jailChanceBtn')?.classList.toggle('hidden',!jailed||Number(me?.jail_free_chance||0)<1);
    MI.$('#jailCommunityBtn')?.classList.toggle('hidden',!jailed||Number(me?.jail_free_community||0)<1);
    if(jailed)MI.$('#statusStrip').textContent=`⛓️ أنت في السجن: جرّب دبل، أو ادفع 50 د.ع، أو استخدم بطاقة الخروج. المحاولة ${Number(me.jail_turns||0)+1} من 3.`;
    const latest=(MI.state.actions||[]).find(a=>a.action_type==='card');
    if(latest&&latest.id!==lastCardShown){lastCardShown=latest.id;setTimeout(()=>MI.showClassicCard(latest),120);}
  };

  MI.renderLog=()=>{
    oldRenderLog();
    const html=(MI.state.actions||[]).slice(0,30).filter(a=>['card','build','sell_building','leave_jail'].includes(a.action_type)).map(a=>{const n=MI.profileById(a.user_id).display_name||'لاعب',p=a.payload||{},s=MI.BOARD[p.space]?.name||'';if(a.action_type==='card')return `<div class="log-entry">${p.deck==='chance'?'❓':'🎁'} <b>${MI.esc(n)}</b>: ${MI.esc(p.title||'بطاقة')}</div>`;if(a.action_type==='build')return `<div class="log-entry">🏠 <b>${MI.esc(n)}</b> بنى في ${MI.esc(s)}.</div>`;if(a.action_type==='sell_building')return `<div class="log-entry">🏚️ <b>${MI.esc(n)}</b> باع بناءً في ${MI.esc(s)}.</div>`;return `<div class="log-entry">🔓 <b>${MI.esc(n)}</b> خرج من السجن.</div>`;}).join('');
    MI.$('#gameLog').insertAdjacentHTML('afterbegin',html);
  };
})();