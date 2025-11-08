<script>
/* ---------- ADVANCED LIVE CANDLES (dynamic every tick, fixed scroll) ---------- */
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

    // новая свеча — добавляем, текущая — обновляем
    if (!lastCandle || c.time > lastCandle.time) {
      lastCandle = c;
      candleSeries.update(c);
    } else {
      lastCandle.high = Math.max(lastCandle.high, c.close);
      lastCandle.low = Math.min(lastCandle.low, c.close);
      lastCandle.close = c.close;
      candleSeries.update(lastCandle);
    }

    // закрылась свеча — фиксируем и ждём новую
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

/* ---------- AUTO-SCROLL FIX ---------- */
setInterval(() => {
  const timeScale = chart.timeScale();
  const visibleRange = timeScale.getVisibleLogicalRange();
  if (!visibleRange) return;

  const rightEdge = timeScale.scrollPosition();
  // если пользователь не отмотал график вручную, автоцентрируем
  if (rightEdge < 1) {
    timeScale.scrollToRealTime();
  }
}, 1500);
</script>
