(() => {
  const overview = document.querySelector('.intro');
  const listPanel = document.querySelector('.list-panel');
  if (!overview || !listPanel) return;
  let monthCursor = new Date();
  monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);

  const panel = document.createElement('section');
  panel.className = 'card calendar-panel';
  listPanel.before(panel);
  // 状态总览已移至左侧导航栏；主区域直接展示日历，不再保留冗余切换层。
  overview.remove();

  const styles = document.createElement('style');
  styles.textContent = `
    .view-slider{position:relative;display:grid;grid-template-columns:1fr 1fr;width:178px;height:34px;padding:3px;border:1px solid var(--line);border-radius:11px;background:#0b1430;isolation:isolate}.view-slider i{position:absolute;z-index:0;inset:3px auto 3px 3px;width:calc(50% - 3px);border-radius:8px;background:linear-gradient(135deg,#6675ef,#5169d8);transition:transform .23s cubic-bezier(.2,.8,.2,1);box-shadow:0 4px 12px #0003}.view-slider.calendar i{transform:translateX(100%)}.view-slider button{position:relative;z-index:1;border:0;background:transparent;color:#96a5c8;font-size:10px;font-weight:700;cursor:pointer;border-radius:7px}.view-slider button.active{color:#fff;text-shadow:0 1px 1px #0005}.status-board-title.calendar-active p{visibility:hidden}
    .calendar-panel{padding:14px;overflow:hidden}.calendar-header{display:flex;align-items:center;gap:8px;margin-bottom:11px}.calendar-heading{margin-right:auto}.calendar-heading .eyebrow{margin-bottom:2px}.calendar-heading h2{font-size:18px;margin:0;letter-spacing:-.3px}.calendar-control{width:29px;height:29px;border:1px solid var(--line);border-radius:9px;background:#0d1630;color:#cdd9f6;font-size:18px;line-height:1;cursor:pointer;transition:transform .16s,background .16s}.calendar-control:hover{background:#24345e;transform:translateY(-1px)}.calendar-today{border:1px solid #526ae0;color:#cdd8ff;background:#5165d51e;border-radius:8px;padding:7px 10px;font-size:10px;font-weight:700;cursor:pointer}.calendar-weekdays,.calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}.calendar-weekdays{border:1px solid var(--line);border-bottom:0;border-radius:12px 12px 0 0;overflow:hidden}.calendar-weekdays span{padding:7px 10px;color:#8697bf;font-size:9px;text-align:right;border-right:1px solid var(--line)}.calendar-weekdays span:last-child{border-right:0}.calendar-grid{border:1px solid var(--line);border-radius:0 0 12px 12px;overflow:hidden}.calendar-day{min-height:76px;padding:5px 6px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:#09112682;transition:background .16s}.calendar-day:nth-child(7n){border-right:0}.calendar-day:nth-last-child(-n+7){border-bottom:0}.calendar-day.outside{background:#060c1c80}.calendar-day.today{background:linear-gradient(145deg,#202c5d88,#101831b8)}.calendar-date{display:flex;justify-content:flex-end;align-items:center;height:17px;font-size:10px;color:#a7b4d0}.calendar-day.outside .calendar-date{color:#54627f}.calendar-day.today .calendar-date span{display:grid;place-items:center;width:18px;height:18px;border-radius:50%;background:#6675ef;color:#fff;font-weight:800}.calendar-event{display:block;width:100%;margin-top:3px;border:0;border-left:3px solid var(--cyan);border-radius:4px;background:#29396d9c;color:#e7ecff;text-align:left;padding:4px 5px;font-size:9px;line-height:1.35;white-space:normal;overflow-wrap:anywhere;cursor:pointer;transition:transform .16s,filter .16s}.calendar-event:hover{transform:translateX(2px);filter:brightness(1.15)}.calendar-event.pending{border-left-color:var(--orange);background:#6f482733}.calendar-event.waiting{border-left-color:#b394ff;background:#5f488533}.calendar-event.offer{border-left-color:var(--green);background:#27654d33}.calendar-event.failed{border-left-color:var(--red);background:#71344433}.calendar-legend{display:flex;align-items:center;gap:13px;margin-top:10px;color:#91a0c0;font-size:9px}.calendar-legend span:before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:4px;background:currentColor}.calendar-legend .pending{color:var(--orange)}.calendar-legend .waiting{color:#b394ff}.calendar-legend .offer{color:var(--green)}.calendar-legend .failed{color:var(--red)}
  `;
  document.head.append(styles);

  const pad = (number) => String(number).padStart(2, '0');
  const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const formatTime = (value) => new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateRecords = (key) => records.filter((record) => record.date && record.date.slice(0, 10) === key).sort((a, b) => new Date(a.date) - new Date(b.date));

  const render = () => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const offset = firstDay.getDay();
    const calendarStart = new Date(year, month, 1 - offset);
    const today = toKey(new Date());
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarDays = Math.ceil((offset + daysInMonth) / 7) * 7;
    const days = Array.from({ length: calendarDays }, (_, index) => {
      const day = new Date(calendarStart);
      day.setDate(calendarStart.getDate() + index);
      const key = toKey(day);
      const dayEvents = dateRecords(key);
      const events = dayEvents.map((record) => `<button type="button" class="calendar-event ${map[record.status]}" data-record-id="${record.id}" title="${esc(record.company)}">${formatTime(record.date)} ${esc(record.company)}</button>`).join('');
      return `<div class="calendar-day ${day.getMonth() !== month ? 'outside' : ''} ${key === today ? 'today' : ''}"><div class="calendar-date"><span>${day.getDate()}</span></div>${events}</div>`;
    }).join('');
    panel.innerHTML = `<div class="calendar-header"><div class="calendar-heading"><div class="eyebrow">INTERVIEW CALENDAR</div><h2>${year} 年 ${month + 1} 月</h2></div><button class="calendar-today" type="button" data-calendar-today>今天</button><button class="calendar-control" type="button" data-calendar-prev aria-label="上个月">‹</button><button class="calendar-control" type="button" data-calendar-next aria-label="下个月">›</button></div><div class="calendar-weekdays"><span>周日</span><span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span><span>周六</span></div><div class="calendar-grid">${days}</div><div class="calendar-legend"><span class="pending">待面试</span><span class="waiting">等待反馈</span><span class="offer">获得 offer</span><span class="failed">未通过</span></div>`;
    panel.querySelector('[data-calendar-prev]').onclick = () => { monthCursor = new Date(year, month - 1, 1); render(); };
    panel.querySelector('[data-calendar-next]').onclick = () => { monthCursor = new Date(year, month + 1, 1); render(); };
    panel.querySelector('[data-calendar-today]').onclick = () => { const now = new Date(); monthCursor = new Date(now.getFullYear(), now.getMonth(), 1); render(); };
    panel.querySelectorAll('[data-record-id]').forEach((event) => {
      event.onclick = () => { const record = records.find((item) => item.id === event.dataset.recordId); if (record) { selected = record; draw(); } };
    });
  };

  const previousDraw = draw;
  draw = () => { previousDraw(); render(); };
  render();
})();
