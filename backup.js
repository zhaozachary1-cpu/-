(() => {
  const add = document.querySelector('#add');
  if (!add) return;
  const controls = document.createElement('div');
  controls.className = 'backup-controls';
  controls.innerHTML = '<button type="button" class="backup-button" data-export>导出备份</button><button type="button" class="backup-button" data-import>导入恢复</button><input type="file" accept="application/json,.json" hidden data-import-file>';
  add.before(controls);
  const fileInput = controls.querySelector('[data-import-file]');
  controls.querySelector('[data-export]').onclick = () => {
    const payload = { version: 1, exportedAt: new Date().toISOString(), records };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `面试记录备份-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast('备份文件已导出，请妥善保存。');
  };
  controls.querySelector('[data-import]').onclick = () => fileInput.click();
  fileInput.onchange = async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const next = Array.isArray(data) ? data : data.records;
      if (!Array.isArray(next)) throw new Error('invalid');
      if (!confirm(`将导入 ${next.length} 条记录，并替换当前本机记录。是否继续？`)) return;
      records = next;
      selected = records[0] || null;
      save();
      if (selected) draw();
      else location.reload();
      toast('备份已恢复到当前电脑。');
    } catch (_) {
      toast('导入失败：请选择由面试记录仪导出的 JSON 备份文件。');
    } finally { fileInput.value = ''; }
  };
  const style = document.createElement('style');
  style.textContent = '.backup-controls{display:flex;gap:6px}.backup-button{height:34px;padding:0 9px;border:1px solid var(--line);border-radius:9px;background:#ffffff0b;color:#aebcdb;font-size:10px;font-weight:700;cursor:pointer;transition:.18s}.backup-button:hover{background:#ffffff18;color:#fff;transform:translateY(-1px)}:root[data-theme="light"] .backup-button{background:#fff;color:#52617e;border-color:#cbd5ea}:root[data-theme="light"] .backup-button:hover{background:#edf1fb;color:#263454}';
  document.head.append(style);
})();
