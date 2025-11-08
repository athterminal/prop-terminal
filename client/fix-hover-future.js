// fix-hover-future.js — расширяет плашку TradingView на будущее (правее свечей)
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.chart) return console.warn('chart not found');
    const chartEl = document.getElementById('chart');
    if (!chartEl) return console.warn('chart element not found');

    const timeScale = chart.timeScale();

    function calcFutureTime(clientX) {
      const rect = chartEl.getBoundingClientRect();
      const x = clientX - rect.left;
      const vr = timeScale.getVisibleRange();
      if (!vr || !vr.from || !vr.to) return null;

      const from = vr.from.time || vr.from;
      const to   = vr.to.time   || vr.to;
      const width = rect.width;
      const ratio = x / width;

      // если курсор правее правого края
      if (ratio > 1) {
        const extra = (to - from) * (ratio - 1) * 1.2; // расширение 20%
        return to + extra;
      }

      // нормальная зона
      const t = timeScale.coordinateToTime(x);
      if (t) return t;

      // запасной расчёт
      return from + (to - from) * Math.max(0, Math.min(1, ratio));
    }

    function fmtTime(sec) {
      const d = new Date(sec * 1000);
      const hh = String(d.getUTCHours()).padStart(2, '0');
      const mm = String(d.getUTCMinutes()).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()];
      return `${dd} ${mon} ${hh}:${mm}`;
    }

    chartEl.addEventListener('mousemove', e => {
      const t = calcFutureTime(e.clientX);
      if (!t) return;
      const hover = document.querySelector('.tv-lightweight-charts-crosshair-time div');
      if (!hover) return;
      hover.textContent = fmtTime(t);
      hover.style.opacity = '1';
    });

    console.info('✅ fix-hover-future active');
  });
})();
