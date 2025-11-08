function formatCandleTime(tsSec, tf){
  const d = new Date((tsSec + offsetMinutes*60)*1000);
  const dayName = weekdays[d.getUTCDay()];
  const day = String(d.getUTCDate()).padStart(2,'0');
  const month = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2,'0');
  const mm = String(d.getUTCMinutes()).padStart(2,'0');
  if(tf === '1M'){ const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)); return `${weekdays[first.getUTCDay()]} 01 ${months[first.getUTCMonth()]} ${first.getUTCFullYear()}`; }
  if(tf === '1w'){ const dd = new Date((tsSec + offsetMinutes*60)*1000); const dow = dd.getUTCDay(); const monday = new Date(dd); monday.setUTCDate(dd.getUTCDate() - ((dow + 6) % 7)); return `${weekdays[monday.getUTCDay()]} ${String(monday.getUTCDate()).padStart(2,'0')} ${months[monday.getUTCMonth()]} ${monday.getUTCFullYear()}`; }
  if(tf === '1d') return `${dayName} ${day} ${month} ${year}`;
  return `${dayName} ${day} ${month} ${year} ${hh}:${mm}`;
}
