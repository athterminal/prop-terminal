/* eslint-env browser */
/* ---------- LIVE PRICE PER SYMBOL + SIMPLE REFRESH EACH SECOND ---------- */
(() => {
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT'];

  const updatePrice = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/prices');
      const data = await res.json();

      symbols.forEach(sym => {
        const el = [...document.querySelectorAll('div')]
          .find(d => d.textContent.trim() === sym);
        if (!el) return;

        const priceData = data.find(t => t.symbol === sym);
        if (!priceData) return;

        let priceEl = el.nextElementSibling;
        if (!priceEl || !priceEl.classList.contains('live-price')) {
          priceEl = document.createElement('span');
          priceEl.className = 'live-price';
          Object.assign(priceEl.style, {
            marginLeft: '6px',
            color: '#9ecbff',
            fontSize: '12px'
          });
          el.parentNode.insertBefore(priceEl, el.nextSibling);
        }
        priceEl.textContent = parseFloat(priceData.price).toFixed(2);
      });
    } catch (e) {
      console.error('Price update error:', e);
    }
  };

  updatePrice();
  setInterval(updatePrice, 1000);
})();
