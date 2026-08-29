window.MI=window.MI||{};
(()=>{
  const style=document.createElement('style');
  style.textContent=`
    /* Keep every square readable: tokens use a dedicated inner lane instead of covering names/prices. */
    .space{background:linear-gradient(145deg,#f8f1df,#dfd2b4)!important;color:#15120d!important;border-color:#6f5a37!important;box-shadow:inset 0 2px 0 #fff9,inset 0 -4px 8px #0002!important}
    .space .inner{position:relative;z-index:4;padding:5px 3px!important}
    .space .name{font-weight:1000!important;color:#17130d!important;text-shadow:0 1px #fff8!important}
    .space .price{font-weight:1000!important;color:#31230f!important;background:#fff8;border-radius:6px;padding:1px 3px;display:inline-block;margin-top:2px}
    .space .bar{z-index:5!important;box-shadow:inset 0 -2px 0 #0003,0 2px 4px #0002!important}
    .space.current-space{outline:3px solid #ffd75b!important;outline-offset:-3px;filter:brightness(1.06)}
    .owner-badge{bottom:auto!important;top:2px!important;left:3px!important;right:auto!important;max-width:66%!important;font-size:6px!important;opacity:.92}
    .buildings{z-index:8!important;pointer-events:none}

    /* Classic metallic token lane */
    .tokens-layer{position:absolute!important;inset:0!important;z-index:220!important;pointer-events:none!important;overflow:visible!important;transform:translateZ(92px)!important;transform-style:preserve-3d!important;direction:ltr!important}
    .token{position:absolute!important;width:34px!important;height:40px!important;min-width:34px!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;transform:translate(-50%,-66%) translateZ(94px)!important;transform-origin:50% 82%!important;transition:left .145s cubic-bezier(.22,.78,.25,1),top .145s cubic-bezier(.22,.78,.25,1),filter .18s!important;will-change:left,top,transform!important;z-index:230!important;overflow:visible!important}
    .token::before,.token::after{display:none!important;content:none!important}
    .piece-3d{position:absolute;left:50%;bottom:2px;width:30px;height:36px;transform:translateX(-50%) rotateX(-8deg);transform-style:preserve-3d;filter:drop-shadow(0 7px 3px #0008)}
    .piece-3d i{position:absolute;display:block;background:linear-gradient(90deg,#15191d 0%,#626b73 20%,#e9eef1 48%,#8c969d 68%,#22282d 100%);border:1px solid #171b1f;box-shadow:inset 1px 1px 2px #fff8,inset -2px -2px 3px #0006}
    .piece-base{left:3px;bottom:0;width:24px;height:7px;border-radius:50% 50% 42% 42%;transform:translateZ(4px)}
    .piece-body{left:8px;bottom:5px;width:14px;height:19px;border-radius:45% 45% 22% 22%;clip-path:polygon(31% 0,69% 0,100% 100%,0 100%);transform:translateZ(5px)}
    .piece-top{left:10px;bottom:22px;width:10px;height:10px;border-radius:50%;transform:translateZ(7px)}
    .piece-detail{display:none!important}

    .piece-car .piece-base{left:2px;bottom:3px;width:27px;height:8px;border-radius:35%}
    .piece-car .piece-body{left:3px;bottom:9px;width:25px;height:11px;border-radius:5px;clip-path:polygon(5% 50%,24% 10%,72% 10%,94% 45%,100% 100%,0 100%)}
    .piece-car .piece-top{left:8px;bottom:17px;width:14px;height:7px;border-radius:4px}
    .piece-car .piece-detail{display:block!important;left:5px;bottom:2px;width:6px;height:6px;border-radius:50%;box-shadow:15px 0 0 #30363b}

    .piece-hat .piece-base{left:1px;bottom:2px;width:28px;height:6px;border-radius:50%}
    .piece-hat .piece-body{left:7px;bottom:7px;width:16px;height:22px;border-radius:4px 4px 2px 2px;clip-path:none}
    .piece-hat .piece-top{left:5px;bottom:27px;width:20px;height:4px;border-radius:50%}

    .piece-ship .piece-base{left:1px;bottom:2px;width:28px;height:9px;border-radius:4px;clip-path:polygon(0 0,100% 0,82% 100%,18% 100%)}
    .piece-ship .piece-body{left:14px;bottom:10px;width:3px;height:23px;border-radius:2px;clip-path:none}
    .piece-ship .piece-top{left:7px;bottom:15px;width:12px;height:15px;border-radius:1px;clip-path:polygon(100% 0,100% 100%,0 65%);background:linear-gradient(135deg,#d8dde0,#697279)!important}

    .piece-plane .piece-base{left:11px;bottom:1px;width:8px;height:7px}
    .piece-plane .piece-body{left:2px;bottom:9px;width:26px;height:20px;border-radius:2px;clip-path:polygon(44% 0,57% 0,64% 35%,100% 49%,100% 61%,63% 57%,57% 100%,43% 100%,37% 57%,0 61%,0 49%,36% 35%)}
    .piece-plane .piece-top{display:none!important}

    .piece-horse .piece-base{left:4px;bottom:1px;width:22px;height:7px}
    .piece-horse .piece-body{left:8px;bottom:7px;width:13px;height:22px;clip-path:polygon(20% 0,100% 14%,72% 37%,90% 100%,20% 100%,35% 48%,0 30%);border-radius:45% 55% 18% 18%}
    .piece-horse .piece-top{left:5px;bottom:25px;width:11px;height:8px;border-radius:60% 40% 55% 45%;transform:rotate(-24deg) translateZ(7px)}

    .piece-pawn .piece-body{left:7px;width:16px;height:18px}
    .piece-pawn .piece-top{left:9px;width:12px;height:12px}

    .token.my-token .piece-3d{filter:drop-shadow(0 0 4px #fff) drop-shadow(0 0 9px var(--pc,#39c86b)) drop-shadow(0 7px 3px #0009)}
    .token.jailed .piece-3d{filter:grayscale(.45) drop-shadow(0 7px 3px #0009)}
    .token-name{position:absolute;left:50%;bottom:39px;transform:translateX(-50%);background:#07131fee;color:#fff;border:1px solid var(--pc,#39c86b);border-radius:999px;padding:2px 6px;font-size:8px;font-weight:1000;white-space:nowrap;box-shadow:0 3px 8px #0008}
    .token.step-hop{animation:tokenStepHop .145s ease-out}
    @keyframes tokenStepHop{0%{transform:translate(-50%,-66%) translateZ(94px) scale(1)}48%{transform:translate(-50%,-78%) translateZ(110px) scale(1.06)}100%{transform:translate(-50%,-66%) translateZ(94px) scale(1)}}

    @media(max-width:760px){
      .space .inner{padding:3px 2px!important}.space .name{font-size:clamp(8px,2.45vw,12px)!important}.space .price{font-size:clamp(7px,1.85vw,10px)!important;padding:1px 2px}
      .token{width:27px!important;height:33px!important;min-width:27px!important}.piece-3d{transform:translateX(-50%) rotateX(-8deg) scale(.8);transform-origin:50% 100%}.token-name{bottom:31px;font-size:7px;padding:1px 5px}
    }
    @media(prefers-reduced-motion:reduce){.token{transition:none!important}.token.step-hop{animation:none!important}}
  `;
  document.head.appendChild(style);

  // Dedicated inner-edge lane. The property name and price stay unobstructed.
  MI.tokenPosition=(pos,i=0)=>{
    const tangential=[-2.0,-1.2,-.4,.4,1.2,2.0][i%6];
    const radial=[-.35,.25,-.1,.35,-.25,.1][i%6];
    if(pos===0)return{x:10.2+tangential,y:89.8+radial};
    if(pos<10)return{x:10.5+radial,y:94-pos*8.8+tangential};
    if(pos===10)return{x:10.2+tangential,y:10.2+radial};
    if(pos<20)return{x:6+(pos-10)*8.8+tangential,y:10.5+radial};
    if(pos===20)return{x:89.8+tangential,y:10.2+radial};
    if(pos<30)return{x:89.5+radial,y:6+(pos-20)*8.8+tangential};
    if(pos===30)return{x:89.8+tangential,y:89.8+radial};
    return{x:94-(pos-30)*8.8+tangential,y:89.5+radial};
  };

  const pieceMarkup=type=>`<span class="piece-3d piece-${type}"><i class="piece-base"></i><i class="piece-body"></i><i class="piece-top"></i><i class="piece-detail"></i></span>`;

  MI.renderTokens=()=>{
    const layer=MI.$('#tokensLayer');
    if(!layer)return;
    const active=new Set();
    MI.state.matchPlayers.forEach((p,i)=>{
      if(p.bankrupt)return;
      const id=String(p.user_id),type=MI.TOKENS[p.token_id]?p.token_id:'pawn',t=MI.tokenInfo(type),me=p.user_id===MI.state.user.id;
      active.add(id);
      let el=layer.querySelector(`.token[data-user-id="${CSS.escape(id)}"]`);
      if(!el){
        el=document.createElement('div');
        el.dataset.userId=id;
        el.innerHTML=pieceMarkup(type)+(me?'<span class="token-name">أنت</span>':'');
        layer.appendChild(el);
        requestAnimationFrame(()=>el.classList.add('step-hop'));
      }
      el.className='token '+(me?'my-token ':'')+(p.in_jail?'jailed ':'');
      el.style.setProperty('--pc',t.color);
      const currentType=el.querySelector('.piece-3d');
      if(currentType&&!currentType.classList.contains('piece-'+type))currentType.className='piece-3d piece-'+type;
      const pos=MI.tokenPosition(MI.state.displayPositions.get(p.user_id)??p.board_position,i);
      el.style.left=pos.x+'%';
      el.style.top=pos.y+'%';
    });
    layer.querySelectorAll('.token[data-user-id]').forEach(el=>{if(!active.has(el.dataset.userId))el.remove();});
  };

  window.addEventListener('mi-token-step',e=>{
    const id=String(e.detail?.userId||'');
    const el=document.querySelector(`#tokensLayer .token[data-user-id="${CSS.escape(id)}"]`);
    if(!el)return;
    el.classList.remove('step-hop'); void el.offsetWidth; el.classList.add('step-hop');
  });
})();
