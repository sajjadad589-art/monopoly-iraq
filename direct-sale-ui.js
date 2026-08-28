window.MI=window.MI||{};
(()=>{
  const oldRenderControls=MI.renderControls;

  MI.loadSaleOffers=async()=>{
    if(!MI.state.match)return [];
    const {data}=await MI.db.from('property_sale_offers').select('*').eq('match_id',MI.state.match.id).eq('status','pending').order('created_at',{ascending:false});
    return data||[];
  };

  MI.sendSaleOffer=async(space)=>{
    const buyers=MI.state.matchPlayers.filter(p=>!p.bankrupt&&p.user_id!==MI.state.user.id);
    if(!buyers.length){MI.modal('بيع العقار','<p>ماكو لاعب ثاني متاح للشراء.</p>');return;}
    const s=MI.BOARD[space];
    const buyerOpts=buyers.map(p=>`<option value="${p.user_id}">${MI.esc(MI.profileById(p.user_id).display_name)}</option>`).join('');
    MI.modal(`💰 بيع ${MI.esc(s.name)}`,`<div class="asset-item"><p>اختر اللاعب وحدد السعر اللي تريده. تنتقل الملكية فقط إذا وافق المشتري.</p><select id="saleBuyer" class="big-input">${buyerOpts}</select><input id="salePrice" class="big-input" type="number" min="1" step="1" value="${s.price||100}" placeholder="سعر البيع"><button id="sendSaleOfferBtn" class="btn primary big">إرسال عرض البيع</button></div>`);
    setTimeout(()=>{const b=MI.$('#sendSaleOfferBtn');if(b)b.onclick=async()=>{const buyer=MI.$('#saleBuyer')?.value,price=Number(MI.$('#salePrice')?.value||0);if(!buyer||price<=0)return;const {error}=await MI.db.rpc('create_property_sale_offer',{p_match_id:MI.state.match.id,p_space:space,p_buyer:buyer,p_price:price});if(error){MI.modal('تعذر إرسال العرض',`<p>${MI.esc(MI.errorText(error))}</p>`);return;}MI.$('#modalRoot').innerHTML='';MI.$('#statusStrip').textContent='تم إرسال عرض البيع للاعب المختار.';};},0);
  };

  MI.respondSaleOffer=async(id,accept)=>{
    const {error}=await MI.db.rpc('respond_property_sale_offer',{p_offer_id:id,p_accept:accept});
    if(error){MI.modal('تعذر تنفيذ الصفقة',`<p>${MI.esc(MI.errorText(error))}</p>`);return;}
    MI.$('#modalRoot').innerHTML='';
    await MI.refreshGame();
    MI.openAssets();
  };

  MI.cancelSaleOffer=async id=>{
    const {error}=await MI.db.rpc('cancel_property_sale_offer',{p_offer_id:id});
    if(error){MI.modal('تعذر إلغاء العرض',`<p>${MI.esc(MI.errorText(error))}</p>`);return;}
    MI.$('#modalRoot').innerHTML='';
    MI.openAssets();
  };

  MI.openAssets=async()=>{
    const me=MI.myPlayer();
    const myTurn=MI.state.match?.status==='active'&&MI.state.match.current_turn_user_id===MI.state.user.id&&!me?.bankrupt;
    const owned=MI.state.properties.filter(p=>p.owner_user_id===MI.state.user.id);
    const offers=await MI.loadSaleOffers();
    const incoming=offers.filter(o=>o.buyer_user_id===MI.state.user.id);
    const outgoing=offers.filter(o=>o.seller_user_id===MI.state.user.id);

    const incomingHtml=incoming.length?`<div class="sale-section"><h3>📥 عروض شراء بانتظارك</h3>${incoming.map(o=>{const s=MI.BOARD[o.space_index],seller=MI.profileById(o.seller_user_id).display_name,prop=MI.propertyAt(o.space_index),extra=prop?.mortgaged?`<div class="muted">العقار مرهون، ورسوم البنك الإضافية تُحسب عند القبول.</div>`:'';return `<div class="sale-offer-card"><b>${MI.esc(s?.name||'عقار')}</b><div>من: ${MI.esc(seller)}</div><div class="sale-price">${MI.fmt(o.price)} د.ع</div>${extra}<div class="asset-buttons"><button class="mini-btn good" data-accept-sale="${o.id}">✅ قبول</button><button class="mini-btn bad" data-reject-sale="${o.id}">❌ رفض</button></div></div>`}).join('')}</div>`:'';

    const outgoingHtml=outgoing.length?`<div class="sale-section"><h3>📤 عروضك المرسلة</h3>${outgoing.map(o=>{const s=MI.BOARD[o.space_index],buyer=MI.profileById(o.buyer_user_id).display_name;return `<div class="sale-offer-card"><b>${MI.esc(s?.name||'عقار')}</b><div>إلى: ${MI.esc(buyer)}</div><div class="sale-price">${MI.fmt(o.price)} د.ع</div><button class="mini-btn bad" data-cancel-sale="${o.id}">إلغاء العرض</button></div>`}).join('')}</div>`:'';

    const rows=owned.map(p=>{const s=MI.BOARD[p.space_index],count=Number(p.buildings||0),building=count===5?'🏨 فندق':count?`🏠 ${count} بيت`:'بدون بناء',mv=Math.floor((s.price||0)/2),uc=Math.ceil((s.price||0)*.55);return `<div class="asset-item"><h4>${MI.esc(s.name)}</h4><p>${building} • ${p.mortgaged?'🔒 مرهون':'✅ غير مرهون'}</p><div class="asset-buttons">${myTurn&&s.group&&!p.mortgaged&&count<5?`<button class="mini-btn good" data-build="${p.space_index}">➕ بناء</button>`:''}${myTurn&&count>0?`<button class="mini-btn" data-sell-building="${p.space_index}">➖ بيع بناء</button>`:''}${myTurn?(p.mortgaged?`<button class="mini-btn good" data-unmortgage="${p.space_index}">فك الرهن ${MI.fmt(uc)}</button>`:`<button class="mini-btn" data-mortgage="${p.space_index}">رهن ${MI.fmt(mv)}</button>`):''}${count===0?`<button class="mini-btn sale" data-direct-sale="${p.space_index}">💰 بيع للاعب</button>`:''}${myTurn&&MI.state.match?.phase==='recovery'?`<button class="mini-btn bad" data-sell="${p.space_index}">عرض بالمزاد</button>`:''}</div></div>`}).join('');

    const body=`${incomingHtml}${outgoingHtml}<div class="bank-stock">🏠 بيوت البنك: <b>${MI.state.match?.houses_available??32}</b> &nbsp; 🏨 فنادق البنك: <b>${MI.state.match?.hotels_available??12}</b></div>${owned.length?`<div class="asset-grid">${rows}</div>`:'<p>ما عندك أملاك حالياً.</p>'}`;
    MI.modal('🏦 إدارة الأملاك',body);
    setTimeout(()=>{
      MI.$$('[data-build]').forEach(b=>b.onclick=()=>MI.buildProperty(Number(b.dataset.build)));
      MI.$$('[data-sell-building]').forEach(b=>b.onclick=()=>MI.sellBuilding(Number(b.dataset.sellBuilding)));
      MI.$$('[data-mortgage]').forEach(b=>b.onclick=()=>MI.mortgageProperty(Number(b.dataset.mortgage)));
      MI.$$('[data-unmortgage]').forEach(b=>b.onclick=()=>MI.unmortgageProperty(Number(b.dataset.unmortgage)));
      MI.$$('[data-sell]').forEach(b=>b.onclick=()=>MI.sellPropertyAuction(Number(b.dataset.sell)));
      MI.$$('[data-direct-sale]').forEach(b=>b.onclick=()=>MI.sendSaleOffer(Number(b.dataset.directSale)));
      MI.$$('[data-accept-sale]').forEach(b=>b.onclick=()=>MI.respondSaleOffer(b.dataset.acceptSale,true));
      MI.$$('[data-reject-sale]').forEach(b=>b.onclick=()=>MI.respondSaleOffer(b.dataset.rejectSale,false));
      MI.$$('[data-cancel-sale]').forEach(b=>b.onclick=()=>MI.cancelSaleOffer(b.dataset.cancelSale));
    },0);
  };

  MI.renderControls=()=>{
    oldRenderControls();
    const me=MI.myPlayer(),active=MI.state.match?.status==='active'&&!me?.bankrupt;
    if(MI.$('#assetsBtn'))MI.$('#assetsBtn').classList.toggle('hidden',!active||MI.state.match?.phase==='auction');
  };
})();