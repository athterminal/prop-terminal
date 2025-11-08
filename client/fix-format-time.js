// fix-format-time.js — форматирование дат для разных таймфреймов
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.chart) return console.warn('fix-format-time: chart not ready');

    window.formatCandleTime = function(tsSec, tf){
      const tzOffset = (window.timezoneOffsetMinutes || 0) * 60;
      const d = new Date((tsSec + tzOffset) * 1000);

      const weekdays = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
      const months = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

      const dayName = weekdays[d.getUTCDay()];
      const day = String(d.getUTCDate()).padStart(2,'0');
      const month = months[d.getUTCMonth()];
      const year = d.getUTCFullYear();
      const hh = String(d.getUTCHours()).padStart(2,'0');
      const mm = String(d.getUTCMinutes()).padStart(2,'0');

      // Monthly: show weekday of 1st, then "01 MONTH YEAR" (no time)
      if (tf === '1M') {
        const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
        const wd = weekdays[first.getUTCDay()];
        return `${wd} 01 ${months[first.getUTCMonth()]} ${first.getUTCFullYear()}`;
      }

      // Weekly: show Monday of that week ("Пн DD MON YYYY"), no time
      if (tf === '1w') {
        const dd = new Date((tsSec + tzOffset) * 1000);
        const dow = dd.getUTCDay();
        const monday = new Date(dd);
        // compute monday (ISO-style: week starts Monday)
        monday.setUTCDate(dd.getUTCDate() - ((dow + 6) % 7));
        return `Пн ${String(monday.getUTCDate()).padStart(2,'0')} ${months[monday.getUTCMonth()]} ${monday.getUTCFullYear()}`;
      }

      // Daily: show weekday + date + time
      if (tf === '1d') {
        return `${dayName} ${day} ${month} ${year} ${hh}:${mm}`;
      }

      // All lower-than-daily (4h,1h,15m,5m,1m, etc): show just number + time
      return `${day} ${hh}:${mm}`;
    };

    // apply formatter to chart immediately and on interval changes
    function applyFormatter(){
      try {
        chart.applyOptions({
          localization: {
            timeFormatter: (t) => window.formatCandleTime(t, window.currentInterval || '1m')
          }
        });
      } catch(e){
        console.warn('fix-format-time: apply failed', e);
      }
    }

    // override/attach existing helpers if present
    if (typeof window.updateTimeFormatter === 'function') {
      const old = window.updateTimeFormatter;
      window.updateTimeFormatter = function(){
        old();
        applyFormatter();
      };
    } else {
      window.updateTimeFormatter = applyFormatter;
    }

    // also patch loadKlines if exists to reapply formatter after reloads
    if (typeof window.loadKlines === 'function') {
      const oldLoad = window.loadKlines;
      window.loadKlines = async function(){
        const r = await oldLoad.apply(this, arguments);
        applyFormatter();
        return r;
      };
    }

    // initial apply
    applyFormatter();
    console.info('✅ fix-format-time applied');
  });
})();
