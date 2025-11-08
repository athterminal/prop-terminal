/* eslint-env browser */
// fix-hover-extend.js — аккуратно расширяет timeScale при наведении у правого края
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.chart) return console.warn('fix-hover-extend: chart not found');
    const chartEl = document.getElementById('chart');
    if (!chartEl) return console.warn('fix-hover-extend: chart element not found');

    const timeScale = chart.timeScale();
    let originalRange = null;
    let restoring = false;
    let lastAction = 0;

    function getVisible() {
      try {
        const vr = timeScale.getVisibleRange();
        if (!vr) return null;
        const from = (typeof vr.from === 'number') ? vr.from : (vr.from && vr.from.time);
        const to = (typeof vr.to === 'number') ? vr.to : (vr.to && vr.to.time);
        return { from, to };
      } catch(e) {
        return null;
      }
    }

    function setVisible(r) {
      try {
        timeScale.setVisibleRange({ from: r.from, to: r.to });
      } catch(e){
        try {
          timeScale.setVisibleRange(r);
        } catch(e2){
          console.warn('fix-hover-extend: setVisibleRange failed', e2);
        }
      }
    }

    function expandIfNeeded(clientX) {
      const rect = chartEl.getBoundingClientRect();
      const x = clientX - rect.left;
      const ratio = x / rect.width;
      if (ratio < 0.88) {
        if (restoring) return;
        restoring = true;
        setTimeout(() => restoring = false, 200);
        if (originalRange) setVisible(originalRange);
        return;
      }

      const now = Date.now();
      if (now - lastAction < 300) return;
      lastAction = now;

      const vr = getVisible();
      if (!vr) return;
      originalRange = vr;
      const newTo = vr.to + 60;
      setVisible({ from: vr.from, to: newTo });
    }

    chartEl.addEventListener('mousemove', (e) => expandIfNeeded(e.clientX));
    console.info('✅ fix-hover-extend active');
  });
})();
