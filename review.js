(() => {
  const style = document.createElement('style');
  style.textContent = `
    .qa-field textarea{min-height:230px}.qa-hint{font-size:10px;color:var(--muted);line-height:1.6;margin:7px 0 0}.import-row{display:flex;align-items:center;gap:8px;margin-bottom:9px}.import-file{height:30px;padding:0 11px;border:1px solid #5971c2;border-radius:8px;background:#5165d91a;color:#cbd8ff;font-size:10px;font-weight:750;cursor:pointer;transition:.18s}.import-file:hover{background:#5165d942;transform:translateY(-1px)}.import-row span{font-size:9px;color:var(--muted)}.import-row.loading .import-file{opacity:.6;pointer-events:none}
    .qa-section{margin-top:24px}.qa-section .section{margin-bottom:0}.qa-list{display:grid;grid-template-columns:1fr;gap:10px;margin-top:11px}.qa-card{overflow:hidden;border:1px solid var(--line);border-radius:14px;background:linear-gradient(145deg,#0e1833,#091227);box-shadow:0 8px 18px #0207172e}.qa-card-top{display:flex;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid var(--line);background:#1623428c}.qa-index{display:inline-flex;align-items:center;justify-content:center;width:32px;height:19px;border-radius:6px;background:#31d6db18;color:var(--cyan);font-size:9px;font-weight:800;letter-spacing:.06em}.qa-label{color:#aebddb;font-size:10px;font-weight:750}.qa-question{padding:11px 13px 13px;color:#e5ecff;font-size:12px;font-weight:720;line-height:1.7}.qa-answer{padding:12px 13px 14px;border-top:1px dashed #334162;color:#b8c5e1;font-size:11px;line-height:1.75}.qa-answer b{display:block;margin-bottom:5px;color:#8fa3ca;font-size:9px;letter-spacing:.08em}.qa-empty{margin-top:11px}.qa-upload-link{margin-top:10px}
    :root[data-theme="light"] .import-file{background:#e7ecff;color:#4052be;border-color:#b8c5ee}:root[data-theme="light"] .import-file:hover{background:#dce4ff}:root[data-theme="light"] .qa-card{background:linear-gradient(145deg,#fff,#f7f9ff);box-shadow:0 8px 18px rgba(40,59,104,.07)}:root[data-theme="light"] .qa-card-top{background:#edf2ff}:root[data-theme="light"] .qa-label{color:#586783}:root[data-theme="light"] .qa-question{color:#1d2943}:root[data-theme="light"] .qa-answer{border-color:#d7deee;color:#5e6c86}:root[data-theme="light"] .qa-answer b{color:#596bc2}
  `;
  document.head.append(style);

  const dialog = document.querySelector('#summaryDialog');
  const form = document.querySelector('#summaryForm');
  const actions = form.querySelector('.actions');
  const notesField = form.elements.notes?.closest('.field');
  notesField?.remove();
  dialog.querySelector('.eyebrow').textContent = 'INTERVIEW Q&A';
  dialog.querySelector('h2').textContent = '上传面试问题与回答';
  actions.querySelector('.primary').textContent = '保存问答';

  const importRow = `<div class="import-row"><button class="import-file" type="button" data-import-target="qaText">导入问答文件</button><input type="file" accept=".md,.markdown,.txt,.pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown,text/plain" hidden data-import-file="qaText"><span>支持 Markdown · PDF · Word</span></div>`;
  const field = document.createElement('div');
  field.className = 'field full qa-field';
  field.innerHTML = `${importRow}<label>面试问题与我的回答 *</label><textarea required name="qaText" placeholder="支持粘贴或导入。建议使用：&#10;问题：请介绍一次你负责的增长项目&#10;回答：我先通过数据定位流失环节，再设计 A/B 实验……"></textarea><p class="qa-hint">每组“问题：… 回答：…”会自动整理为一张复盘卡片；也识别 Q: / A: 格式。</p>`;
  form.insertBefore(field, actions);

  const parserScripts = {};
  const loadScript = (name, src) => parserScripts[name] ||= new Promise((resolve, reject) => {
    const script = document.createElement('script'); script.src = src; script.onload = resolve; script.onerror = reject; document.head.append(script);
  });
  const extractText = async (file) => {
    const name = file.name.toLowerCase();
    if (/\.(md|markdown|txt)$/.test(name)) return file.text();
    if (/\.doc$/.test(name)) throw new Error('旧版 .doc 请先另存为 .docx 后再导入');
    if (/\.docx$/.test(name)) {
      await loadScript('mammoth', 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js');
      return (await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
    }
    if (/\.pdf$/.test(name)) {
      await loadScript('pdfjs', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const pages = await Promise.all(Array.from({ length: pdf.numPages }, async (_, index) => {
        const content = await (await pdf.getPage(index + 1)).getTextContent();
        return content.items.map((item) => item.str).join(' ');
      }));
      return pages.join('\n\n');
    }
    throw new Error('请选择 Markdown、PDF 或 Word .docx 文件');
  };
  field.querySelector('[data-import-target]').onclick = () => field.querySelector('[data-import-file]').click();
  field.querySelector('[data-import-file]').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      event.target.closest('.import-row').classList.add('loading');
      form.elements.qaText.value = await extractText(file);
      toast(`已导入「${file.name}」`);
    } catch (error) { toast(error.message || '文件导入失败，请重试。'); }
    finally { event.target.value = ''; event.target.closest('.import-row').classList.remove('loading'); }
  });

  const parseQA = (text) => {
    const source = String(text || '').trim();
    if (!source) return [];
    const blocks = source.split(/(?=(?:问题|Q)\s*[：:])/i).filter(Boolean);
    return blocks.map((block) => {
      const question = (block.match(/^(?:问题|Q)\s*[：:]\s*([\s\S]*?)(?=(?:回答|A)\s*[：:]|$)/i)?.[1] || '').trim();
      const answer = (block.match(/(?:回答|A)\s*[：:]\s*([\s\S]*)$/i)?.[1] || '').trim();
      return question && answer ? { question, answer } : null;
    }).filter(Boolean);
  };

  const openQA = (id) => {
    const select = form.elements.recordId;
    select.innerHTML = records.map((record) => `<option value="${record.id}">${esc(record.company)} · ${esc(record.role)}</option>`).join('');
    const record = records.find((item) => item.id === id) || selected;
    select.value = record.id;
    form.elements.qaText.value = record.qaText || '';
    dialog.showModal();
  };
  window.openSummary = openQA;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const data = Object.fromEntries(new FormData(form));
    records = records.map((record) => record.id === data.recordId
      ? { ...record, qaText: data.qaText, qa: parseQA(data.qaText) }
      : record);
    selected = records.find((record) => record.id === data.recordId);
    save(); draw(); dialog.close(); toast('面试问答已保存');
  }, true);

  const baseDraw = draw;
  draw = () => {
    baseDraw();
    if (!selected) return;
    const detail = document.querySelector('#detail');
    const legacyTitle = [...detail.querySelectorAll('.section')].find((node) => node.textContent.includes('面试总结纪要'));
    if (legacyTitle) {
      const note = legacyTitle.nextElementSibling;
      legacyTitle.remove();
      if (note?.classList.contains('note')) note.remove();
    }
    detail.querySelector('#summary')?.remove();
    const items = selected.qa || parseQA(selected.qaText);
    const section = document.createElement('section');
    section.className = 'qa-section';
    section.innerHTML = `<div class="section">面试问题与我的回答</div>${items.length ? `<div class="qa-list">${items.map((item, index) => `<article class="qa-card"><div class="qa-card-top"><span class="qa-index">Q${String(index + 1).padStart(2, '0')}</span><span class="qa-label">面试官的问题</span></div><div class="qa-question">${esc(item.question)}</div><div class="qa-answer"><b>我的回答</b>${esc(item.answer)}</div></article>`).join('')}</div>` : `<div class="note qa-empty"><b>尚未导入问答</b>上传 Markdown、PDF 或 Word 文档后，这里会自动整理成可复盘的问答卡片。</div>`}<button class="link qa-upload-link" id="qaUpload">${items.length ? '更新面试问答' : '上传面试问答'}</button>`;
    detail.querySelector('.links').before(section);
    detail.querySelector('#qaUpload').onclick = () => openQA(selected.id);
  };
  draw();
})();
