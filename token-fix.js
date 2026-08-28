window.MI=window.MI||{};
(()=>{
  const style=document.createElement('style');
  style.textContent=`
    .tokens-layer{position:absolute!important;inset:0!important;z-index:220!important;pointer-events:none!important;overflow:visible!important;transform:translateZ(90px)!important;transform-style:preserve-3d!important}
    .token{position:absolute!important;width:38px!important;height:38px!important;min-width:38px!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;background:linear-gradient(145deg,#ffffff,#dce4ec)!important;border:3px solid var(--pc,#38c86b)!important;box-shadow:0 8px 12px #0009,0 0 0 3px #fff,0 0 18px var(--pc,#38c86b)!important;transform:translate(-50%,-50%) translateZ(95px)!important;z-index:230!important;overflow:visible!important;color:#111!important;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",Arial,sans-serif!important}
    .token::before,.token::after{display:none!important;content:none!important}
    .token-piece{display:block!important;font-size:24px!important;line-height:1!important;filter:drop-shadow(0 2px 2px #0006)!important;transform:translateY(-1px)!important;white-space:nowrap!important}
    .token.my-token{width:42px!important;height:42px!important;min-width:42px!important;border-width:4px!important;box-shadow:0 9px 15px #000b,0 0 0 4px #fff,0 0 26px var(--pc,#38c86b)!important;z-index:240!important}
    .token.my-token .token-piece{font-size:27px!important}
    .token-name{position:absolute;top:38px;left:50%;transform:translateX(-50%);background:#06111be8;color:#fff;border:1px solid var(--pc,#38c86b);border-radius:999px;padding:2px 6px;font-size:8px;font-weight:900;white-space:nowrap;box-shadow:0 3px 8px #0008}
    @media(max-width:760px){.token{width:32px!important;height:32px!important;min-width:32px!important}.token-piece{font-size:21px!important}.token.my-token{width:36px!important;height:36px!important;min-width:36px!important}.token.my-token .token-piece{font-size:24px!important}.token-name{top:32px;font-size:7px;padding:1px 5px}}
  `;
  document.head.appendChild(style);

  MI.renderTokens=()=>{
    const layer=MI.$('#tokensLayer');
    if(!layer)return;
    layer.innerHTML='';
    MI.state.matchPlayers.forEach((p,i)=>{
      if(p.bankrupt)return;
      const t=MI.tokenInfo(p.token_id);
      const pos=MI.tokenPosition(MI.state.displayPositions.get(p.user_id)??p.board_position,i);
      const el=document.createElement('div');
      const me=p.user_id===MI.state.user.id;
      el.className='token '+(me?'my-token ':'')+(p.in_jail?'jailed':'');
      el.style.setProperty('--pc',t.color);
      el.style.left=pos.x+'%';
      el.style.top=pos.y+'%';
      const piece=document.createElement('span');
      piece.className='token-piece';
      piece.textContent=t.icon||'♟️';
      el.appendChild(piece);
      if(me){
        const name=document.createElement('span');
        name.className='token-name';
        name.textContent='أنت';
        el.appendChild(name);
      }
      layer.appendChild(el);
    });
  };
})();
