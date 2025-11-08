/* eslint-env browser */
// fix-autoscroll-final.js — отключает auto-scroll при поступлении новых данных
(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    if (!window.chart || !window.candleSeries) {
      console.warn('fix-autoscroll-final: chart or candleSeries missing');
      return;
    }

    const ts = chart.timeScale();

    // 1. навсегда блокируем scrollToRealTime
    if (typeof ts.scrollToRealTime === 'function') {
      const origScroll = ts.scrollToRealTime;
      ts.scrollToRealTime = function(){};
      console.info('fix-autoscroll-final: scrollToRealTime disabled');
    }

    // 2. флаг "пользователь двигает график"
    let userScrolled = false;
    ts.subscribeVisibleTimeRangeChange(() => {
      const range = ts.getVisibleLogicalRange?.();
      const lastBar = ts.getVisibleLogicalRange?.()?.to;
      const totalBars = (chart?.serieses?.()[0]?.data?.()?.length) || 0;
      if (range && lastBar && totalBars) {
        // если пользователь ушёл левее конца графика — фиксируем флаг
        if (lastBar < totalBars - 1) userScrolled = true;
        else userScrolled = false;
      }
    });

    // 3. патч candleSeries.update — не скроллить, если пользователь не у конца
    const origUpdate = candleSeries.update;
    candleSeries.update = function(bar){
      try {
        const range = ts.getVisibleLogicalRange?.();
        const isAtEnd = !range || (range.to >= candleSeries.data().length - 1);
        origUpdate.call(candleSeries, bar);
        if (!isAtEnd || userScrolled) {
          // не трогаем scroll
          return;
        }
        // вручную чуть подстраиваем без дергания
        const logicalRange = ts.getVisibleLogicalRange?.();
        if (logicalRange) {
          ts.setVisibleLogicalRange({
            from: logicalRange.from,
            to: logicalRange.to + 0.1,
          });
        }
      } catch(e){
        origUpdate.call(candleSeries, bar);
      }
    };

    console.info('✅ fix-autoscroll-final active — auto-scroll полностью отключён.');
  });
})();
