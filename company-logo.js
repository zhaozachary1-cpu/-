(() => {
  const previousDraw = window.draw;
  if (typeof previousDraw !== 'function') return;
  window.draw = function drawWithCompanyLogo() {
    previousDraw();
    document.querySelectorAll('.record').forEach((card) => {
      const record = records.find((item) => item.id === card.dataset.id);
      if (!record?.logoUrl || card.querySelector('.company-logo')) return;
      const image = document.createElement('img');
      image.className = 'company-logo';
      image.src = record.logoUrl;
      image.alt = `${record.company} Logo`;
      image.referrerPolicy = 'no-referrer';
      image.onerror = () => image.remove();
      card.append(image);
    });
  };
  const style = document.createElement('style');
  style.textContent = '.record{grid-template-columns:36px minmax(0,1fr) auto 32px}.company-logo{width:28px;height:28px;object-fit:contain;border-radius:8px;background:#fff;padding:3px;border:1px solid rgba(255,255,255,.12)}';
  document.head.append(style);
  window.draw();
})();
