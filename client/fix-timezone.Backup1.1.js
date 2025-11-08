/* eslint-env browser */
/* fix-timezone.js — final merged: TradingView-style labels + robust UTC dropdown (capture clicks, Esc, resize) */

document.addEventListener("DOMContentLoaded", () => {
  const utcBtn = document.getElementById("utc-button");
  if (!utcBtn) return console.warn("[fix-timezone] UTC button not found");

  const tzPresets = [
    { label: "UTC−5 — New York", offset: -300 },
    { label: "UTC+0 — London", offset: 0 },
    { label: "UTC+1 — Madrid", offset: 60 },
    { label: "UTC+2 — Helsinki", offset: 120 },
    { label: "UTC+3 — Qatar", offset: 180 },
    { label: "UTC+4 — Dubai", offset: 240 },
    { label: "UTC+7 — Bangkok", offset: 420 },
    { label: "UTC+8 — Singapore", offset: 480 },
    { label: "UTC+9 — Tokyo", offset: 540 },
    { label: "UTC+12 — Auckland", offset: 720 },
  ];

  window.offsetMinutes = parseInt(localStorage.getItem("tzOffset") || "0", 10);
  window.tzLabel = localStorage.getItem("tzLabel") || "UTC+0 — London";

  const pad = (n) => String(n).padStart(2, "0");
  const months = ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];

  function shiftedNow() { return new Date(Date.now() + window.offsetMinutes * 60000); }
  function shiftedDateFromSec(tsSec) { return new Date((tsSec + window.offsetMinutes * 60) * 1000); }

  function updateUtcDisplay() {
    const d = shiftedNow();
    const hh = pad(d.getUTCHours());
    const mm = pad(d.getUTCMinutes());
    const ss = pad(d.getUTCSeconds());
    utcBtn.textContent = `${hh}:${mm}:${ss} ${window.tzLabel.split("—")[0].trim()}`;
  }

  window.formatCandleTime = function (tsSec, tf) {
    const d = shiftedDateFromSec(tsSec);
    const day = pad(d.getUTCDate());
    const month = months[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    const hh = pad(d.getUTCHours());
    const mm = pad(d.getUTCMinutes());
    switch (tf) {
      case "1M": return `${month} ${year}`;
      case "1w":
      case "1d": return `${day} ${month}`;
      case "4h":
      case "1h": return `${day} ${month} ${hh}:${mm}`;
      default: return `${hh}:${mm}`;
    }
  };

  function openTzMenu() {
    // remove existing if any
    const existing = document.getElementById("tz-menu");
    if (existing) existing.remove();

    const menu = document.createElement("div");
    menu.id = "tz-menu";
    menu.style.position = "absolute";
    menu.style.background = "var(--panel)";
    menu.style.border = "1px solid var(--border)";
    menu.style.borderRadius = "8px";
    menu.style.padding = "4px 0";
    menu.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
    menu.style.zIndex = "9999";
    const rect = utcBtn.getBoundingClientRect();

    // open upwards (drop-up): compute parent for insertion and coordinates
    const parent = document.fullscreenElement || document.body;
    // compute coords relative to viewport of parent
    const parentRect = parent.getBoundingClientRect ? parent.getBoundingClientRect() : { top: 0, left: 0 };
    // position menu above the button
    const topPos = rect.top - parentRect.top;
    const leftPos = rect.left - parentRect.left;
    menu.style.left = leftPos + "px";
    menu.style.bottom = (parentRect.height - topPos + 6) + "px";
    menu.style.minWidth = rect.width + "px";

    tzPresets.forEach((tz) => {
      const opt = document.createElement("div");
      opt.textContent = tz.label;
      opt.style.padding = "6px 12px";
      opt.style.cursor = "pointer";
      opt.style.fontSize = "13px";
      opt.style.color = "var(--text)";
      opt.onmouseenter = () => (opt.style.background = "var(--hover)");
      opt.onmouseleave = () => (opt.style.background = "transparent");
      opt.onclick = () => {
        window.offsetMinutes = tz.offset;
        window.tzLabel = tz.label;
        localStorage.setItem("tzOffset", tz.offset);
        localStorage.setItem("tzLabel", tz.label);
        updateUtcDisplay();
        removeMenu(); // close immediately after selection
      };
      menu.appendChild(opt);
    });

    // helper to remove menu and detach listeners
    function removeMenu() {
      if (!menu.parentNode) return;
      menu.parentNode.removeChild(menu);
      document.removeEventListener("click", onDocClick, true);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }

    // click handler in capture phase to reliably detect outside clicks even in fullscreen
    function onDocClick(e) {
      // allow clicks on menu or the utcBtn
      if (menu.contains(e.target) || utcBtn.contains(e.target)) return;
      removeMenu();
    }

    function onKeyDown(e) {
      if (e.key === "Escape") removeMenu();
    }

    function onResize() {
      // reposition or close on resize for safety
      removeMenu();
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") removeMenu();
    }

    // attach listeners (use capture for click)
    document.addEventListener("click", onDocClick, true);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // append to fullscreen element if present, otherwise to body
    (document.fullscreenElement || document.body).appendChild(menu);
  }

  utcBtn.addEventListener("click", openTzMenu);
  updateUtcDisplay();
  setInterval(updateUtcDisplay, 1000);
});
