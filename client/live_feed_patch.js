/* ---------- ADVANCED LIVE CANDLES (dynamic every tick) ---------- */
let ws = null;
let liveSymbol = currentSymbol.toLowerCase();
let liveInterval = currentInterval;
let lastCandle = null;

function connectLiveFeed(symbol, interval) {
  if (ws) ws.close();
  const stream = `${symbol.toLowerCase()}@kline_${interval}`;
  const url = `wss://stream.binance.com:9443/ws/${stream}`;
  ws = new WebSocket(url);

  console.log("Live feed connected:", stream);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (!msg.k) return;
    const k = msg.k;
    const c = {
      time: Math.floor(k.t / 1000),
      open: +k.o,
      high: +k.h,
      low: +k.l,
      close: +k.c,
    };

    // Если новая свеча — добавляем, если текущая — обновляем плавно
    if (!lastCandle || c.time > lastCandle.time) {
      lastCandle = c;
      candleSeries.update(c);
    } else {
      lastCandle.high = Math.max(lastCandle.high, c.close);
      lastCandle.low = Math.min(lastCandle.low, c.close);
      lastCandle.close = c.close;
      candleSeries.update(lastCandle);
    }

    // Если свеча закрылась — фиксируем и ждём новую
    if (k.x) {
      candleSeries.update(c);
      lastCandle = null;
    }
  };

  ws.onclose = () => {
    console.log("Live feed closed, reconnecting...");
    setTimeout(() => connectLiveFeed(symbol, interval), 3000);
  };
}

async function restartLive() {
  if (ws) {
    ws.close();
    ws = null;
  }
  liveSymbol = currentSymbol;
  liveInterval = currentInterval;
  connectLiveFeed(liveSymbol, liveInterval);
}

// подключаем при загрузке
restartLive();

/* ---------- AUTO-SCROLL TO LATEST CANDLE ---------- */
setInterval(() => {
  const timeScale = chart.timeScale();
  const visibleRange = timeScale.getVisibleLogicalRange();
  if (!visibleRange) return;
  const right = visibleRange.to + 2;
  timeScale.setVisibleLogicalRange({ from: visibleRange.from, to: right });
}, 1000);
