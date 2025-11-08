/* eslint-env browser */
/* ---------- LIVE PRICES + SYNC WITH GRAPH ---------- */
(() => {
  const pairs = ['BTCUSDT','ETHUSDT','BNBUSDT','XRPUSDT','ADAUSDT'];
  const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');

  function fmtPrice(num) {
    if (num === null || num === undefined) return '--';
    return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (!Array.isArray(data)) return;
    for (const t of data) {
      const s = t.s;
      if (!pairs.includes(s)) continue;

      const price = parseFloat(t.c);
      const el = document.querySelector(`[data-symbol="${s}"]`);
      if (el) {
        el.textContent = fmtPrice(price);
        el.style.color = (parseFloat(t.P) >= 0 ? '#4caf50' : '#ff5252');
      }

      // синхронно обновляем таблицу ордеров
      const rows = document.querySelectorAll('table tr');
      rows.forEach(row => {
        if (row.textContent.includes(s)) {
          const curCell = row.querySelector('.current-price');
          if (curCell) curCell.textContent = fmtPrice(price);

          const entry = parseFloat(row.querySelector('.entry')?.textContent?.replace(/,/g, ''));
          const vol = parseFloat(row.querySelector('.vol')?.textContent);
          const pnlCell = row.querySelector('.pnl');
          if (entry && pnlCell) {
            const pnl = (price - entry) * (vol || 1);
            pnlCell.textContent = (pnl >= 0 ? '+' : '') + fmtPrice(pnl);
            pnlCell.style.color = pnl >= 0 ? '#4caf50' : '#ff5252';
          }
        }
      });
    }
  };
})();
