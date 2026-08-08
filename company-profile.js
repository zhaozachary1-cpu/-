(() => {
  const form = document.querySelector('#recordForm');
  const fields = [
    ['foundedAt', '成立日期'],
    ['companyScale', '企业规模'],
    ['employeeCount', '员工人数（参保）'],
    ['revenue', '营业收入'],
    ['listingStatus', '上市状态'],
    ['financingStatus', '融资状态'],
  ];
  if (form) {
    const actions = form.querySelector('.actions');
    const profile = document.createElement('section');
    profile.className = 'company-profile-fields full';
    profile.innerHTML = `<div class="company-profile-heading"><div><span>QCC COMPANY PROFILE</span><strong>企查查企业画像</strong></div><em>查询后可手动编辑</em></div><div class="company-profile-grid">${fields.map(([name, label]) => `<label>${label}<input name="${name}" placeholder="查询后自动填充"></label>`).join('')}</div>`;
    actions.before(profile);

    const style = document.createElement('style');
    style.textContent = `
      .company-profile-fields{padding:14px;border:1px solid #48618e;border-radius:13px;background:#0c1730}.company-profile-heading{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:11px}.company-profile-heading span{display:block;color:var(--cyan);font-size:9px;font-weight:800;letter-spacing:1px}.company-profile-heading strong{display:block;margin-top:3px;font-size:13px}.company-profile-heading em{color:var(--muted);font-size:9px;font-style:normal}.company-profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.company-profile-grid label{gap:5px}.company-profile-grid input{height:38px;padding:8px 9px;font-size:11px;color:#dbe5ff;background:#101d38}.company-profile-grid input::placeholder{color:#7181a3}
      :root[data-theme="light"] .company-profile-fields{background:#f4f7ff;border-color:#cbd6ee}:root[data-theme="light"] .company-profile-grid input{background:#fff;color:#293650;border-color:#d5deed}
      @media(max-width:680px){.company-profile-fields{padding:12px}.company-profile-grid{grid-template-columns:1fr 1fr;gap:8px}.company-profile-grid input{height:37px;font-size:10px}.company-profile-heading strong{font-size:12px}}
    `;
    document.head.append(style);
  }

  const baseDraw = draw;
  draw = () => {
    baseDraw();
    if (!selected) return;
    const meta = document.querySelector('#detail .meta');
    if (!meta || meta.querySelector('.company-profile-meta')) return;
    fields.forEach(([name, label]) => {
      const item = document.createElement('div');
      item.className = 'company-profile-meta';
      item.innerHTML = `${label}<b>${esc(selected[name] || '暂无公开数据')}</b>`;
      meta.append(item);
    });
  };
  draw();
})();
