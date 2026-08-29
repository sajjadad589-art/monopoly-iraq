window.MI=window.MI||{};
(()=>{
  MI.animatePlayer=async(userId,from,to,steps)=>{
    let p=Number(from)||0;
    const total=Math.max(0,Number(steps)||0);
    MI.state.displayPositions.set(userId,p);
    MI.renderTokens?.();
    for(let i=0;i<total;i++){
      p=(p+1)%40;
      MI.state.displayPositions.set(userId,p);
      MI.renderTokens?.();
      window.dispatchEvent(new CustomEvent('mi-token-step',{detail:{userId,position:p,step:i+1,total}}));
      await MI.sleep?.(165);
    }
    MI.state.displayPositions.set(userId,Number(to));
    MI.renderTokens?.();
  };
})();
