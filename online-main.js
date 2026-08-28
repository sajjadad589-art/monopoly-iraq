window.MI=window.MI||{};
const _miEndTurn=MI.endTurn;
MI.endTurn=async()=>{
  if(!MI.state.match)return;
  let res=await MI.db.rpc('end_turn',{p_match_id:MI.state.match.id});
  if(res.error&&String(res.error.message||'').includes('ROLL_FIRST')){
    const timeout=await MI.db.rpc('enforce_match_timeout',{p_match_id:MI.state.match.id});
    if(!timeout.error&&timeout.data?.changed){
      await MI.loadGame(MI.state.match.id);
      res=await MI.db.rpc('end_turn',{p_match_id:MI.state.match.id});
    }
  }
  if(res.error){
    const msg=String(res.error.message||'');
    const ar=msg.includes('ROLL_FIRST')?'لازم ترمي النرد أولاً، أو تنتظر انتهاء مؤقت الـ30 ثانية.':msg.includes('RECOVER_FIRST')?'عندك عجز بالرصيد. لازم ترهن أو تبيع عقار قبل إنهاء الدور.':MI.errorText(res.error);
    MI.modal('تعذر تنفيذ الأمر',`<p>${MI.esc(ar)}</p>`);
    return;
  }
  await MI.loadGame(MI.state.match.id);
};
(async()=>{try{MI.buildBoard();MI.wireRoomUI();MI.wireGameUI();await MI.initAuth();}catch(e){console.error(e);MI.msg('#authMessage','تعذر تشغيل اللعبة: '+(e?.message||e),'bad');MI.showScreen('authScreen');}})();