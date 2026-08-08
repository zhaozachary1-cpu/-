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
    fields.forEach(([name]) => {
      if (form.elements[name]) return;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.append(input);
    });
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
