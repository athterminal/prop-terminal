export async function getCandles() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history`);
  const data = await res.json();
  return data.candles;
}
