window.MI=window.MI||{};
(()=>{
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  MI.fx=MI.fx||{ctx:null};
  MI.fx.ensure=()=>{try{if(!MI.fx.ctx&&AudioCtx)MI.fx.ctx=new AudioCtx();if(MI.fx.ctx?.state==='suspended')MI.fx.ctx.resume();}catch(e){}return MI.fx.ctx;};
  MI.fx.tone=(freq=220,dur=.05,gain=.045,type='sine',delay=0)=>{const c=MI.fx.ensure();if(!c)return;const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.01);};
  MI.fx.step=(n=0)=>{MI.fx.tone(145+(n%2)*22,.055,.035,'triangle');MI.fx.tone(72,.04,.018,'sine',.01);};
  MI.fx.diceTick=(n=0)=>{MI.fx.tone(260+(n%4)*55,.035,.028,'square');};
  MI.fx.diceLand=()=>{MI.fx.tone(115,.12,.07,'triangle');MI.fx.tone(68,.16,.045,'sine',.02);MI.fx.tone(360,.055,.02,'square',.035);};
  ['pointerdown','touchstart','keydown'].forEach(ev=>document.addEventListener(ev,()=>MI.fx.ensure(),{once:true,passive:true}));

  // Keep pieces beside the cards, toward the inner edge of the board, so names/prices stay readable.
  MI.rawPiecePos=pos=>{
    if(pos===0)return{x:13,y:87};
    if(pos<10)return{x:13,y:94-pos*8.8};
    if(pos===10)return{x:13,y:13};
    if(pos<20)return{x:6+(pos-10)*8.8,y:13};
    if(pos===20)return{x:87,y:13};
    if(pos<30)return{x:87,y:6+(pos-20)*8.8};
    if(pos===30)return{x:87,y:87};
    return{x:94-(pos-30)*8.8,y:87};
  };
  MI.tokenPosition=(pos,i)=>{
    const side=pos===0||pos===10||pos===20||pos===30?'corner':pos<10?'left':pos<20?'top':pos<30?'right':'bottom';
    const n=i%6,b=MI.rawPiecePos(pos),spread=[-2.4,-1.45,-.5,.5,1.45,2.4][n];
    if(side==='left'||side==='right')return{x:b.x+(n%2?1.1:-1.1),y:b.y+spread};
    if(side==='top'||side==='bottom')return{x:b.x+spread,y:b.y+(n%2?1.1:-1.1)};
    const cornerOffsets=[[-2,-2],[0,-2],[2,-2],[-2,1],[0,1],[2,1]][n];
    return{x:b.x+cornerOffsets[0],y:b.y+cornerOffsets[1]};
  };

  MI.pieceMarkup=(tokenId,icon)=>`<span class="piece-3d piece-${MI.esc(tokenId||'pawn')}"><span class="piece-top"></span><span class="piece-neck"></span><span class="piece-body"></span><span class="piece-base"></span><span class="piece-symbol">${icon||''}</span></span>`;
  MI.renderTokens=()=>{
    const layer=MI.$('#tokensLayer');if(!layer)return;layer.innerHTML='';
    MI.state.matchPlayers.forEach((p,i)=>{
      if(p.bankrupt)return;
      const t=MI.tokenInfo(p.token_id),pos=MI.tokenPosition(MI.state.displayPositions.get(p.user_id)??p.board_position,i),el=document.createElement('div');
      el.className='token token-piece '+(p.user_id===MI.state.user.id?'my-token ':'')+(p.in_jail?'jailed':'');
      el.style.setProperty('--pc',t.color);el.style.left=pos.x+'%';el.style.top=pos.y+'%';el.innerHTML=MI.pieceMarkup(p.token_id,t.icon);
      if(p.user_id===MI.state.user.id){const tag=document.createElement('span');tag.className='token-me-tag';tag.textContent='أنت';el.appendChild(tag);}
      layer.appendChild(el);
    });
  };

  MI.animateDice=async(d1,d2)=>{
    const a=MI.$('#die1'),b=MI.$('#die2');if(!a||!b)return;
    MI.fx.ensure();a.classList.add('rolling');b.classList.add('rolling');
    for(let i=0;i<8;i++){a.textContent=MI.diceFace(1+Math.floor(Math.random()*6));b.textContent=MI.diceFace(1+Math.floor(Math.random()*6));MI.fx.diceTick(i);await MI.sleep(62);}
    a.textContent=MI.diceFace(d1);b.textContent=MI.diceFace(d2);MI.fx.diceLand();await MI.sleep(190);a.classList.remove('rolling');b.classList.remove('rolling');
  };
  MI.animatePlayer=async(userId,from,to,steps)=>{
    let p=from;MI.state.displayPositions.set(userId,p);MI.renderTokens();
    for(let i=0;i<steps;i++){p=(p+1)%40;MI.state.displayPositions.set(userId,p);MI.renderTokens();MI.fx.step(i);const piece=MI.$('.token-piece.my-token')||MI.$('.token-piece');piece?.classList.add('piece-hop');setTimeout(()=>piece?.classList.remove('piece-hop'),150);await MI.sleep(265);}
    MI.state.displayPositions.set(userId,to);MI.renderTokens();
  };

  // In-room microphone: WebRTC audio, Supabase Realtime only carries signaling (not the audio stream).
  MI.voice=MI.voice||{channel:null,stream:null,peers:new Map(),enabled:false,muted:false,matchId:null};
  MI.voiceSend=async(to,kind,data={})=>{const v=MI.voice;if(!v.channel||!MI.state.user)return;try{await v.channel.send({type:'broadcast',event:'signal',payload:{from:MI.state.user.id,to,kind,data}});}catch(e){console.warn('voice signal',e);}};
  MI.voicePeer=id=>{
    if(!id||id===MI.state.user.id)return null;
    let pc=MI.voice.peers.get(id);if(pc)return pc;
    pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]});
    MI.voice.peers.set(id,pc);
    if(MI.voice.stream)MI.voice.stream.getTracks().forEach(tr=>{try{pc.addTrack(tr,MI.voice.stream);}catch(e){}});
    pc.onicecandidate=e=>{if(e.candidate)MI.voiceSend(id,'ice',e.candidate.toJSON?e.candidate.toJSON():e.candidate);};
    pc.ontrack=e=>{let audio=document.getElementById('voice-'+id);if(!audio){audio=document.createElement('audio');audio.id='voice-'+id;audio.autoplay=true;audio.playsInline=true;audio.className='voice-remote-audio';document.body.appendChild(audio);}audio.srcObject=e.streams[0];audio.play().catch(()=>{});};
    pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(pc.connectionState)){try{pc.close();}catch(e){}MI.voice.peers.delete(id);}};
    return pc;
  };
  MI.voiceOffer=async id=>{const pc=MI.voicePeer(id);if(!pc)return;try{const offer=await pc.createOffer();await pc.setLocalDescription(offer);await MI.voiceSend(id,'offer',offer);}catch(e){console.warn('voice offer',e);}};
  MI.voiceHandle=async msg=>{
    if(!msg||msg.to!==MI.state.user?.id||msg.from===MI.state.user?.id)return;
    const pc=MI.voicePeer(msg.from);if(!pc)return;
    try{
      if(msg.kind==='offer'){await pc.setRemoteDescription(new RTCSessionDescription(msg.data));const ans=await pc.createAnswer();await pc.setLocalDescription(ans);await MI.voiceSend(msg.from,'answer',ans);}
      else if(msg.kind==='answer'){if(pc.signalingState!=='stable')await pc.setRemoteDescription(new RTCSessionDescription(msg.data));}
      else if(msg.kind==='ice'){await pc.addIceCandidate(new RTCIceCandidate(msg.data));}
      else if(msg.kind==='ready'){if(MI.voice.enabled)await MI.voiceOffer(msg.from);}
    }catch(e){console.warn('voice handle',e);}
  };
  MI.setupVoice=async()=>{
    const id=MI.state.match?.id;if(!id||MI.voice.matchId===id)return;
    MI.cleanupVoice(false);MI.voice.matchId=id;
    const ch=MI.db.channel('voice-'+id,{config:{broadcast:{self:false}}});MI.voice.channel=ch;
    ch.on('broadcast',{event:'signal'},({payload})=>MI.voiceHandle(payload));
    ch.subscribe(async status=>{if(status==='SUBSCRIBED'&&MI.voice.enabled)await MI.voiceSend(null,'ready');});
  };
  MI.cleanupVoice=(stopStream=true)=>{
    MI.voice.peers.forEach(pc=>{try{pc.close();}catch(e){}});MI.voice.peers.clear();
    if(MI.voice.channel){try{MI.db.removeChannel(MI.voice.channel);}catch(e){}MI.voice.channel=null;}
    document.querySelectorAll('.voice-remote-audio').forEach(a=>a.remove());
    if(stopStream&&MI.voice.stream){MI.voice.stream.getTracks().forEach(t=>t.stop());MI.voice.stream=null;MI.voice.enabled=false;MI.voice.muted=false;}
    MI.voice.matchId=null;
  };
  MI.startVoice=async()=>{
    if(!navigator.mediaDevices?.getUserMedia){MI.modal('المايك غير مدعوم','<p>المتصفح الحالي لا يدعم تشغيل المايك داخل اللعبة.</p>');return;}
    try{
      if(!MI.voice.stream){MI.voice.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});MI.voice.enabled=true;MI.voice.muted=false;}
      else {MI.voice.enabled=true;MI.voice.muted=false;MI.voice.stream.getAudioTracks().forEach(t=>t.enabled=true);}
      await MI.setupVoice();
      for(const p of MI.state.matchPlayers||[]){if(p.user_id!==MI.state.user.id)await MI.voiceOffer(p.user_id);}
      MI.updateVoiceButton();
    }catch(e){MI.modal('تعذر تشغيل المايك','<p>اسمح للمتصفح باستخدام المايك، وبعدها اضغط الزر مرة ثانية.</p>');}
  };
  MI.toggleVoice=async()=>{
    MI.fx.ensure();
    if(!MI.voice.stream||!MI.voice.enabled){await MI.startVoice();return;}
    MI.voice.muted=!MI.voice.muted;MI.voice.stream.getAudioTracks().forEach(t=>t.enabled=!MI.voice.muted);MI.updateVoiceButton();
  };
  MI.updateVoiceButton=()=>{const b=MI.$('#voiceBtn');if(!b)return;if(!MI.voice.stream)b.textContent='🎙️ تشغيل المايك';else if(MI.voice.muted)b.textContent='🔇 المايك مكتوم';else b.textContent='🎙️ المايك شغال';b.classList.toggle('voice-live',!!MI.voice.stream&&!MI.voice.muted);};

  const oldEnsure=MI.ensureExtraUI;
  MI.ensureExtraUI=()=>{oldEnsure?.();const bar=MI.$('.action-bar');if(bar&&!MI.$('#voiceBtn')){const b=document.createElement('button');b.id='voiceBtn';b.className='btn secondary voice-btn';b.textContent='🎙️ تشغيل المايك';b.onclick=MI.toggleVoice;bar.appendChild(b);}MI.updateVoiceButton();};
  const oldEnter=MI.enterGame;
  MI.enterGame=async matchId=>{await oldEnter(matchId);await MI.setupVoice();};
  const oldTear=MI.teardownGameChannel;
  if(oldTear)MI.teardownGameChannel=()=>{MI.cleanupVoice(true);return oldTear();};
})();