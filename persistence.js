(() => {
  const localSave = save;
  const databaseName = 'interview-atlas-local';
  const storeName = 'app-state';
  // The first public prototype shipped with two demo interviews. Remove only
  // those exact legacy fixtures; user-created records are never touched.
  const isLegacyDemo = (record) => (
    (record?.id === '1' && record.company === '小红书' && record.role === '增长产品经理')
    || (record?.id === '2' && record.company === '字节跳动' && record.role === '用户产品经理')
  );
  const removeLegacyDemos = () => {
    const next = records.filter((record) => !isLegacyDemo(record));
    const changed = next.length !== records.length;
    if (changed) {
      records = next;
      selected = records.find((record) => record.id === selected?.id) || records[0] || null;
    }
    return changed;
  };

  const openDatabase = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const write = async () => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(storeName, 'readwrite');
      transaction.objectStore(storeName).put(records, 'records');
      transaction.oncomplete = () => db.close();
    } catch (_) { /* localStorage remains a compatible local fallback */ }
  };
  const read = async () => {
    try {
      const db = await openDatabase();
      const request = db.transaction(storeName, 'readonly').objectStore(storeName).get('records');
      request.onsuccess = () => {
        if (Array.isArray(request.result) && request.result.length) {
          records = request.result;
          const removed = removeLegacyDemos();
          selected = records.find((record) => record.id === selected?.id) || records[0] || null;
          localSave();
          if (removed) write();
        } else {
          write();
        }
        db.close();
        draw();
      };
    } catch (_) { draw(); }
  };
  save = () => { localSave(); write(); };
  if (removeLegacyDemos()) save();
  read();
})();
