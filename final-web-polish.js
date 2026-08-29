window.MI=window.MI||{};
(()=>{
  const state={lastTurn:null,toastTimer:null,ambientStarted:false};
  const esc=window.CSS?.escape?s=>CSS.escape(String(s)):s=>String(s).replace(/[^a-zA-Z0-9_-]/g,'_');

  function ensureToast(){
    let t=document.getElementById('miEventToast');
    if(!t){t=document.createElement('div');t.id='miEventToast';t.className='mi-event-toast';t.setAttribute('aria-live','polite');document.querySelector('.board-stage')?.appendChild(t);}
    return t;
  }
  MI.showEventToast=(text,ms=1700)=>{const t=ensureToast();if(!t)return;t.textContent=text;clearTimeout(state.toastTimer);requestAnimationFrame(()=>t.classList.add('show'));state.toastTimer=setTimeout(()=>t.classList.remove('show'),ms);};

  function pieceMarkup(tokenId){
    const id=tokenId||'pawn';
    return `<span class="piece-3d piece-${MI.esc(id)}"><span class="piece-top"></span><span class="piece-neck"></span><span class="piece-body"></span><span class="piece-base"></span></span>`;
  }

  // Reuse piece DOM nodes so movement is genuinely smooth instead of recreating them every step.
  MI.renderTokens=()=>{
    const layer=MI.$('#tokensLayer');if(!layer)return;
    const live=new Set();
    (MI.state.matchPlayers||[]).forEach((p,i)=>{
      if(p.bankrupt)return;
      live.add(p.user_id);
      const info=MI.tokenInfo(p.token_id),pos=MI.tokenPosition(MI.state.displayPositions.get(p.user_id)??p.board_position,i);
      let el=layer.querySelector(`[data-user-id="${esc(p.user_id)}"]`);
      if(!el){
        el=document.createElement('div');el.className='token token-piece';el.dataset.userId=p.user_id;el.innerHTML=pieceMarkup(p.token_id);layer.appendChild(el);
      }
      el.classList.toggle('my-token',p.user_id===MI.state.user.id);el.classList.toggle('jailed',!!p.in_jail);
      el.style.setProperty('--pc',info.color);el.style.left=pos.x+'%';el.style.top=pos.y+'%';
      const piece=el.querySelector('.piece-3d');
      if(piece&&!piece.classList.contains('piece-'+p.token_id)){piece.className='piece-3d piece-'+p.token_id;}
      let tag=el.querySelector('.token-me-tag');
      if(p.user_id===MI.state.user.id&&!tag){tag=document.createElement('span');tag.className='token-me-tag';tag.textContent='أنت';el.appendChild(tag);}else if(p.user_id!==MI.state.user.id&&tag)tag.remove();
    });
    [...layer.children].forEach(el=>{if(el.dataset.userId&&!live.has(el.dataset.userId))el.remove();});
  };

  const oldAnimate=MI.animatePlayer;
  MI.animatePlayer=async(userId,from,to,steps)=>{
    let p=Number(from)||0;const total=Math.max(0,Number(steps)||0);MI.state.displayPositions.set(userId,p);MI.renderTokens();
    const find=()=>MI.$(`#tokensLayer [data-user-id="${esc(userId)}"]`);
    const el=find();el?.classList.add('mi-moving');
    for(let i=0;i<total;i++){
      p=(p+1)%40;MI.state.displayPositions.set(userId,p);MI.renderTokens();MI.fx?.step?.(i);window.dispatchEvent(new CustomEvent('mi-token-step',{detail:{userId,position:p,step:i+1,total}}));
      const moving=find();moving?.classList.add('mi-moving');await MI.sleep(180);
    }
    MI.state.displayPositions.set(userId,Number(to));MI.renderTokens();find()?.classList.remove('mi-moving');
  };

  const oldDice=MI.animateDice;
  MI.animateDice=async(d1,d2)=>{
    const board=MI.$('#board');board?.classList.add('cinematic-focus');
    await oldDice?.(d1,d2);
    MI.showEventToast(`🎲 ${d1} + ${d2} = ${Number(d1)+Number(d2)}`,1200);
    setTimeout(()=>board?.classList.remove('cinematic-focus'),500);
  };

  function focusBoardForTurn(){
    const board=MI.$('#board');if(!board||!MI.state.match)return;
    const uid=MI.state.match.current_turn_user_id;if(state.lastTurn===uid)return;state.lastTurn=uid;
    const me=uid===MI.state.user?.id;
    MI.showEventToast(me?'🎯 دورك الآن':`دور ${MI.profileById?.(uid)?.display_name||'اللاعب'}`,1400);
    board.classList.add('cinematic-focus');setTimeout(()=>board.classList.remove('cinematic-focus'),900);
  }

  const oldRender=MI.renderGame;
  if(oldRender)MI.renderGame=()=>{oldRender();focusBoardForTurn();const stage=MI.$('.board-stage');if(stage&&!stage.querySelector('.mi-turn-ring')){const r=document.createElement('div');r.className='mi-turn-ring';stage.appendChild(r);} };

  // Small event reactions without changing game logic.
  window.addEventListener('mi-token-step',e=>{const d=e.detail||{};if(d.step===d.total)MI.showEventToast('📍 وصلت إلى الخانة',850);});

  // Lightweight ambient sound; starts only after user interaction and does not stream external audio.
  function startAmbient(){if(state.ambientStarted)return;state.ambientStarted=true;const c=MI.fx?.ensure?.();if(!c)return;try{const g=c.createGain();g.gain.value=.006;g.connect(c.destination);const o1=c.createOscillator(),o2=c.createOscillator();o1.type='sine';o2.type='triangle';o1.frequency.value=55;o2.frequency.value=82.4;o1.connect(g);o2.connect(g);o1.start();o2.start();}catch(e){}}
  document.addEventListener('pointerdown',startAmbient,{once:true,passive:true});

  // Add a compact visual quality badge for the prototype and a fullscreen-like board focus toggle.
  function ensureFocusButton(){
    const bar=MI.$('.action-bar');if(!bar||MI.$('#focusBoardBtn'))return;
    const b=document.createElement('button');b.id='focusBoardBtn';b.className='btn secondary';b.textContent='🎥 تركيز الرقعة';
    b.addEventListener('click',()=>{const gs=MI.$('#gameScreen');const on=gs?.classList.toggle('board-focus-mode');b.textContent=on?'↩️ إظهار الواجهة':'🎥 تركيز الرقعة';});bar.appendChild(b);
  }
  const oldEnsure=MI.ensureExtraUI;
  MI.ensureExtraUI=()=>{oldEnsure?.();ensureFocusButton();};

  const style=document.createElement('style');style.textContent=`
    .board-focus-mode .players-panel,.board-focus-mode .info-panel{opacity:.08;pointer-events:none;transition:opacity .25s ease}.board-focus-mode .board{width:min(88vh,900px)!important}.board-focus-mode .board-perspective{perspective-origin:50% 32%!important}.board-focus-mode .board-stage{grid-column:1/-1}.board-focus-mode .game-layout{grid-template-columns:1fr!important}.board-focus-mode .board-stage{margin-inline:auto;width:min(100%,1000px)}
    @media(max-width:760px){.board-focus-mode .players-panel{display:none!important}.board-focus-mode .board{width:min(99vw,680px)!important}}
  `;document.head.appendChild(style);
})();
