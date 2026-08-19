(() => {
  const statusDefinitions = [
    ['待面试', 'pending'], ['等待反馈', 'waiting'], ['获得offer', 'offer'], ['未通过', 'failed'],
  ];

  const isPhone = () => window.matchMedia('(max-width: 680px)').matches;
  let currentView = 'records';
  let detailPage;
  let detailBody;

  const createShell = () => {
    const main = document.querySelector('main');
    const header = document.querySelector('main .top');
    if (!main || !header || document.querySelector('.mobile-status-overview')) return;

    const summary = document.createElement('section');
    summary.className = 'mobile-status-overview';
    summary.innerHTML = '<div class="mobile-section-heading"><div><span>INTERVIEW OVERVIEW</span><h2>我的面试进度</h2></div><p>点击状态查看对应记录</p></div><div class="mobile-status-grid"></div>';
    header.after(summary);

    const themeCycle = document.createElement('button');
    themeCycle.className = 'mobile-theme-cycle';
    themeCycle.type = 'button';
    themeCycle.setAttribute('aria-label', '切换显示模式');
    const syncThemeLabel = () => {
      const active = document.querySelector('.theme-selector [data-theme-option].active')?.dataset.themeOption || 'system';
      themeCycle.textContent = ({ system: '系统', light: '明亮', dark: '夜间' })[active];
    };
    themeCycle.onclick = () => {
      const keys = ['system', 'light', 'dark'];
      const active = document.querySelector('.theme-selector [data-theme-option].active')?.dataset.themeOption || 'system';
      const next = keys[(keys.indexOf(active) + 1) % keys.length];
      document.querySelector(`.theme-selector [data-theme-option="${next}"]`)?.click();
      syncThemeLabel();
    };
    header.append(themeCycle);
    syncThemeLabel();

    const switcher = document.createElement('nav');
    switcher.className = 'mobile-view-switch';
    switcher.setAttribute('aria-label', '工作台视图');
    switcher.innerHTML = '<button type="button" data-mobile-view="calendar">面试日程</button><button type="button" data-mobile-view="records">面试记录</button>';
    summary.after(switcher);
    switcher.querySelectorAll('button').forEach((button) => button.onclick = () => setView(button.dataset.mobileView));

    detailPage = document.createElement('section');
    detailPage.className = 'mobile-detail-page';
    detailPage.setAttribute('aria-label', '公司面试详情');
    detailPage.innerHTML = '<header class="mobile-detail-header"><button type="button" class="mobile-back" aria-label="返回">‹</button><div><span>INTERVIEW DETAIL</span><strong>面试详情</strong></div></header><div class="mobile-detail-body"></div>';
    detailBody = detailPage.querySelector('.mobile-detail-body');
    detailPage.querySelector('.mobile-back').onclick = closeDetail;
    document.body.append(detailPage);
    setView('records');
  };

  const setView = (view) => {
    currentView = view;
    document.body.dataset.mobileView = view;
    document.querySelectorAll('.mobile-view-switch button').forEach((button) => button.classList.toggle('active', button.dataset.mobileView === view));
  };

  const renderSummary = () => {
    const grid = document.querySelector('.mobile-status-grid');
    if (!grid) return;
    grid.innerHTML = statusDefinitions.map(([name, className]) => {
      const total = records.filter((record) => record.status === name).length;
      return `<button type="button" class="mobile-status-card ${className}" data-mobile-status="${name}"><i></i><span>${name}</span><strong>${total}</strong></button>`;
    }).join('');
    grid.querySelectorAll('[data-mobile-status]').forEach((button) => {
      button.onclick = () => {
        const record = records.find((item) => item.status === button.dataset.mobileStatus);
        if (!record) return toast(`暂无“${button.dataset.mobileStatus}”的记录`);
        selected = record;
        setView('records');
        draw();
      };
    });
  };

  const openDetail = () => {
    if (!isPhone() || !selected || !detailBody) return;
    const detail = document.querySelector('#detail');
    if (!detail) return;
    detailBody.append(detail);
    document.body.classList.add('mobile-detail-open');
    detailPage.scrollTop = 0;
  };

  const closeDetail = () => {
    const detail = document.querySelector('#detail');
    const app = document.querySelector('.app');
    if (detail && app) app.append(detail);
    document.body.classList.remove('mobile-detail-open');
  };

  const baseDraw = window.draw;
  window.draw = () => {
    baseDraw();
    renderSummary();
  };

  const style = document.createElement('style');
  style.textContent = `
    .mobile-status-overview,.mobile-view-switch,.mobile-detail-page,.mobile-theme-cycle{display:none}
    @media (max-width:680px){
      body{min-width:0;background:radial-gradient(circle at 86% -8%,#847bff32,transparent 35%),var(--bg)}
      .app{display:flex!important;flex-direction:column;gap:14px;padding:14px;padding-bottom:calc(26px + env(safe-area-inset-bottom))}
      .card{border-radius:18px;box-shadow:0 9px 28px #0003}

      /* The desktop rail never appears on phones. */
      .status-sidebar{display:none!important}
      main{order:1;gap:12px}.top{position:relative;padding:2px 2px 0!important;min-height:0!important;align-items:flex-start!important;gap:11px!important;flex-wrap:wrap;background:transparent!important;border:0!important;box-shadow:none!important}.top>div{padding-right:62px}.top .eyebrow{font-size:0!important;line-height:1}.top .eyebrow:after{content:'面试记录仪';font-size:19px;color:var(--txt);letter-spacing:-.45px;font-weight:850}.top h1{display:none!important}.mobile-theme-cycle{position:absolute;right:2px;top:0;min-width:48px;height:31px;padding:0 9px;border:1px solid var(--line);border-radius:10px;background:#131d37;color:var(--muted);font-size:10px;font-weight:750;cursor:pointer}.mobile-theme-cycle:active{transform:scale(.97)}.top .primary#add{width:100%;height:51px;margin:0!important;border-radius:14px!important;font-size:14px!important;box-shadow:0 10px 23px #5265d94a}.backup-controls{order:3;width:100%;display:grid!important;grid-template-columns:1fr 1fr;gap:8px!important}.backup-button{height:37px!important;border-radius:11px!important}

      /* Four statuses are a true page-level overview, not a leftover sidebar. */
      .mobile-status-overview{order:2;display:block;padding:12px;border:1px solid var(--line);border-radius:17px;background:linear-gradient(145deg,#192441ed,#10182ded);box-shadow:0 8px 22px #0003}.mobile-section-heading{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:9px}.mobile-section-heading span{display:none}.mobile-section-heading h2{margin:0;font-size:15px;letter-spacing:-.2px}.mobile-section-heading p{margin:0;color:var(--muted);font-size:9px}.mobile-status-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.mobile-status-card{position:relative;min-height:57px;padding:9px 10px;border:1px solid var(--line);border-radius:12px;background:#0a132a9c;color:var(--txt);text-align:left;cursor:pointer;transition:transform .18s,border-color .18s,background .18s}.mobile-status-card:active{transform:scale(.98)}.mobile-status-card:hover{border-color:#667be1;background:#172446}.mobile-status-card i{display:inline-block;width:6px;height:6px;margin-right:4px;border-radius:50%;background:var(--cyan)}.mobile-status-card span{font-size:10px;color:var(--muted)}.mobile-status-card strong{display:block;margin-top:5px;font-size:18px;line-height:1}.mobile-status-card.pending i{background:var(--orange);box-shadow:0 0 10px #f6a35e88}.mobile-status-card.waiting i{background:#b394ff;box-shadow:0 0 10px #b394ff88}.mobile-status-card.offer i{background:var(--green);box-shadow:0 0 10px #62e3a388}.mobile-status-card.failed i{background:var(--red);box-shadow:0 0 10px #ff6d8888}

      .mobile-view-switch{order:3;display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border:1px solid var(--line);border-radius:13px;background:#0b1530}.mobile-view-switch button{height:39px;border:0;border-radius:9px;background:transparent;color:var(--muted);font-size:12px;font-weight:750;cursor:pointer;transition:.2s}.mobile-view-switch button.active{color:#fff;background:linear-gradient(135deg,#6675ee,#5268da);box-shadow:0 4px 11px #0004}.mobile-view-switch button:active{transform:scale(.98)}

      .calendar-panel{order:4;padding:13px!important;border-radius:18px}.calendar-header{align-items:center!important;flex-wrap:wrap;gap:7px!important}.calendar-heading{width:auto!important;margin-right:auto!important}.calendar-heading .eyebrow{font-size:9px!important}.calendar-heading h2{font-size:18px!important}.calendar-today{height:34px!important;padding:0 10px!important;border-radius:9px!important}.calendar-control{width:34px!important;height:34px!important;border-radius:10px!important}.calendar-weekdays span{padding:8px 2px!important;font-size:8px!important;text-align:center!important}.calendar-day{height:auto!important;min-height:58px!important;padding:3px!important}.calendar-date{height:16px!important;font-size:9px!important}.calendar-day.today .calendar-date span{width:18px!important;height:18px!important}.calendar-event{margin-top:2px!important;padding:3px!important;border-left-width:2px!important;font-size:8px!important}.calendar-legend{justify-content:space-between;gap:0!important;overflow-x:auto;white-space:nowrap;padding-top:2px}
      .list-panel{order:5;padding:14px!important;border-radius:18px}.head{margin-bottom:12px!important}.record{grid-template-columns:36px minmax(0,1fr) auto!important;gap:9px!important;min-height:64px;padding:11px!important;border-radius:13px;border-color:transparent!important;transform:none!important}.record.selected{border-color:transparent!important;transform:none!important;background:#0911269c!important}.record .avatar{width:36px!important;height:36px!important}.record strong{font-size:11px!important}.record span{font-size:9px!important}.record .badge{font-size:9px!important;padding:5px 6px!important}.company-logo{display:none!important}
      body[data-mobile-view="calendar"] .list-panel{display:none!important}body[data-mobile-view="records"] .calendar-panel{display:none!important}

      /* Company information is a separate, full-screen secondary page. */
      .detail{display:none!important}.mobile-detail-page{position:fixed;z-index:50;inset:0;overflow:auto;background:var(--bg);padding:0 14px calc(24px + env(safe-area-inset-bottom));transform:translateX(100%);transition:transform .28s cubic-bezier(.2,.8,.2,1);pointer-events:none}.mobile-detail-open .mobile-detail-page{display:block;transform:translateX(0);pointer-events:auto}.mobile-detail-header{position:sticky;z-index:2;top:0;display:flex;align-items:center;gap:11px;height:68px;background:linear-gradient(to bottom,var(--bg) 80%,transparent)}.mobile-back{display:grid;place-items:center;width:40px;height:40px;border:1px solid var(--line);border-radius:13px;background:#16213d;color:var(--txt);font-size:27px;line-height:1;cursor:pointer}.mobile-detail-header span{display:block;color:var(--cyan);font-size:9px;font-weight:800;letter-spacing:1px}.mobile-detail-header strong{display:block;margin-top:3px;font-size:15px}.mobile-detail-body>.detail{display:block!important;max-height:none!important;padding:18px!important;border-radius:18px!important}.detail h2{font-size:21px!important;margin-top:13px!important}.detail .meta{grid-template-columns:1fr!important;gap:8px!important;margin:16px 0!important}.detail .links{gap:15px!important}.qa-card{border-radius:13px!important}.qa-card-top{padding:10px 12px!important}.qa-question{font-size:12px!important}.qa-answer{font-size:11px!important}

      dialog{width:calc(100vw - 20px);max-height:calc(100dvh - 20px);border-radius:18px}.modal-head{padding:17px!important}.modal-head h2{font-size:16px!important}form{display:flex!important;flex-direction:column;gap:12px!important;padding:17px!important}.field{gap:6px}.lookup{flex-direction:column;gap:8px}.lookup .button{width:100%;min-height:44px}.actions{display:grid!important;grid-template-columns:1fr 1fr;gap:9px!important;margin-top:5px}.actions .button,.actions .cancel{min-height:44px}.actions .cancel{border:1px solid var(--line);border-radius:11px}.qa-field textarea{min-height:180px!important}.import-row{flex-wrap:wrap}.toast{width:calc(100vw - 32px);text-align:center}.empty-state{min-height:230px!important;padding:24px 16px!important}.empty-state h3{font-size:16px!important}
      :root[data-theme="light"] .mobile-theme-cycle{background:#fff;color:#53617d;border-color:#d5deee}:root[data-theme="light"] .mobile-status-overview{background:linear-gradient(145deg,#fff,#f7f9ff);box-shadow:0 9px 24px rgba(41,58,96,.08)}:root[data-theme="light"] .mobile-status-card{background:#f8faff;color:#1b2740;border-color:#dbe3f1}:root[data-theme="light"] .mobile-status-card span{color:#65728a}:root[data-theme="light"] .mobile-view-switch{background:#eaf0fb;border-color:#ced8eb}:root[data-theme="light"] .mobile-view-switch button{color:#566580}:root[data-theme="light"] .mobile-view-switch button.active{color:#fff;background:linear-gradient(135deg,#4b5dca,#6c7dec)}:root[data-theme="light"] .mobile-detail-page{background:var(--bg)}:root[data-theme="light"] .mobile-back{background:#fff;color:#25314a;border-color:#d5deee}
    }
    @media (max-width:370px){.mobile-status-card{min-height:67px!important;padding:10px!important}.mobile-status-card strong{font-size:20px!important}.calendar-day{height:auto!important;min-height:53px!important}.calendar-event{font-size:7px!important}.calendar-legend{font-size:8px!important}}
  `;
  document.head.append(style);
  createShell();
  renderSummary();
  document.addEventListener('click', (event) => {
    if (!isPhone()) return;
    if (event.target.closest('.record, .calendar-event')) setTimeout(openDetail, 0);
  });
})();
