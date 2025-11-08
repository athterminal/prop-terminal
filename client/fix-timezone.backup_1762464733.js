/* eslint-env browser */
// fix-timezone.js — новый аккуратный dropdown под кнопкой UTC
(() => {
  const btn = document.getElementById('utc-button');
  if (!btn) return;

  const zones = [
    { offset: -5, name: 'New York' },
    { offset: 0, name: 'London' },
    { offset: 1, name: 'Madrid' },
    { offset: 2, name: 'Helsinki' },
    { offset: 3, name: 'Moscow' },
    { offset: 4, name: 'Dubai' },
    { offset: 7, name: 'Bangkok' },
    { offset: 8, name: 'Singapore' },
    { offset: 9, name: 'Tokyo' },
    { offset: 12, name: 'Auckland' },
  ];

  const dropdown = document.createElement('div');
  dropdown.id = 'tz-dropdown';
  Object.assign(dropdown.style, {
    position: 'absolute',
    background: '#0b0f14',
    border: '1px solid #1a1f25',
    borderRadius: '8px',
    padding: '4px 0',
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
    display: 'none',
    zIndex: 9999,
    minWidth: '180px'
  });

  zones.forEach(z => {
    const item = document.createElement('div');
    item.textContent = `UTC${z.offset >= 0 ? '+' + z.offset : z.offset} — ${z.name}`;
    Object.assign(item.style, {
      padding: '6px 12px',
      cursor: 'pointer',
      color: '#d1d4dc',
      fontSize: '13px'
    });
    item.onmouseenter = () => item.style.background = '#1a1f25';
    item.onmouseleave = () => item.style.background = 'transparent';
    item.onclick = () => {
      timezoneOffsetMinutes = z.offset * 60;
      tzLabel = `UTC${z.offset >= 0 ? '+' + z.offset : z.offset}`;
      updateUtcDisplay();
      dropdown.style.display = 'none';
    };
    dropdown.appendChild(item);
  });

  document.body.appendChild(dropdown);

  window.tzLabel = 'UTC+0';
  window.timezoneOffsetMinutes = 0;

  window.updateUtcDisplay = function() {
    const now = new Date();
    const shifted = new Date(now.getTime() + timezoneOffsetMinutes * 60000);
    const hh = String(shifted.getUTCHours()).padStart(2, '0');
    const mm = String(shifted.getUTCMinutes()).padStart(2, '0');
    const ss = String(shifted.getUTCSeconds()).padStart(2, '0');
    btn.textContent = `${hh}:${mm}:${ss} ${tzLabel}`;
  };
  setInterval(updateUtcDisplay, 1000);
  updateUtcDisplay();

  btn.onclick = (e) => {
    e.stopPropagation();
    const rect = btn.getBoundingClientRect();
    dropdown.style.left = rect.left + 'px';
    dropdown.style.top = rect.bottom + 6 + 'px';
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  };

  document.addEventListener('click', e => {
    if (!dropdown.contains(e.target) && e.target !== btn)
      dropdown.style.display = 'none';
  });
})();
