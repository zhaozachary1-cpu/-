(() => {
  const style = document.createElement('style');
  style.textContent = `
    /* 三栏桌面工作台：状态导航 / 主工作区 / 公司详情。 */
    .app{max-width:1640px;grid-template-columns:190px minmax(0,1fr) minmax(310px,24%)!important;gap:18px;align-items:start}.app main,.app .detail{min-width:0}.top{padding:24px!important}.top h1{font-size:24px!important}.top .primary#add{min-width:168px;height:52px;padding:0 20px;border-radius:14px;font-size:14px;box-shadow:0 10px 24px #5265d955}.intro{min-height:116px}.list-panel{padding:18px}.record{grid-template-columns:37px minmax(0,1fr) auto;padding:12px}.record strong,.record span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.detail{position:sticky;top:18px;max-height:calc(100vh - 36px);overflow:auto;padding:20px!important}.detail h2{font-size:21px}.detail .meta{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px}.detail .meta div{padding:11px;min-width:0}.detail .meta b{overflow-wrap:anywhere}.qa-list{grid-template-columns:1fr!important}.qa-card{height:auto}.qa-question{font-size:11px}.qa-answer{font-size:10px}.links{display:flex;flex-wrap:wrap;gap:7px}.links .link{font-size:10px}.theme-selector{width:100%;height:37px;margin-top:12px}.theme-selector button{flex:1;height:29px;padding:0 4px}.status-sidebar .theme-selector{margin-top:10px}.top .theme-selector{display:none!important}
    :root[data-theme="light"] .top .primary#add{box-shadow:0 10px 22px rgba(70,89,196,.25)}
    @media(min-width:681px){.top{display:none!important}.app.company-detail-collapsed{grid-template-columns:190px minmax(0,1fr)!important}.app.company-detail-collapsed .detail{display:none!important}.app:not(.company-detail-collapsed) .calendar-event{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}.sidebar-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:15px 7px 0;border-top:1px solid var(--line);margin-top:auto}.status-sidebar .sidebar-foot{margin-top:0}.sidebar-actions #add{grid-column:1/-1;min-height:46px;width:100%;padding:0 10px;border-radius:12px;font-size:12px;box-shadow:0 8px 18px #5265d944}.sidebar-actions .backup-controls{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:7px}.sidebar-actions .backup-button{height:34px;width:100%;padding:0 5px;font-size:9px}.detail-fold{position:absolute;top:13px;right:13px;z-index:2;height:30px;padding:0 10px;border:1px solid var(--line);border-radius:9px;background:#ffffff0b;color:var(--muted);font-size:10px;font-weight:700;cursor:pointer;transition:transform .16s,background .16s}.detail-fold:hover{background:#ffffff1b;color:var(--txt);transform:translateY(-1px)}}
    @media(max-width:1150px){.app{grid-template-columns:168px minmax(0,1fr) minmax(280px,30%)!important;gap:12px}.app.company-detail-collapsed{grid-template-columns:168px minmax(0,1fr)!important}.top{flex-wrap:wrap}.top .primary#add{margin-left:auto}.status-sidebar{padding:14px 9px!important}.detail{padding:16px!important}.record{padding:10px}.record .avatar{width:32px;height:32px}}
    @media(max-width:900px){.app{grid-template-columns:150px minmax(0,1fr)!important}.detail{grid-column:2;position:static;max-height:none}.status-sidebar{grid-row:span 2}.top h1{font-size:20px!important}}
    @media(max-width:680px){.app{grid-template-columns:1fr!important}.status-sidebar,.detail{position:static;grid-column:auto;min-height:auto}.status-sidebar{display:block}.sidebar-status{grid-template-columns:repeat(2,minmax(0,1fr))}.sidebar-foot{display:none}.detail{max-height:none}.top .primary#add{width:100%}}
  `;
  document.head.append(style);
  const sidebar = document.querySelector('.status-sidebar');
  const selector = document.querySelector('.theme-selector');
  if (sidebar && selector) sidebar.append(selector);

  if (!window.matchMedia('(min-width:681px)').matches) return;
  const add = document.querySelector('#add');
  const backupControls = document.querySelector('.backup-controls');
  const footer = sidebar?.querySelector('.sidebar-foot');
  if (sidebar && footer && add) {
    const actions = document.createElement('div');
    actions.className = 'sidebar-actions';
    actions.append(add);
    if (backupControls) actions.append(backupControls);
    sidebar.insertBefore(actions, footer);
  }
  const app = document.querySelector('.app');
  if (!app) return;
  app.classList.add('company-detail-collapsed');

  const baseDraw = draw;
  draw = () => {
    baseDraw();
    const detail = document.querySelector('#detail');
    if (!detail || detail.querySelector('.detail-fold')) return;
    const fold = document.createElement('button');
    fold.type = 'button';
    fold.className = 'detail-fold';
    fold.textContent = '收起公司信息';
    fold.onclick = () => app.classList.add('company-detail-collapsed');
    detail.prepend(fold);
  };
  document.addEventListener('click', (event) => {
    if (event.target.closest('.record, [data-record-id]')) app.classList.remove('company-detail-collapsed');
  });
  draw();
})();
