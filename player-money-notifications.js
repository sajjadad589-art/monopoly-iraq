window.MI=window.MI||{};
(()=>{
  const ensureToastRoot=()=>{
    let root=document.getElementById('personalNoticeRoot');
    if(root)return root;
    root=document.createElement('div');
    root.id='personalNoticeRoot';
    root.style.cssText='position:fixed;top:82px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;gap:10px;align-items:center;pointer-events:none;width:min(92vw,520px)';
    document.body.appendChild(root);
    return root;
  };

  MI.personalNotice=(text,type='info')=>{
    const root=ensureToastRoot();
    const el=document.createElement('div');
    const bg=type==='gain'?'rgba(21,110,63,.96)':type==='pay'?'rgba(143,47,47,.97)':'rgba(15,43,67,.96)';
    el.style.cssText=`width:100%;box-sizing:border-box;background:${bg};color:#fff;border:1px solid rgba(255,255,255,.22);border-radius:16px;padding:14px 18px;text-align:center;font-weight:800;font-size:16px;box-shadow:0 12px 30px rgba(0,0,0,.35);backdrop-filter:blur(8px);opacity:0;transform:translateY(-10px);transition:.22s ease`;
    el.textContent=text;
    root.appendChild(el);
    requestAnimationFrame(()=>{el.style.opacity='1';el.style.transform='translateY(0)';});
    setTimeout(()=>{el.style.opacity='0';el.style.transform='translateY(-8px)';setTimeout(()=>el.remove(),240);},2800);
  };

  const baseRoll=MI.rollDice;
  if(typeof baseRoll==='function'){
    MI.rollDice=async()=>{
      if(!MI.state.match)return;
      MI.$('#rollBtn').disabled=true;
      const {data,error}=await MI.db.rpc('roll_dice',{p_match_id:MI.state.match.id});
      MI.$('#rollBtn').disabled=false;
      if(error){MI.modal('تعذر الرمي',`<p>${MI.esc(MI.errorText(error))}</p>`);return;}

      const landedProp=MI.propertyAt(Number(data.to));
      const rentOwnerId=Number(data.rent||0)>0?landedProp?.owner_user_id:null;
      const rentOwnerName=rentOwnerId?MI.profileById(rentOwnerId).display_name:'اللاعب الآخر';

      MI.state.localRollAnimating=true;
      await MI.animateDice(data.d1,data.d2);
      await MI.animatePlayer(MI.state.user.id,Number(data.from),Number(data.to),Number(data.steps||data.d1+data.d2));
      MI.state.localRollAnimating=false;
      await MI.loadGame(MI.state.match.id);

      // هذه الرسائل خاصة باللاعب الذي قام بالرمي فقط.
      if(data.passed_go===true){
        MI.personalNotice('🎁 حصلت على 200 د.ع هدية لعبور نقطة البداية','gain');
      }
      if(Number(data.rent||0)>0){
        MI.personalNotice(`💸 أعطيت ${MI.fmt(data.rent)} د.ع إلى ${rentOwnerName}`,'pay');
      }
    };
  }

  const baseRespondSale=MI.respondSaleOffer;
  if(typeof baseRespondSale==='function'){
    MI.respondSaleOffer=async(id,accept)=>{
      let offer=null;
      if(accept){
        const offers=await MI.loadSaleOffers();
        offer=(offers||[]).find(o=>String(o.id)===String(id))||null;
      }
      const {data,error}=await MI.db.rpc('respond_property_sale_offer',{p_offer_id:id,p_accept:accept});
      if(error){MI.modal('تعذر تنفيذ الصفقة',`<p>${MI.esc(MI.errorText(error))}</p>`);return;}
      MI.$('#modalRoot').innerHTML='';
      await MI.refreshGame();
      if(accept&&data?.accepted&&offer){
        const seller=MI.profileById(offer.seller_user_id).display_name||'اللاعب الآخر';
        MI.personalNotice(`💸 أعطيت ${MI.fmt(offer.price)} د.ع إلى ${seller}`,'pay');
      }
      MI.openAssets();
    };
  }
})();
