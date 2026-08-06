(() => {
  const form = document.querySelector('#recordForm');
  if (!form || form.elements.workSchedule) return;
  const actions = form.querySelector('.actions');
  const field = document.createElement('div');
  field.className = 'field';
  field.innerHTML = '<label>工作制度（可选）</label><select name="workSchedule"><option value="">暂不填写</option><option value="双休">双休</option><option value="单休">单休</option><option value="大小周">大小周</option><option value="不固定">不固定</option></select>';
  actions.before(field);

  const baseDraw = draw;
  draw = () => {
    baseDraw();
    const meta = document.querySelector('#detail .meta');
    if (!meta || meta.querySelector('.work-schedule-meta')) return;
    const item = document.createElement('div');
    item.className = 'work-schedule-meta';
    item.innerHTML = `工作制度<b>${esc(selected?.workSchedule || '待补充')}</b>`;
    meta.append(item);
  };
  draw();
})();
