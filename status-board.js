(() => {
  const intro = document.querySelector('.intro');
  const sidebar = document.querySelector('aside');
  if (!intro || !sidebar) return;

  const labels = [
    ['待面试', 'pending', 'n-pending'],
    ['等待反馈', 'waiting', 'n-waiting'],
    ['获得offer', 'offer', 'n-offer'],
    ['未通过', 'failed', 'n-failed'],
  ];
  sidebar.className = 'card status-sidebar';
  sidebar.innerHTML = `<div class="brand">面试记录仪<small>INTERVIEW ATLAS</small></div><div class="sidebar-kicker">面试状态</div><div class="sidebar-status" id="statusBoard"></div><div class="sidebar-foot"><span>按状态筛选你的面试记录</span></div>`;
  intro.innerHTML = `<div class="status-board-title"><div><div class="eyebrow">INTERVIEW WORKSPACE</div><h2>面试进度总览</h2></div><p>在日历与记录中管理每一次面试</p></div>`;

  const style = document.createElement('style');
  style.textContent = `
    .status-sidebar{position:sticky;top:18px;display:flex;flex-direction:column;min-height:calc(100vh - 36px);padding:18px 12px!important}.status-sidebar .brand{padding:3px 7px 19px;font-size:17px}.status-sidebar .brand small{margin-top:5px;font-size:8px;letter-spacing:.16em}.sidebar-kicker{padding:14px 7px 9px;border-top:1px solid var(--line);color:var(--muted);font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.sidebar-status{display:grid;gap:6px}.status-card{display:grid;grid-template-columns:8px minmax(0,1fr) auto;align-items:center;width:100%;min-height:45px;padding:9px 8px;border:1px solid transparent;border-radius:10px;background:transparent;color:#dbe4fa;text-align:left;cursor:pointer;transition:background .18s,border-color .18s,transform .18s}.status-card:hover{background:#172442;border-color:var(--line);transform:translateX(2px)}.status-card .dot{width:7px;height:7px;border-radius:50%;display:block}.status-card .name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#aab8d7;font-size:10px;font-weight:700}.status-card strong{font-size:17px;line-height:1;color:#f0f4ff}.status-card small{display:none}.status-card.pending .dot{background:var(--orange);box-shadow:0 0 10px var(--orange)}.status-card.waiting .dot{background:#b394ff;box-shadow:0 0 10px #b394ff}.status-card.offer .dot{background:var(--green);box-shadow:0 0 10px var(--green)}.status-card.failed .dot{background:var(--red);box-shadow:0 0 10px var(--red)}.sidebar-foot{margin-top:auto;padding:14px 7px 4px;color:var(--muted);font-size:9px;line-height:1.55}
    .status-board-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.status-board-title h2{margin:6px 0 0;font-size:20px}.status-board-title p{margin:0;color:var(--muted);font-size:10px}.intro{padding:20px!important}
    :root[data-theme="light"] .status-card{color:#1d2943}:root[data-theme="light"] .status-card .name{color:#5e6c86}:root[data-theme="light"] .status-card:hover{background:#edf1ff;border-color:#cbd5eb}:root[data-theme="light"] .status-card strong{color:#25324f}
  `;
  document.head.append(style);

  const renderBoard = () => {
    const board = document.querySelector('#statusBoard');
    if (!board) return;
    board.innerHTML = labels.map(([name, className, countId]) => {
      const total = records.filter((record) => record.status === name).length;
      return `<button class="status-card ${className}" data-status="${name}"><i class="dot"></i><span class="name">${name}</span><strong id="${countId}">${total}</strong></button>`;
    }).join('');
    board.querySelectorAll('.status-card').forEach((button) => {
      button.onclick = () => {
        const match = records.find((record) => record.status === button.dataset.status);
        if (match) { selected = match; draw(); }
        else if (typeof toast === 'function') toast(`暂无“${button.dataset.status}”的记录`);
      };
    });
  };
  const baseDraw = draw;
  draw = () => { baseDraw(); renderBoard(); };
  renderBoard();
})();
