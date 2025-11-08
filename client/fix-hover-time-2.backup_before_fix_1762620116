// fix-hover-time-2.js — перемещена и стилизована как TradingView footer label
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const chartContainer = document.getElementById('chart');
      if (!chartContainer || !window.chart) {
        console.warn('fix-hover-time-2: chart not found');
        return;
      }

      // удаляем старые копии
      document.querySelectorAll('.tv-hover-time-v5,.tv-hover-time-v4,.tv-hover-time-v2').forEach(e => e.remove());

      // создаем hover label
      let hover = document.createElement('div');
      hover.className = 'tv-hover-time-final';
      Object.assign(hover.style, {
        position: 'absolute',
        bottom: '0px', // на оси времени
        height: '18px',
        lineHeight: '18px',
        padding: '0 6px',
        fontSize: '11.5px',
        fontFamily: 'Inter, Arial, sans-serif',
        color: '#d1d4dc',
        background: '#131722',
        border: '1px solid #2a2e39',
        borderRadius: '2px',
        pointerEvents: 'none',
        transform: 'translateX(-50%)',
        opacity: '0',
        transition: 'opacity 0.15s ease',
        zIndex: 200,
        whiteSpace: 'nowrap',
      });
      chartContainer.appendChild(hover);

      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const fmt = (tsSec) => {
        const d = new Date((tsSec + (window.timezoneOffsetMinutes || 0) * 60) * 1000);
        const day = String(d.getDate()).padStart(2,'0');
        const mon = months[d.getMonth()];
        const hh = String(d.getHours()).padStart(2,'0');
        const mm = String(d.getMinutes()).padStart(2,'0');
        return `${day} ${mon} ${hh}:${mm}`;
      };

      const timeScale = () => window.chart.timeScale();
      const getVisibleRange = () => timeScale().getVisibleRange ? timeScale().getVisibleRange() : null;

      function clientXtoTime(clientX) {
        const rect = chartContainer.getBoundingClientRect();
        const x = clientX - rect.left;
        try {
          const t = timeScale().coordinateToTime && timeScale().coordinateToTime(x);
          if (t) return t;
        } catch {}
        const vr = getVisibleRange();
        if (!vr) return null;
        const rectW = rect.width;
        const from = typeof vr.from === 'number' ? vr.from : vr.from.time;
        const to = typeof vr.to === 'number' ? vr.to : vr.to.time;
        return from + ((to - from) * (x / rectW));
      }

      function showAt(clientX, text) {
        const rect = chartContainer.getBoundingClientRect();
        const x = clientX - rect.left;
        hover.style.left = `${x}px`;
        hover.textContent = text;
        hover.style.opacity = '1';
      }

      function hideHover() {
        hover.style.opacity = '0';
      }

      chartContainer.addEventListener('mousemove', (ev) => {
        try {
          const t = clientXtoTime(ev.clientX);
          if (!t) { hideHover(); return; }
          const txt = fmt(t);
          showAt(ev.clientX, txt);
        } catch(err) {
          console.error('fix-hover-time-2 error', err);
        }
      });

      chartContainer.addEventListener('mouseleave', () => hideHover());

      console.info('✅ fix-hover-time-2 (TradingView position & style) active');
    } catch(e) {
      console.error('fix-hover-time-2 failed', e);
    }
  });
})();
