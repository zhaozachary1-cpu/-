(() => {
  const form = document.querySelector('#recordForm');
  const button = document.querySelector('#lookup');
  if (!form || !button) return;
  const hidden = document.createElement('input');
  hidden.type = 'hidden'; hidden.name = 'logoUrl';
  form.append(hidden);
  button.addEventListener('click', async (event) => {
    event.preventDefault(); event.stopImmediatePropagation();
    const name = form.elements.company.value.trim();
    const status = document.querySelector('#lookupStatus');
    if (!name) return toast('请先输入公司名称');
    status.textContent = '正在查询企查查公司信息…';
    try {
      const response = await fetch(`/api/company?name=${encodeURIComponent(name)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      form.elements.company.value = data.name || name;
      form.elements.location.value = data.address || '';
      form.elements.industry.value = data.industry || '';
      form.elements.product.value = data.product || '';
      form.elements.foundedAt && (form.elements.foundedAt.value = data.foundedAt || '');
      form.elements.companyScale && (form.elements.companyScale.value = data.companyScale || '');
      form.elements.employeeCount && (form.elements.employeeCount.value = data.employeeCount || '');
      form.elements.revenue && (form.elements.revenue.value = data.revenue || '');
      form.elements.listingStatus && (form.elements.listingStatus.value = data.listingStatus || '');
      form.elements.financingStatus && (form.elements.financingStatus.value = data.financingStatus || '');
      hidden.value = data.logoUrl || '';
      status.textContent = '查询成功：已回填公司信息与企业画像数据。';
    } catch (error) { status.textContent = error.message || '查询失败，请稍后重试。'; }
  }, true);
})();
