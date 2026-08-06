(() => {
  const confirmDialog = document.createElement('dialog');
  confirmDialog.className = 'delete-dialog';
  confirmDialog.innerHTML = `
    <div class="delete-confirmation">
      <div class="delete-icon">!</div>
      <div class="eyebrow">DELETE INTERVIEW RECORD</div>
      <h2>确认删除这条记录？</h2>
      <p id="deleteDescription">删除后将无法恢复。</p>
      <div class="delete-actions">
        <button class="button secondary" type="button" data-delete-cancel>取消</button>
        <button class="button danger-button" type="button" data-delete-confirm>确认删除</button>
      </div>
    </div>`;
  document.body.append(confirmDialog);
  const deleteStyle = document.createElement('style');
  deleteStyle.textContent = `
    .delete-dialog{width:min(420px,calc(100vw - 40px));border-color:#87405a;background:#141b33}
    .delete-confirmation{padding:28px}.delete-icon{display:grid;place-items:center;width:36px;height:36px;border-radius:12px;background:#ff6d8820;color:#ff91a7;font-weight:800;margin-bottom:18px}
    .delete-confirmation h2{font-size:20px;margin:8px 0}.delete-confirmation p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}.delete-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:25px}.danger-button{background:#d95672}.danger-button:hover{background:#ef6684}
  `;
  document.head.append(deleteStyle);

  let pendingDelete = null;
  const showDeleteConfirm = () => {
    if (!selected) return;
    pendingDelete = selected.id;
    confirmDialog.querySelector('#deleteDescription').textContent = `“${selected.company} · ${selected.role}”将从面试记录中移除，且无法恢复。`;
    confirmDialog.showModal();
  };
  confirmDialog.querySelector('[data-delete-cancel]').onclick = () => { pendingDelete = null; confirmDialog.close(); };
  confirmDialog.querySelector('[data-delete-confirm]').onclick = () => {
    if (!pendingDelete) return confirmDialog.close();
    records = records.filter((record) => record.id !== pendingDelete);
    selected = records[0] || null;
    pendingDelete = null;
    save();
    confirmDialog.close();
    if (selected) draw();
    else {
      document.querySelector('#records').innerHTML = '';
      document.querySelector('#detail').innerHTML = '<div class="eyebrow">COMPANY INFO</div><h2>暂无面试记录</h2><div class="role">点击“新增面试记录”开始记录。</div>';
      document.querySelector('#count').textContent = '共 0 条';
      Object.values(map).forEach((className) => { const item = document.querySelector(`#n-${className}`); if (item) item.textContent = '0'; });
      const board = document.querySelector('#statusBoard');
      if (board) board.querySelectorAll('strong').forEach((item) => { item.textContent = '0'; });
    }
    toast('记录已删除');
  };

  document.addEventListener('click', (event) => {
    const recordCard = event.target.closest('#records .record');
    if (recordCard) {
      const next = records.find((record) => record.id === recordCard.dataset.id);
      if (next) {
        selected = next;
        draw();
      }
      return;
    }

    const remove = event.target.closest('#detail #remove');
    if (remove) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showDeleteConfirm();
    }
  }, true);
})();
