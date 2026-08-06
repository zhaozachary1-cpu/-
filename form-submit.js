(() => {
  const form = document.querySelector('#recordForm');
  const dialog = document.querySelector('#recordDialog');
  if (!form || !dialog) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const data = Object.fromEntries(new FormData(form));

    if (editing) {
      records = records.map((record) => record.id === editing
        ? { ...record, ...data }
        : record);
      selected = records.find((record) => record.id === editing);
    } else {
      selected = { ...data, id: Date.now().toString(), notes: '', qa: [], qaText: '' };
      records.unshift(selected);
    }

    save();
    draw();
    form.reset();
    editing = null;
    dialog.close();
    toast('面试记录已保存');
  }, true);
})();
