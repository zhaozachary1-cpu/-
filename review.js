(() => {
  const style = document.createElement('style');
  style.textContent = `
    .qa-field textarea{min-height:230px}.qa-hint{font-size:10px;color:var(--muted);line-height:1.6;margin:7px 0 0}.import-row{display:flex;align-items:center;gap:8px;margin-bottom:9px}.import-file{height:30px;padding:0 11px;border:1px solid #5971c2;border-radius:8px;background:#5165d91a;color:#cbd8ff;font-size:10px;font-weight:750;cursor:pointer;transition:.18s}.import-file:hover{background:#5165d942;transform:translateY(-1px)}.import-row span{font-size:9px;color:var(--muted)}.import-row.loading .import-file{opacity:.6;pointer-events:none}
    .qa-section{margin-top:24px}.qa-section .section{margin-bottom:0}.qa-analysis-caption{margin:6px 0 0;color:var(--muted);font-size:9px;line-height:1.5}.qa-list{display:grid;grid-template-columns:1fr;gap:10px;margin-top:11px}.qa-card{overflow:hidden;border:1px solid var(--line);border-radius:14px;background:linear-gradient(145deg,#0e1833,#091227);box-shadow:0 8px 18px #0207172e}.qa-card-top{display:flex;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid var(--line);background:#1623428c}.qa-index{display:inline-flex;align-items:center;justify-content:center;width:32px;height:19px;border-radius:6px;background:#31d6db18;color:var(--cyan);font-size:9px;font-weight:800;letter-spacing:.06em}.qa-label{color:#aebddb;font-size:10px;font-weight:750}.qa-frequency{margin-left:auto;border:1px solid #5870ca66;border-radius:99px;background:#566ce51c;color:#b8c8ff;padding:3px 7px;font-size:9px;font-weight:800;white-space:nowrap}.qa-question{padding:11px 13px 13px;color:#e5ecff;font-size:12px;font-weight:720;line-height:1.7;white-space:pre-wrap}.qa-answer{padding:12px 13px 14px;border-top:1px dashed #334162;color:#b8c5e1;font-size:11px;line-height:1.75;white-space:pre-wrap}.qa-answer b{display:block;margin-bottom:5px;color:#8fa3ca;font-size:9px;letter-spacing:.08em}.qa-empty{margin-top:11px}.qa-upload-link{margin-top:10px}.qa-raw-card{border-color:#5d70bc}.qa-raw-card .qa-index{width:auto;padding:0 7px}
    :root[data-theme="light"] .import-file{background:#e7ecff;color:#4052be;border-color:#b8c5ee}:root[data-theme="light"] .import-file:hover{background:#dce4ff}:root[data-theme="light"] .qa-card{background:linear-gradient(145deg,#fff,#f7f9ff);box-shadow:0 8px 18px rgba(40,59,104,.07)}:root[data-theme="light"] .qa-card-top{background:#edf2ff}:root[data-theme="light"] .qa-label{color:#586783}:root[data-theme="light"] .qa-frequency{background:#edf1ff;color:#4c5fc2;border-color:#c7d0fa}:root[data-theme="light"] .qa-question{color:#1d2943}:root[data-theme="light"] .qa-answer{border-color:#d7deee;color:#5e6c86}:root[data-theme="light"] .qa-answer b{color:#596bc2}
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
    const source = String(text || '').replace(/\r/g, '').trim();
    if (!source) return [];
    // Supports plain “问题：/回答：”, Markdown headings, numbered labels,
    // and common variants such as “我的回答” and “面试官问题”.
    const marker = '(?:#{1,6}\\s*)?(?:[-*]\\s*)?(?:问题|面试官(?:的问题)?|Q)(?:\\s*[0-9一二三四五六七八九十]+)?\\s*[：:]?';
    const answerMarker = '(?:#{1,6}\\s*)?(?:[-*]\\s*)?(?:回答|我的回答|答|A)\\s*[：:]?';
    const pair = new RegExp(`(?:^|\\n)\\s*${marker}\\s*([\\s\\S]*?)(?=\\n\\s*${answerMarker})(?:\\n\\s*${answerMarker})\\s*([\\s\\S]*?)(?=\\n\\s*${marker}|$)`, 'gi');
    const items = [];
    let match;
    while ((match = pair.exec(source))) {
      const question = match[1].trim().replace(/^#+\s*/, '');
      const answer = match[2].trim();
      if (question && answer) items.push({ question, answer });
    }
    if (items.length) return items;

    // A line-oriented fallback handles “Q1 / A1” documents without colons.
    let question = '';
    let answer = '';
    let mode = '';
    const flush = () => { if (question.trim() && answer.trim()) items.push({ question: question.trim(), answer: answer.trim() }); question = ''; answer = ''; };
    source.split('\n').forEach((line) => {
      const clean = line.replace(/^\s*(?:#{1,6}|[-*])\s*/, '').trim();
      if (/^(?:问题|面试官(?:的问题)?|Q)\s*\d*\b/i.test(clean)) { flush(); mode = 'question'; question = clean.replace(/^(?:问题|面试官(?:的问题)?|Q)\s*\d*\s*[：:]?\s*/i, ''); return; }
      if (/^(?:回答|我的回答|答|A)\s*\d*\b/i.test(clean)) { mode = 'answer'; answer = clean.replace(/^(?:回答|我的回答|答|A)\s*\d*\s*[：:]?\s*/i, ''); return; }
      if (mode === 'question') question += `${question ? '\n' : ''}${clean}`;
      if (mode === 'answer') answer += `${answer ? '\n' : ''}${clean}`;
    });
    flush();
    return items;
  };

  // Private, browser-only fuzzy grouping. The rule topics catch common
  // paraphrases; the character-bigram score catches near-identical wording.
  const normalizeQuestion = (value) => String(value || '')
    .toLowerCase()
    .replace(/(请|你|能否|可以|帮我|一下|介绍|谈谈|说说|讲讲|关于|对于|这个|一个|的|了|吗|呢|呀|如何|怎么|为什么)/g, '')
    .replace(/[\s\p{P}\p{S}]/gu, '');
  const topicOf = (question) => {
    const source = String(question || '');
    const rules = [
      [/自我介绍|介绍.*自己|个人.*经历/, '自我介绍'],
      [/为什么.*(?:公司|岗位)|加入.*(?:公司|团队)|求职动机|选择.*(?:公司|岗位)/, '求职动机'],
      [/项目.*(?:经历|经验|案例)|负责.*项目|最.*(?:项目|成果)/, '项目经历'],
      [/数据.*(?:分析|驱动)|指标|a\/?b|实验/, '数据分析'],
      [/冲突|分歧|协作|团队|沟通/, '团队协作'],
      [/优点|缺点|优势|不足/, '个人优势'],
      [/职业规划|未来.*(?:规划|发展)|三年|五年/, '职业规划'],
      [/产品.*(?:设计|思路|能力)|用户需求|竞品/, '产品能力'],
    ];
    return rules.find(([rule]) => rule.test(source))?.[1] || '';
  };
  const similarity = (first, second) => {
    if (first === second) return 1;
    if (first.length < 2 || second.length < 2) return 0;
    const grams = (text) => new Set(Array.from({ length: text.length - 1 }, (_, index) => text.slice(index, index + 2)));
    const a = grams(first); const b = grams(second);
    let shared = 0; a.forEach((item) => { if (b.has(item)) shared += 1; });
    return (2 * shared) / (a.size + b.size || 1);
  };
  const allQuestionClusters = () => {
    const clusters = [];
    records.forEach((record) => {
      const questions = Array.isArray(record.qa) && record.qa.length ? record.qa : parseQA(record.qaText);
      questions.forEach((item) => {
        const normalized = normalizeQuestion(item.question);
        if (!normalized) return;
        const topic = topicOf(item.question);
        const cluster = clusters.find((candidate) => (
          candidate.normalized === normalized
          || (topic && candidate.topic === topic)
          || similarity(candidate.normalized, normalized) >= 0.58
        ));
        if (cluster) { cluster.count += 1; cluster.variants.push(normalized); }
        else clusters.push({ normalized, topic, count: 1, variants: [normalized] });
      });
    });
    return clusters;
  };
  const frequencyOf = (question, clusters) => {
    const normalized = normalizeQuestion(question);
    const topic = topicOf(question);
    return clusters.find((cluster) => (
      cluster.normalized === normalized
      || (topic && cluster.topic === topic)
      || similarity(cluster.normalized, normalized) >= 0.58
    ))?.count || 1;
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
    const parsed = parseQA(data.qaText);
    records = records.map((record) => record.id === data.recordId
      ? { ...record, qaText: data.qaText, qa: parsed }
      : record);
    selected = records.find((record) => record.id === data.recordId);
    save(); draw(); dialog.close(); toast(parsed.length ? `已保存并生成 ${parsed.length} 张问答卡片` : '已保存问答原文，可在公司详情查看');
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
    const parsedItems = Array.isArray(selected.qa) && selected.qa.length ? selected.qa : parseQA(selected.qaText);
    const rawText = String(selected.qaText || '').trim();
    const items = parsedItems.length ? parsedItems : rawText ? [{ question: '已导入的面试问答', answer: rawText, fallback: true }] : [];
    const clusters = allQuestionClusters();
    const section = document.createElement('section');
    section.className = 'qa-section';
    section.innerHTML = `<div class="section">面试问题与我的回答</div>${items.length ? '<p class="qa-analysis-caption">已基于全部已上传问答自动归并相似问题。</p>' : ''}${items.length ? `<div class="qa-list">${items.map((item, index) => `<article class="qa-card ${item.fallback ? 'qa-raw-card' : ''}"><div class="qa-card-top"><span class="qa-index">${item.fallback ? '导入' : `Q${String(index + 1).padStart(2, '0')}`}</span><span class="qa-label">${item.fallback ? '已上传内容' : '面试官的问题'}</span>${item.fallback ? '' : `<span class="qa-frequency">出现 ${frequencyOf(item.question, clusters)} 次</span>`}</div><div class="qa-question">${esc(item.question)}</div><div class="qa-answer"><b>${item.fallback ? '问答原文' : '我的回答'}</b>${esc(item.answer)}</div></article>`).join('')}</div>` : `<div class="note qa-empty"><b>尚未导入问答</b>上传 Markdown、PDF 或 Word 文档后，这里会自动整理成可复盘的问答卡片。</div>`}<button class="link qa-upload-link" id="qaUpload">${items.length ? '更新面试问答' : '上传面试问答'}</button>`;
    detail.querySelector('.links').before(section);
    detail.querySelector('#qaUpload').onclick = () => openQA(selected.id);
  };
  draw();
})();
