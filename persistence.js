(() => {
  const localSave = save;
  const databaseName = 'interview-atlas-local';
  const storeName = 'app-state';

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
          selected = records.find((record) => record.id === selected?.id) || records[0];
          localSave();
        } else {
          write();
        }
        db.close();
        draw();
      };
    } catch (_) { draw(); }
  };
  save = () => { localSave(); write(); };
  read();
})();
