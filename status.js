document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#recordForm');
  if (!form) return;
  const date = form.elements.date;
  const status = form.elements.status;
  const label = status.closest('.field');
  const hint = document.createElement('div');
  hint.className = 'query-status';
  label.append(hint);

  const update = () => {
    if (!date.value || ['获得offer', '未通过'].includes(status.value)) {
      hint.textContent = ['获得offer', '未通过'].includes(status.value)
        ? '该状态由你手动维护，不会因时间自动改变。'
        : '选择面试日期时间后，系统将自动判断状态。';
      return;
    }
    const next = new Date(date.value).getTime() > Date.now() ? '待面试' : '等待反馈';
    status.value = next;
    hint.textContent = next === '待面试'
      ? '面试时间尚未到，已自动设为“待面试”。'
      : '面试时间已过，已自动设为“等待反馈”。';
  };

  date.addEventListener('change', update);
  status.addEventListener('change', update);
  form.addEventListener('reset', () => setTimeout(update));
  update();

  const syncSavedStatuses = () => {
    let changed = false;
    records.forEach((record) => {
      if (['获得offer', '未通过'].includes(record.status) || !record.date) return;
      const next = new Date(record.date).getTime() > Date.now() ? '待面试' : '等待反馈';
      if (record.status !== next) {
        record.status = next;
        changed = true;
      }
    });
    if (changed) {
      save();
      draw();
    }
  };

  syncSavedStatuses();
  setInterval(syncSavedStatuses, 60 * 1000);
});
