// fix-timezone-persist.js — сохраняет выбранный UTC в localStorage и восстанавливает при загрузке
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.setTimezoneOffsetMinutes) {
      console.warn('fix-timezone-persist: setTimezoneOffsetMinutes not found');
      return;
    }

    const STORAGE_KEY = 'terminal_utc_offset';
    const LABEL_KEY = 'terminal_utc_label';

    // восстановление при старте
    const savedOffset = localStorage.getItem(STORAGE_KEY);
    const savedLabel = localStorage.getItem(LABEL_KEY);
    if (savedOffset !== null && !isNaN(savedOffset)) {
      const off = parseInt(savedOffset, 10);
      window.setTimezoneOffsetMinutes(off);
      if (savedLabel && document.getElementById('utc-button')) {
        document.getElementById('utc-button').textContent = `--:--:-- ${savedLabel}`;
      }
      console.info('fix-timezone-persist: restored UTC offset', off);
    }

    // перехват изменения offset
    const origSet = window.setTimezoneOffsetMinutes;
    window.setTimezoneOffsetMinutes = function(v, label){
      origSet(v);
      localStorage.setItem(STORAGE_KEY, v);
      if (label) localStorage.setItem(LABEL_KEY, label);
      console.info('fix-timezone-persist: saved UTC offset', v);
    };

    // резервный listener (если dropdown вызывает событие)
    window.addEventListener('timezone-changed', e=>{
      if(e.detail && typeof e.detail.offset==='number'){
        localStorage.setItem(STORAGE_KEY, e.detail.offset);
        if(e.detail.label) localStorage.setItem(LABEL_KEY, e.detail.label);
        console.info('fix-timezone-persist: saved via event', e.detail);
      }
    });

    console.info('✅ fix-timezone-persist active');
  });
})();
