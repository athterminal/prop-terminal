/* eslint-env browser */
/* fix-timezone.js — step 6: apply timezone offset to button and chart */

(function() {
  const utcBtn = document.getElementById('utc-button');
  if (!utcBtn) return console.warn('[fix-timezone] UTC button not found');

  const tzPresets = [
    { label: 'UTC−5 — New York', offset: -300 },
    { label: 'UTC+0 — London', offset: 0 },
    { label: 'UTC+1 — Madrid', offset: 60 },
    { label: 'UTC+2 — Helsinki', offset: 120 },
    { label: 'UTC+3 — Qatar', offset: 180 },
    { label: 'UTC+4 — Dubai', offset: 240 },
    { label: 'UTC+7 — Bangkok', offset: 420 },
    { label: 'UTC+8 — Singapore', offset: 480 },
    { label: 'UTC+9 — Tokyo', offset: 540 },
    { label: 'UTC+12 — Auckland', offset: 720 },
  ];

  window.offsetMinutes = parseInt(localStorage.getItem('tzOffset') || '0', 10);
  window.tzLabel = localStorage.getItem('tzLabel') || 'UTC+0';

  function getTimeWithOffset(ms = Date.now()) {
    return new Date(ms + window.offsetMinutes * 60000);
  }

  function pad(n){return String(n).padStart(2,'0');}

  function updateUtcDisplay() {
    const d = getTimeWithOffset();
    const hh = pad(d.getUTCHours());
    const mm = pad(d.getUTCMinutes());
    const ss = pad(d.getUTCSeconds());
    utcBtn.textContent = `${hh}:${mm}:${ss} ${window.tzLabel}`;
  }

  function refreshTimeFormatter() {
    if (typeof window.formatCandleTime === 'function') {
      const old = window.formatCandleTime;
      window.formatCandleTime = function(tsSec, tf){
        const d = new Date((tsSec + window.offsetMinutes * 60) * 1000);
        const weekdays = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
        const months = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
        const dayName = weekdays[d.getUTCDay()];
        const day = pad(d.getUTCDate());
        const month = months[d.getUTCMonth()];
        const year = d.getUTCFullYear();
        const hh = pad(d.getUTCHours());
        const mm = pad(d.getUTCMinutes());
        if(tf==='1M'){return `${month} ${year}`;}
        if(tf==='1w'){return `${day} ${month}`;}
        if(tf==='1d'){return `${dayName} ${day} ${month}`;}
        return `${day} ${month} ${hh}:${mm}`;
      };
    }
    if (typeof window.updateTimeFormatter === 'function') {
      window.updateTimeFormatter();
    }
  }

  function openMenuUp() {
    const old = document.getElementById('tz-menu');
    if (old) old.remove();

    const menu = document.createElement('div');
    menu.id = 'tz-menu';
    const rect = utcBtn.getBoundingClientRect();
    menu.style.position = 'absolute';
    menu.style.left = (rect.left + rect.width / 2) + 'px';
    menu.style.transform = 'translateX(-50%)';
    menu.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
    menu.style.background = 'var(--panel-2)';
    menu.style.border = '1px solid var(--border)';
    menu.style.padding = '6px';
    menu.style.borderRadius = '8px';
    menu.style.boxShadow = '0 8px 20px rgba(0,0,0,0.6)';
    menu.style.zIndex = '3000';

    tzPresets.forEach(tz => {
      const it = document.createElement('div');
      it.textContent = tz.label;
      it.style.padding = '6px 10px';
      it.style.cursor = 'pointer';
      it.style.color = 'var(--text)';
      it.addEventListener('mouseover', () => it.style.background = 'var(--hover)');
      it.addEventListener('mouseout', () => it.style.background = 'transparent');
      it.addEventListener('click', () => {
        window.offsetMinutes = tz.offset;
        window.tzLabel = tz.label.split(' ')[0];
        localStorage.setItem('tzOffset', tz.offset);
        localStorage.setItem('tzLabel', window.tzLabel);
        refreshTimeFormatter();
        updateUtcDisplay();
        menu.remove();
      });
      menu.appendChild(it);
    });

    document.body.appendChild(menu);
    const removeMenu = ev => {
      if (!menu.contains(ev.target) && ev.target !== utcBtn) {
        menu.remove();
        document.removeEventListener('click', removeMenu);
      }
    };
    document.addEventListener('click', removeMenu);
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateUtcDisplay();
    utcBtn.addEventListener('click', e => {
      e.stopPropagation();
      openMenuUp();
    });
    setInterval(updateUtcDisplay, 1000);

    const wait = setInterval(() => {
      if (window.chart && typeof window.updateTimeFormatter === 'function') {
        clearInterval(wait);
        refreshTimeFormatter();
      }
    }, 500);
  });
})();
