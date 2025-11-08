/* fix-timezone.js — step: strict timeframe formatting with timezone offset */

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

  const weekdays = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
  const months = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

  function pad(n){ return String(n).padStart(2,'0'); }

  // вернуть Date, смещённую на offsetMinutes (используем UTC getters для консистентности)
  function shiftedDateFromSec(tsSec){
    return new Date((tsSec + (window.offsetMinutes||0)*60) * 1000);
  }
  function shiftedNow(){
    return new Date(Date.now() + (window.offsetMinutes||0)*60000);
  }

  // форматирование для свечек (используется index.html: formatCandleTime)
  window.formatCandleTime = function(tsSec, tf){
    // tf принимает значения как в твоём коде: '1m','5m','15m','1h','4h','1d','1w','1M'
    const d = shiftedDateFromSec(tsSec);
    const dow = weekdays[d.getUTCDay()];
    const day = pad(d.getUTCDate());
    const month = months[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    const hh = pad(d.getUTCHours());
    const mm = pad(d.getUTCMinutes());

    if (tf === '1M') {
      // первый день месяца, день недели для первого числа
      const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
      // учёт offset: first already represents first in shifted calendar because d used shifted month/year
      const fdow = weekdays[first.getUTCDay()];
      return `${fdow} 01 ${month} ${year}`;
    }
    if (tf === '1w') {
      // начинаем с понедельника: найти дату понедельника той недели (в shifted time)
      const dd = shiftedDateFromSec(tsSec);
      const dowNum = dd.getUTCDay(); // 0..6, 1 is Monday if we adjust
      // В JS 1===Monday? No: 1 is Monday? getUTCDay: 0 Sun,1 Mon...
      // Смещаем к понедельнику
      const daysToMon = (dowNum + 6) % 7; // 0->6,1->0,2->1...
      const mon = new Date(dd);
      mon.setUTCDate(dd.getUTCDate() - daysToMon);
      const mDow = weekdays[mon.getUTCDay()];
      const mDay = pad(mon.getUTCDate());
      const mMonth = months[mon.getUTCMonth()];
      const mYear = mon.getUTCFullYear();
      return `${mDow} ${mDay} ${mMonth} ${mYear}`;
    }
    if (tf === '1d') {
      return `${dow} ${day} ${month} ${year}`;
    }
    // внутридневные: показываем ДеньНедели dd Mon HH:MM
    return `${dow} ${day} ${month} ${hh}:${mm}`;
  };

  // применяем форматтер в lightweight charts для оси и crosshair
  function applyChartTimeFormatter(){
    if(!window.chart) return;
    try {
      chart.applyOptions({
        localization: {
          timeFormatter: (t) => {
            // t может быть number ms or seconds? LightweightCharts uses seconds since epoch (number) or business logic.
            // normalize to seconds
            let tsSec = Math.floor(Number(t) / 1000);
            const d = shiftedDateFromSec(tsSec);
            const dow = weekdays[d.getUTCDay()];
            const day = pad(d.getUTCDate());
            const monthNum = pad(d.getUTCMonth()+1);
            const monthName = months[d.getUTCMonth()];
            const year = d.getUTCFullYear();
            const hh = pad(d.getUTCHours());
            const mm = pad(d.getUTCMinutes());
            const ss = pad(d.getUTCSeconds());

            // Для выбора формата нужно знать видимый interval. Мы не имеем прямого доступа здесь к currentInterval,
            // но index.html определяет chart.applyOptions({ localization: { timeFormatter: (t)=>formatCandleTime(t, currentInterval) } });
            // Поэтому сделаем универсальный формат ориентируясь на диапазон: если есть non-zero hours/minutes -> intraday
            // Но точнее: попробуем взять window.currentInterval если задан
            const tf = window.currentInterval || '';
            if(tf === '1M'){
              // первый day of month label
              const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
              const fdow = weekdays[first.getUTCDay()];
              return `${fdow} 01 ${months[first.getUTCMonth()]} ${first.getUTCFullYear()}`;
            }
            if(tf === '1w'){
              const dd = d;
              const dowNum = dd.getUTCDay();
              const daysToMon = (dowNum + 6) % 7;
              const mon = new Date(dd);
              mon.setUTCDate(dd.getUTCDate() - daysToMon);
              return `${weekdays[mon.getUTCDay()]} ${pad(mon.getUTCDate())} ${months[mon.getUTCMonth()]} ${mon.getUTCFullYear()}`;
            }
            if(tf === '1d'){
              return `${dow} ${day} ${monthName} ${year}`;
            }
            // intraday: show day, month, hh:mm (and show seconds on crosshair if implemented elsewhere)
            return `${dow} ${day} ${monthName} ${hh}:${mm}`;
          }
        }
      });
      // корректируем отображение оси
      chart.timeScale().fitContent();
    } catch(e) {
      console.warn('[fix-timezone] applyChartTimeFormatter error', e);
    }
  }

  // обновление текста кнопки с учётом offset
  function updateUtcDisplay(){
    const d = shiftedNow();
    utcBtn.textContent = \`\${pad(d.getUTCHours())}:\${pad(d.getUTCMinutes())}:\${pad(d.getUTCSeconds())} \${window.tzLabel}\`;
  }

  function openMenuUp(){
    const old = document.getElementById('tz-menu'); if(old) old.remove();
    const menu = document.createElement('div'); menu.id = 'tz-menu';
    const rect = utcBtn.getBoundingClientRect();
    menu.style.position='absolute';
    menu.style.left = (rect.left + rect.width/2)+'px';
    menu.style.transform='translateX(-50%)';
    menu.style.bottom = (window.innerHeight - rect.top + 6)+'px';
    menu.style.background = 'var(--panel-2)';
    menu.style.border = '1px solid var(--border)';
    menu.style.padding = '6px';
    menu.style.borderRadius='8px';
    menu.style.boxShadow='0 8px 20px rgba(0,0,0,0.6)';
    menu.style.zIndex='3000';

    tzPresets.forEach(tz=>{
      const it = document.createElement('div');
      it.textContent = tz.label; it.style.padding='6px 10px'; it.style.cursor='pointer'; it.style.color='var(--text)';
      it.addEventListener('mouseover', ()=> it.style.background='var(--hover)');
      it.addEventListener('mouseout', ()=> it.style.background='transparent');
      it.addEventListener('click', ()=>{
        window.offsetMinutes = tz.offset;
        window.tzLabel = tz.label.split(' ')[0];
        localStorage.setItem('tzOffset', tz.offset);
        localStorage.setItem('tzLabel', window.tzLabel);
        updateUtcDisplay();
        // применяем форматтер и обновляем данные/ось
        applyChartTimeFormatter();
        if(typeof window.updateTimeFormatter === 'function') window.updateTimeFormatter();
        if(typeof window.loadKlines === 'function') window.loadKlines(window.currentSymbol, window.currentInterval);
        menu.remove();
      });
      menu.appendChild(it);
    });

    document.body.appendChild(menu);
    const removeMenu = ev => {
      if(!menu.contains(ev.target) && ev.target !== utcBtn){ menu.remove(); document.removeEventListener('click', removeMenu); }
    };
    document.addEventListener('click', removeMenu);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    updateUtcDisplay();
    utcBtn.addEventListener('click', e=>{ e.stopPropagation(); openMenuUp(); });
    setInterval(updateUtcDisplay, 1000);

    // подождём, пока chart готов
    const wait = setInterval(()=>{
      if(window.chart){
        clearInterval(wait);
        applyChartTimeFormatter();
      }
    }, 300);
  });

})();
