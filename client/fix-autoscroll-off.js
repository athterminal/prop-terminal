// fix-autoscroll-off.js — отключает автопрыжок к последним свечам
(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    if(!window.chart) return;
    const ts = chart.timeScale();
    try {
      ts.options().autoScroll = false;
    } catch(e){}
    try {
      ts.scrollToRealTime = ()=>{}; // блокируем автопрыжок
    } catch(e){}
    console.info('✅ fix-autoscroll-off active');
  });
})();
