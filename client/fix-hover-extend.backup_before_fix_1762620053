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
        // some versions expect objects or numbers, but we try best-effort
        try { timeScale.setVisibleRange(r); } catch(e2) {}
      }
    }

    function expandIfNeeded(clientX) {
      const rect = chartEl.getBoundingClientRect();
      const x = clientX - rect.left;
      const ratio = x / rect.width;
      // порог — 0.88 (88% правой стороны)
      if (ratio < 0.88) {
        // если уходили влево — восстановим (дебаунс)
        if (originalRange && Date.now() - lastAction > 200) {
          restoring = true;
          setVisible(originalRange);
          originalRange = null;
        }
        return;
      }

      const vr = getVisible();
      if (!vr) return;
      // запоминаем оригинал только один раз
      if (!originalRange) originalRange = { from: vr.from, to: vr.to };

      const span = vr.to - vr.from;
      const extraFactor = 0.6; // насколько расширяем (60% of span)
      const newTo = vr.to + span * extraFactor * Math.min(3, (ratio - 0.88) * 5); // мягкое масштабирование по удалению
      setVisible({ from: vr.from, to: newTo });
      lastAction = Date.now();
    }

    // debounce wrapper
    let timer = null;
    chartEl.addEventListener('mousemove', (e) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => expandIfNeeded(e.clientX), 40);
    });

    chartEl.addEventListener('mouseleave', () => {
      if (originalRange) {
        setVisible(originalRange);
        originalRange = null;
      }
    });

    console.info('✅ fix-hover-extend loaded — expands right timeScale near edge');
  });
})();
