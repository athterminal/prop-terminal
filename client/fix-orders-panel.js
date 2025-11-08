/* eslint-env browser */
// fix-orders-panel.js — надёжный переключатель Market / Limit + поле Price
document.addEventListener('DOMContentLoaded', () => {
  let marketTab = document.querySelector('.trade-tab[data-tab="market"]');
  let limitTab  = document.querySelector('.trade-tab[data-tab="limit"]');

  if (!marketTab || !limitTab) {
    const tabs = Array.from(document.querySelectorAll('.trade-tab'));
    tabs.forEach(t => {
      const txt = (t.textContent || '').toLowerCase();
      if (!marketTab && txt.includes('market')) marketTab = t;
      if (!limitTab && (txt.includes('limit') || txt.includes('limit/stop'))) limitTab = t;
    });
  }

  const tradeArea = document.getElementById('trade-area');
  if (!tradeArea || !marketTab || !limitTab) return;

  // Volume -> Quantity
  tradeArea.querySelectorAll('label').forEach(l => {
    if ((l.textContent || '').trim().toLowerCase() === 'volume') l.textContent = 'Quantity';
  });

  // Добавить поле Price, если нет
  if (!document.querySelector('.price-row')) {
    const priceRow = document.createElement('div');
    priceRow.className = 'form-row price-row';
    priceRow.style.display = 'none';
    priceRow.innerHTML = `
      <label style="width:90px;color:var(--muted);font-size:13px">Price</label>
      <input id="limit-price" type="number" step="0.01" placeholder="Enter limit price"
        style="flex:1;padding:8px;border-radius:6px;border:1px solid #252930;background:#0e1117;color:var(--text)" />
    `;
    const quantityRow = Array.from(tradeArea.querySelectorAll('.form-row')).find(r =>
      r.querySelector('label')?.textContent?.trim().toLowerCase() === 'quantity'
    );
    const actionRow = tradeArea.querySelector('.action-row');
    if (quantityRow) quantityRow.insertAdjacentElement('afterend', priceRow);
    else if (actionRow) actionRow.parentNode.insertBefore(priceRow, actionRow);
    else tradeArea.appendChild(priceRow);
  }

  const priceRowEl = document.querySelector('.price-row');

  function setActive(tab) {
    document.querySelectorAll('.trade-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  }

  function switchToMarket() {
    setActive(marketTab);
    if (priceRowEl) priceRowEl.style.display = 'none';
    window.currentOrderType = 'market';
  }

  function switchToLimit() {
    setActive(limitTab);
    if (priceRowEl) priceRowEl.style.display = 'flex';
    window.currentOrderType = 'limit';
  }

  marketTab.addEventListener('click', e => { e.preventDefault(); switchToMarket(); });
  limitTab.addEventListener('click', e => { e.preventDefault(); switchToLimit(); });

  // Стартовое состояние
  const active = document.querySelector('.trade-tab.active');
  if (active === limitTab) switchToLimit(); else switchToMarket();
});
