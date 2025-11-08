// fix-timezone-sync.js — обновляет форматирование времени при смене UTC
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.chart) return console.warn('fix-timezone-sync: chart not found');

    // глобальные переменные
    if (typeof window.timezoneOffsetMinutes === 'undefined') window.timezoneOffsetMinutes = 0;

    const weekdays = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
    const months = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

    function formatWithTZ(ts, tf='1m') {
      const d = new Date((ts + (window.timezoneOffsetMinutes * 60)) * 1000);
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const mm = months[d.getUTCMonth()];
      const yyyy = d.getUTCFullYear();
      const hh = String(d.getUTCHours()).padStart(2, '0');
      const mn = String(d.getUTCMinutes()).padStart(2, '0');
      if (tf === '1d') return `${dd} ${mm} ${yyyy}`;
      return `${dd} ${mm} ${yyyy} ${hh}:${mn}`;
    }

    function applyFormatter() {
      chart.applyOptions({
        localization: {
          timeFormatter: t => formatWithTZ(t, window.currentInterval || '1m')
        }
      });
    }

    // при смене смещения в fix-timezone.js вызвать applyFormatter
    const _setOffset = window.setTimezoneOffsetMinutes;
    window.setTimezoneOffsetMinutes = function(v) {
      window.timezoneOffsetMinutes = v;
      if (typeof _setOffset === 'function') _setOffset(v);
      applyFormatter();
      console.info('fix-timezone-sync: applied new offset', v);
    };

    // резервный listener для старых версий
    window.addEventListener('timezone-changed', applyFormatter);

    // начальное применение
    applyFormatter();
    console.info('✅ fix-timezone-sync active');
  });
})();
