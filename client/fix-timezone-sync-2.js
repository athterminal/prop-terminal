// fix-timezone-sync-2.js — сохраняет смещение при смене таймфрейма
(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    if (!window.chart) return;

    function formatWithTZ(ts){
      const d = new Date((ts + (window.timezoneOffsetMinutes||0)*60)*1000);
      const dd = String(d.getUTCDate()).padStart(2,'0');
      const mm = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'][d.getUTCMonth()];
      const yyyy = d.getUTCFullYear();
      const hh = String(d.getUTCHours()).padStart(2,'0');
      const mn = String(d.getUTCMinutes()).padStart(2,'0');
      return `${dd} ${mm} ${yyyy} ${hh}:${mn}`;
    }

    function reapplyTZFormatter(){
      if(!window.chart) return;
      chart.applyOptions({
        localization:{ timeFormatter:t=>formatWithTZ(t) }
      });
    }

    // перехват обновления таймфрейма
    const oldUpdate = window.updateTimeFormatter;
    window.updateTimeFormatter = function(){
      if(typeof oldUpdate==='function') oldUpdate();
      reapplyTZFormatter();
    };

    // перехват подгрузки свечей
    const oldLoad = window.loadKlines;
    window.loadKlines = async function(){
      const res = await oldLoad.apply(this, arguments);
      reapplyTZFormatter();
      return res;
    };

    reapplyTZFormatter();
    console.info('✅ fix-timezone-sync-2 active');
  });
})();
