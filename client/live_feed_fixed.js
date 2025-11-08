// --- LIVE FEED + FULLSCREEN FIX ---
document.addEventListener("DOMContentLoaded", () => {
  if (typeof chart === "undefined" || typeof candleSeries === "undefined") return;

  let ws = null;
  let lastCandle = null;

  function connectFeed(symbol, interval) {
    if (ws) ws.close();
    const url = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`;
    ws = new WebSocket(url);

    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (!m.k) return;
      const k = m.k;
      const c = {
        time: Math.floor(k.t / 1000),
        open: +k.o,
        high: +k.h,
        low: +k.l,
        close: +k.c,
      };

      if (!lastCandle || c.time > lastCandle.time) {
        lastCandle = c;
        candleSeries.update(c);
      } else {
        lastCandle.high = Math.max(lastCandle.high, c.close);
        lastCandle.low = Math.min(lastCandle.low, c.close);
        lastCandle.close = c.close;
        candleSeries.update(lastCandle);
      }

      if (k.x) {
        candleSeries.update(c);
        lastCandle = null;
      }
    };

    ws.onclose = () => setTimeout(() => connectFeed(symbol, interval), 3000);
  }

  connectFeed(currentSymbol, currentInterval);

  // --- FULLSCREEN BUTTON FIX (stable version) ---
  const expandBtn = document.querySelector(".chart-fullscreen, .expand-btn, [data-action=fullscreen]");
  const chartContainer = document.querySelector("#chart-container, .chart-container");

  if (expandBtn && chartContainer) {
    expandBtn.addEventListener("click", () => {
      const el = chartContainer;

      if (!document.fullscreenElement) {
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();

        el.style.transition = "all 0.3s ease";
        el.style.zIndex = "9999";
        el.style.background = "#0a0a0a";
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();

        el.style.zIndex = "1";
      }
    });
  }
});
