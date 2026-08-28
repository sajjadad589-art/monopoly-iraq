(async()=>{
  try{
    const files=['00','01','02','03','04','05'].map(n=>`parts/game.part.${n}.txt`);
    const chunks=[];
    for(const file of files){
      const response=await fetch(file,{cache:'no-store'});
      if(!response.ok) throw new Error(`تعذر تحميل ${file}`);
      chunks.push(await response.text());
    }
    const source=chunks.join('');
    new Function(source)();
  }catch(error){
    console.error(error);
    document.body.innerHTML=`<div style="padding:30px;color:white;background:#07131f;font-family:Arial;min-height:100vh;direction:rtl"><h2>تعذر تشغيل اللعبة</h2><p>${error.message}</p><p>شغّل المشروع من خادم ويب أو GitHub Pages.</p></div>`;
  }
})();
