/* eslint-env browser */
/* eslint-env browser */
/* fix-timezone.js — merged version: sync timezone + correct TradingView-style labels */

(function(){
  const utcBtn = document.getElementById('utc-button');
  if(!utcBtn) return console.warn('[fix-timezone] UTC button not found');

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

  const months = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
  const pad = n => String(n).padStart(2,'0');

  function shiftedNow(){ return new Date(Date.now() + window.offsetMinutes*60000); }
  function shiftedDateFromSec(tsSec){ return new Date((tsSec + window.offsetMinutes*60)*1000); }

  function updateUtcDisplay(){
    const d = shiftedNow();
    const hh = pad(d.getUTCHours());
    const mm = pad(d.getUTCMinutes());
    const ss = pad(d.getUTCSeconds());
    utcBtn.textContent = `${hh}:${mm}:${ss} ${window.tzLabel}`;
  }

  // формат TradingView
  window.formatCandleTime = function(tsSec, tf){
    const d = shiftedDateFromSec(tsSec);
    const day = pad(d.getUTCDate());
    const month = months[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    const hh = pad(d.getUTCHours());
    const mm = pad(d.getUTCMinutes());

    switch(tf){
      case '1M': return `${month} ${year}`;
      case '1w': return `${day} ${month}`;
      case '1d': return `${day} ${month}`;
      case '4h': case '1h': return `${day} ${month} ${hh}:${mm}`;
      default: return `${hh}:${mm}`;
    }
  };

  // при смене таймзоны обновить и пересохранить
  window.setTimezone = function(label, offset){
    window.offsetMinutes = offset;
    window.tzLabel = label;
    localStorage.setItem('tzOffset', offset);
    localStorage.setItem('tzLabel', label);
    updateUtcDisplay();
  };

  // инициализация dropdown
  const dropdown = document.getElementById('tz-dropdown');
  if(dropdown){
    dropdown.innerHTML = '';
    tzPresets.forEach(tz=>{
      const opt = document.createElement('option');
      opt.textContent = tz.label;
      opt.value = tz.offset;
      if(tz.offset === window.offsetMinutes) opt.selected = true;
      dropdown.appendChild(opt);
    });
    dropdown.onchange = e=>{
      const idx = e.target.selectedIndex;
      const tz = tzPresets[idx];
      window.setTimezone(tz.label, tz.offset);
    };
  }

  updateUtcDisplay();
  setInterval(updateUtcDisplay, 1000);
})();
