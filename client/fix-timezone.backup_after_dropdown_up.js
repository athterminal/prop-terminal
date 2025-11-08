/* eslint-env browser */
/* fix-timezone.js — dropdown opens upward, aligned with UTC button */
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

  window.offsetMinutes = 0;
  window.tzLabel = 'UTC+0';

  function updateUtcDisplay() {
    utcBtn.textContent = new Date().toISOString().slice(11, 19) + ' ' + tzLabel;
  }

  function openMenuUp() {
    const existing = document.getElementById('tz-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.id = 'tz-menu';
    menu.style.position = 'absolute';
    menu.style.background = 'var(--panel-2)';
    menu.style.border = '1px solid var(--border)';
    menu.style.borderRadius = '8px';
    menu.style.padding = '6px';
    menu.style.boxShadow = '0 8px 20px rgba(0,0,0,0.6)';
    menu.style.zIndex = '3000';

    /* вычисляем положение: по центру над кнопкой */
    const rect = utcBtn.getBoundingClientRect();
    menu.style.left = (rect.left + rect.width / 2) + 'px';
    menu.style.transform = 'translateX(-50%)';
    menu.style.bottom = (window.innerHeight - rect.top + 6) + 'px';

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
        localStorage.setItem('tzLabel', tz.label.split(' ')[0]);
        updateUtcDisplay();
        if (typeof window.updateTimeFormatter === 'function') window.updateTimeFormatter();
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
    try {
      const savedOffset = parseInt(localStorage.getItem('tzOffset') || '0', 10);
      const savedLabel = localStorage.getItem('tzLabel') || 'UTC+0';
      window.offsetMinutes = savedOffset;
      window.tzLabel = savedLabel;
      updateUtcDisplay();
    } catch (e) {}
    utcBtn.addEventListener('click', e => {
      e.stopPropagation();
      openMenuUp();
    });
    setInterval(updateUtcDisplay, 1000);
  });
})();
