document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[type="datetime-local"]').forEach((input) => {
    const openPicker = () => {
      if (typeof input.showPicker === 'function') {
        try { input.showPicker(); } catch (_) { /* Already open or unsupported. */ }
      }
    };
    input.addEventListener('click', openPicker);
    input.addEventListener('focus', openPicker);
  });
});
