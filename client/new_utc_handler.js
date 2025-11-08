/* eslint-env browser */
utcBtn.addEventListener('click', () => {
  // удаляем возможное старое меню прежде чем создать новое
  const existing = document.getElementById('utc-presets-menu');
  if (existing) { existing.remove(); }

  const menu = document.createElement('div');
  menu.id = 'utc-presets-menu';
  menu.style.position = 'absolute';
  menu.style.background = 'var(--panel-2)';
  menu.style.border = '1px solid var(--border)';
  menu.style.padding = '6px';
  menu.style.borderRadius = '8px';
  menu.style.boxShadow = '0 8px 20px rgba(0,0,0,0.6)';
  menu.style.zIndex = 2000;
  menu.style.minWidth = '220px';

  tzPresets.forEach(tz => {
    const it = document.createElement('div');
    it.textContent = tz.label;
    it.style.padding = '6px 10px';
    it.style.cursor = 'pointer';
    it.style.color = 'var(--text)';
    it.addEventListener('click', () => {
      offsetMinutes = tz.offset;
      tzLabel = tz.label.split(' ')[0];
      updateUtcDisplay();
      updateTimeFormatter();
      if (document.body.contains(menu)) menu.remove();
    });
    it.addEventListener('mouseover', () => it.style.background = 'var(--hover)');
    it.addEventListener('mouseout', () => it.style.background = 'transparent');
    menu.appendChild(it);
  });

  document.body.appendChild(menu);

  // вычисляем позицию относительно кнопки
  const rect = utcBtn.getBoundingClientRect();

  // принудительно считываем реальную высоту меню
  const menuHeight = menu.offsetHeight || 180;
  const menuWidth = menu.offsetWidth || 220;

  // попробуем открыть вверх — если сверху есть место (> 16px запас)
  const openUp = (rect.top > menuHeight + 16);

  // горизонтально: по возможности выровнять по левому краю кнопки,
  // но не выходить за правую границу окна
  let left = rect.left;
  if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
  if (left < 8) left = 8;
  menu.style.left = left + 'px';

  if (openUp) {
    menu.style.top = (rect.top - menuHeight - 8) + 'px';
  } else {
    menu.style.top = (rect.bottom + 8) + 'px';
  }

  // Закрытие при клике вне меню
  const removeMenu = (ev) => {
    if (!menu.contains(ev.target) && ev.target !== utcBtn) {
      if (document.body.contains(menu)) menu.remove();
      document.removeEventListener('click', removeMenu);
    }
  };
  document.addEventListener('click', removeMenu);
});
