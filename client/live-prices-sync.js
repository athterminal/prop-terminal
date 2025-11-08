/* ---------- LIVE PRICE SYNC (Positions, Quotes, Equity) ---------- */
(() => {
  if (!window.ws) {
    console.warn("⚠️ Live feed not initialized yet");
    return;
  }

  // Helper для форматирования
  const fmt = (n) => Number(n).toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  // Обновление цены актива в списке котировок
  const updateQuote = (symbol, price) => {
    const el = document.querySelector(`.quote-${symbol}`);
    if (el) el.textContent = fmt(price);
  };

  // Обновление позиций
  const updatePositions = (symbol, price) => {
    const rows = document.querySelectorAll('.positions-table tbody tr');
    rows.forEach(row => {
      const sym = row.getAttribute('data-symbol');
      if (sym !== symbol) return;

      const entry = parseFloat(row.getAttribute('data-entry'));
      const side = row.getAttribute('data-side');
      const vol = parseFloat(row.getAttribute('data-vol'));

      const pnl = (side === 'BUY' ? (price - entry) : (entry - price)) * vol * 1000;
      const pnlCell = row.querySelector('.cell-pnl');
      if (pnlCell) {
        pnlCell.textContent = (pnl >= 0 ? '+' : '') + fmt(pnl);
        pnlCell.style.color = pnl >= 0 ? '#4ade80' : '#f87171'; // зелёный / красный
      }

      const priceCell = row.querySelector('.cell-price');
      if (priceCell) priceCell.textContent = fmt(price);
    });
  };

  // Подключаемся к уже существующему Binance-потоку
  const originalOnMessage = ws.onmessage;
  ws.onmessage = (event) => {
    originalOnMessage(event);

    const msg = JSON.parse(event.data);
    if (!msg.k) return;

    const symbol = msg.s.toLowerCase();
    const price = parseFloat(msg.k.c);

    updateQuote(symbol, price);
    updatePositions(symbol, price);
  };
})();