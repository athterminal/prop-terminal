/* ---------- FINAL FIXED LIVE CANDLES (like TradingView) ---------- */
let ws = null;
let liveSymbol = currentSymbol.toLowerCase();
let liveInterval = currentInterval;
let lastCandle = null;
let autoScroll = true; // будем проверять, двигается ли пользователь

// Подключение WebSocket
function connectLiveFeed(symbol, interval) {
  if (ws) ws.close();
  const stream = `${symbol.toLowerCase()}@kline_${interval}`;
  const url = `wss://stream.binance.com:9443/ws/${stream}`;
  ws = new WebSocket(url);

  console.log("✅ Connected live feed:", stream);

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

    // Если новая свеча
    if (!lastCandle || c.time > lastCandle.time) {
      lastCandle = c;
      candleSeries.update(c);
    } else {
      // Обновляем текущую свечу плавно
      lastCandle.high = Math.max(lastCandle.high, c.close);
      lastCandle.low = Math.min(lastCandle.low, c.close);
      lastCandle.close = c.close;
      candleSeries.update(lastCandle);
    }

    // Когда свеча закрылась — фиксируем и ждём новую
    if (k.x) {
      candleSeries.update(c);
      lastCandle = null;
    }
  };

  ws.onclose = () => {
    console.log("⚠️ Live feed closed, reconnecting...");
    setTimeout(() => connectLiveFeed(symbol, interval), 3000);
  };
}

// Подключение нового потока
async function restartLive() {
  if (ws) {
    ws.close();
    ws = null;
  }
  liveSymbol = currentSymbol;
  liveInterval = currentInterval;
  connectLiveFeed(liveSymbol, liveInterval);
}

// Отслеживаем ручное перемещение графика — если пользователь отмотал влево, авто-скролл не трогаем
chart.timeScale().subscribeVisibleTimeRangeChange(() => {
  const position = chart.timeScale().scrollPosition();
  autoScroll = position >= -1;
});

// Мягкое автоцентрирование, если пользователь не двигал график
setInterval(() => {
  if (autoScroll) chart.timeScale().scrollToRealTime();
}, 3000);

// Запуск потока при загрузке
restartLive();
