(() => {
  const root = document.documentElement;
  const key = 'interview-atlas-theme';
  const add = document.querySelector('#add');
  if (!add) return;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = ['light', 'dark', 'system'].includes(localStorage.getItem(key)) ? localStorage.getItem(key) : 'system';

  const selector = document.createElement('div');
  selector.className = 'theme-selector';
  selector.setAttribute('aria-label', '显示模式');
  selector.innerHTML = '<button type="button" data-theme-option="system" title="跟随系统">系统</button><button type="button" data-theme-option="light" title="明亮模式">明亮</button><button type="button" data-theme-option="dark" title="夜间模式">夜间</button>';
  add.before(selector);

  const actualTheme = () => preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
  const apply = () => {
    root.dataset.theme = actualTheme();
    selector.querySelectorAll('[data-theme-option]').forEach((button) => button.classList.toggle('active', button.dataset.themeOption === preference));
  };
  selector.querySelectorAll('[data-theme-option]').forEach((button) => {
    button.onclick = () => { preference = button.dataset.themeOption; localStorage.setItem(key, preference); apply(); };
  });
  media.addEventListener('change', () => { if (preference === 'system') apply(); });

  const style = document.createElement('style');
  style.textContent = `
    .top{gap:10px}.theme-selector{display:flex;align-items:center;height:40px;padding:3px;border:1px solid var(--line);border-radius:11px;background:#0b1430}.theme-selector button{height:32px;border:0;border-radius:8px;padding:0 10px;background:transparent;color:#aab7d6;font-size:10px;font-weight:750;cursor:pointer;transition:background .18s,color .18s,transform .18s}.theme-selector button:hover{color:#fff;background:#ffffff12}.theme-selector button.active{color:#fff;background:linear-gradient(135deg,#6876ed,#5265d8);box-shadow:0 3px 9px rgba(46,61,143,.35)}.theme-selector button:active{transform:scale(.97)}.theme-selector button:focus-visible,.view-slider button:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}
    :root[data-theme="light"]{--bg:#f3f6fc;--panel:#ffffff;--line:#d9e1f1;--txt:#17213a;--muted:#64718a;--p:#5966d9;--cyan:#147f9a;--orange:#c76b20;--red:#c44762;--green:#19885e}
    :root[data-theme="light"] body{background:radial-gradient(circle at 88% 0,#dfe5ff 0,transparent 28%),#f3f6fc;color:var(--txt)}
    :root[data-theme="light"] .card{background:linear-gradient(145deg,#ffffff,#f7f9ff);box-shadow:0 10px 28px rgba(41,58,96,.08)}
    :root[data-theme="light"] .record,:root[data-theme="light"] .meta div,:root[data-theme="light"] input,:root[data-theme="light"] select,:root[data-theme="light"] textarea,:root[data-theme="light"] .calendar-day{background:#f7f9fe}
    :root[data-theme="light"] input,:root[data-theme="light"] select,:root[data-theme="light"] textarea{color:#1d2943;caret-color:#4053be}:root[data-theme="light"] input::placeholder,:root[data-theme="light"] textarea::placeholder{color:#7887a3;opacity:1}:root[data-theme="light"] select option{background:#fff;color:#1d2943}
    :root[data-theme="light"] .record:hover,:root[data-theme="light"] .record.selected{background:#f0f3ff;border-color:#7d8ae7}:root[data-theme="light"] .avatar{background:#e8ebff;color:#4857bd}
    :root[data-theme="light"] .note{background:#eef2ff;border-color:#c6d0fc;color:#596780}:root[data-theme="light"] .note b,:root[data-theme="light"] .meta b{color:#202b43}
    :root[data-theme="light"] .secondary{background:#fff;color:#42506d;border-color:#cbd5eb}
    :root[data-theme="light"] .theme-selector{background:#edf1f9;border-color:#cbd5ea}:root[data-theme="light"] .theme-selector button{color:#53617e}:root[data-theme="light"] .theme-selector button:hover{background:#e2e8f7;color:#263452}:root[data-theme="light"] .theme-selector button.active{color:#fff;background:linear-gradient(135deg,#495ac8,#6576e8);box-shadow:0 3px 9px rgba(63,80,171,.28)}
    :root[data-theme="light"] .status-card{background:#fbfcff;color:#18223b;border-color:#d9e1f1;box-shadow:0 3px 10px rgba(37,56,105,.04)}:root[data-theme="light"] .status-card:hover{background:#f2f5ff;border-color:#9aa8ee}:root[data-theme="light"] .status-card .name,:root[data-theme="light"] .status-card small{color:#53627e}
    :root[data-theme="light"] .calendar-panel{background:linear-gradient(145deg,#fff,#f8faff)}:root[data-theme="light"] .calendar-day.outside{background:#f1f4f9}:root[data-theme="light"] .calendar-weekdays,:root[data-theme="light"] .calendar-grid{border-color:#d9e1f1}:root[data-theme="light"] .calendar-weekdays span,:root[data-theme="light"] .calendar-day{border-color:#e1e7f3}:root[data-theme="light"] .calendar-event{color:#273252;background:#e8edff}:root[data-theme="light"] .calendar-event.pending{background:#fff0e5}:root[data-theme="light"] .calendar-event.waiting{background:#f0eaff}:root[data-theme="light"] .calendar-event.offer{background:#e5f8ee}:root[data-theme="light"] .calendar-event.failed{background:#ffe9ee}
    :root[data-theme="light"] dialog,:root[data-theme="light"] .delete-dialog{background:#fff;color:#18223b;border-color:#bdc9e8}:root[data-theme="light"] .modal-head{border-color:#dfe5f1}:root[data-theme="light"] .close{background:#eef1f8;color:#43506a}
    :root[data-theme="light"] .view-slider{background:#e8edf8;border-color:#bdc9e4}:root[data-theme="light"] .view-slider i{z-index:0;background:linear-gradient(135deg,#4354bf,#6f80ed);box-shadow:0 3px 8px rgba(55,72,161,.32)}:root[data-theme="light"] .view-slider button{position:relative;z-index:1;color:#41506e}:root[data-theme="light"] .view-slider button.active{color:#fff;text-shadow:0 1px 1px rgba(0,0,0,.18)}
  `;
  document.head.append(style);
  apply();
})();
