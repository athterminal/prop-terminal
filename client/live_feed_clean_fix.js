/* eslint-env browser */
document.addEventListener("DOMContentLoaded",()=>{
  if(typeof chart==="undefined"||typeof candleSeries==="undefined")return;
  let ws=null;
  let lastCandle=null;
  function connectFeed(s,i){
    if(ws)ws.close();
    const u=`wss://stream.binance.com:9443/ws/${s.toLowerCase()}@kline_${i}`;
    ws=new WebSocket(u);
    ws.onmessage=e=>{
      const m=JSON.parse(e.data);
      if(!m.k)return;
      const k=m.k;
      const o=+k.o, h=+k.h, l=+k.l, c=+k.c;
      if([o,h,l,c].some(v=>!isFinite(v)||v<=0)) return; // фильтр NaN и 0
      const candle={time:Math.floor(k.t/1000),open:o,high:h,low:l,close:c};
      if(!lastCandle||candle.time>lastCandle.time){
        lastCandle=candle;
        candleSeries.update(candle)
      } else {
        lastCandle.high=Math.max(lastCandle.high,candle.close);
        lastCandle.low=Math.min(lastCandle.low,candle.close);
        lastCandle.close=candle.close;
        candleSeries.update(lastCandle)
      }
      if(k.x){ candleSeries.update(candle); lastCandle=null }
    };
    ws.onclose=()=>setTimeout(()=>connectFeed(s,i),3000)
  };
  connectFeed(currentSymbol,currentInterval)
});
