const http = require('http');
const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');
const root = __dirname;

function configureQcc() {
  const rawAuthorization = (process.env.QCC_AUTHORIZATION || process.env.QCC_DOCUMENT_AUTHORIZATION || '').trim();
  if (!rawAuthorization) {
    console.warn('QCC is unavailable: QCC_AUTHORIZATION is not configured.');
    return false;
  }
  try {
    const authorization = /^Bearer\s+/i.test(rawAuthorization) ? rawAuthorization : `Bearer ${rawAuthorization}`;
    const directory = path.join(os.homedir(), '.qcc');
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, 'config.json'), JSON.stringify({
      version: '2.1',
      mcp: {
        enabled: true,
        baseUrl: 'https://agent.qcc.com/mcp',
        authorization,
        timeout: 30000,
      },
    }, null, 2), { mode: 0o600 });
    console.log('QCC CLI configuration loaded from environment.');
    return true;
  } catch (error) {
    console.error('QCC is unavailable: could not prepare its runtime configuration.');
    return false;
  }
}

const qccConfigured = configureQcc();
const qccMcp = require('qcc-agent-cli/src/services/mcpService');

function send(res, status, body, type = 'application/json; charset=utf-8') {
  // The app is small and evolves quickly. Avoid serving a newly deployed HTML
  // document with an older cached interaction script from a previous release.
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store, max-age=0' });
  res.end(Buffer.isBuffer(body) || typeof body === 'string' ? body : JSON.stringify(body));
}

async function qcc(service, tool, company) {
  if (!qccConfigured) {
    const error = new Error('企查查服务尚未配置，请在部署环境设置 QCC_AUTHORIZATION 后重新部署。');
    error.code = 'QCC_NOT_CONFIGURED';
    throw error;
  }
  return qccMcp.callTool(service, tool, { searchKey: company });
}

function pick(obj, candidates) {
  for (const key of candidates) if (obj && obj[key]) return obj[key];
  return '';
}

function deepPick(value, candidates) {
  const wanted = new Set(candidates.map((item) => item.toLowerCase()));
  const queue = [value];
  const visited = new Set();
  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || visited.has(current)) continue;
    visited.add(current);
    for (const [key, item] of Object.entries(current)) {
      if (wanted.has(key.toLowerCase()) && item !== '' && item != null) return item;
      if (item && typeof item === 'object') queue.push(item);
    }
  }
  return '';
}

function containsNoData(value) {
  return /未发现|无匹配|暂无|无相关|没有记录/.test(JSON.stringify(value || {}));
}

function financingStatus(value) {
  const queue = [value];
  const visited = new Set();
  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || visited.has(current)) continue;
    visited.add(current);
    if (Array.isArray(current) && current[0] && typeof current[0] === 'object' && ('融资轮次' in current[0] || 'Round' in current[0])) {
      const latest = current[0];
      const round = pick(latest, ['融资轮次', 'Round', 'round']);
      const date = pick(latest, ['融资日期', 'Date', 'date']);
      return round ? `${round}${date ? ` · ${date}` : ''}` : '';
    }
    Object.values(current).forEach((item) => { if (item && typeof item === 'object') queue.push(item); });
  }
  return '';
}

function summarizeBusiness(industry, profile) {
  const text = `${industry} ${profile}`.toLowerCase();
  const rules = [
    [/人工智能|大模型|ai/, '人工智能'],
    [/电商|零售|交易平台/, '电商'],
    [/内容社区|社区|社交/, '内容社区'],
    [/短视频|视频/, '短视频'],
    [/企业服务|saas|软件和信息技术|软件开发/, '企业服务'],
    [/金融|支付|保险|银行|证券/, '金融科技'],
    [/招聘|人力资源/, '招聘服务'],
    [/教育|培训/, '在线教育'],
    [/医疗|健康/, '医疗健康'],
    [/物流|供应链/, '物流供应链'],
    [/游戏/, '游戏'],
  ];
  return rules.find(([pattern]) => pattern.test(text))?.[1] || industry || '综合服务';
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      let text = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { text += chunk; });
      response.on('end', () => response.statusCode >= 200 && response.statusCode < 400 ? resolve(text) : reject(new Error('image search failed')));
    });
    request.setTimeout(8000, () => request.destroy(new Error('image search timeout')));
    request.on('error', reject);
  });
}

function decodeHtml(value) {
  return String(value || '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
}

async function findPublicLogo(company, shortName) {
  const keyword = (shortName || company || '').trim();
  if (!keyword) return '';
  try {
    const searchUrl = `https://cn.bing.com/images/search?q=${encodeURIComponent(`${keyword} 官方 Logo`)}`;
    const html = await fetchText(searchUrl);
    const matches = [...html.matchAll(/murl&quot;:&quot;(.*?)&quot;[\s\S]{0,1800}?t&quot;:&quot;(.*?)&quot;/g)];
    const result = matches.find((match) => decodeHtml(match[2]).replace(/\s/g, '').includes(keyword.replace(/\s/g, '')));
    return result ? decodeHtml(result[1]) : '';
  } catch (_) {
    return '';
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/company' && req.method === 'GET') {
    const name = url.searchParams.get('name')?.trim();
    if (!name) return send(res, 400, { error: '请填写公司名称' });
    try {
      const [registration, profile, financial, listing, financing] = await Promise.all([
        qcc('company', 'get_company_registration_info', name),
        qcc('company', 'get_company_profile', name).catch(() => ({})),
        qcc('company', 'get_financial_data', name).catch(() => ({})),
        qcc('company', 'get_listing_info', name).catch(() => ({})),
        qcc('operation', 'get_financing_records', name).catch(() => ({})),
      ]);
      const registrationData = registration.data || registration.result || registration;
      const profileData = profile.data || profile.result || profile;
      const financialData = financial.data || financial.result || financial;
      const listingData = listing.data || listing.result || listing;
      const financingData = financing.data || financing.result || financing;
      const officialName = pick(registrationData, ['Name', 'name', '企业名称', 'CompanyName']) || name;
      const shortName = pick(registrationData, ['企业简称', 'ShortName', 'shortName']);
      const qccLogo = pick(profileData, ['Logo', 'LogoUrl', 'logo', 'logoUrl', '企业头像', '头像', '品牌图片']);
      send(res, 200, {
        name: officialName,
        address: pick(registrationData, ['Address', '注册地址', 'RegAddress', 'address']),
        industry: pick(profileData, ['Industry', '行业', 'industry', 'IndustryName']) || pick(registrationData, ['Industry', '行业', 'industry', '国标行业']),
        product: summarizeBusiness(
          pick(profileData, ['Industry', '行业', 'industry', 'IndustryName']) || pick(registrationData, ['Industry', '行业', 'industry', '国标行业']),
          pick(profileData, ['Introduction', '简介', 'Profile', 'BusinessScope']),
        ),
        foundedAt: pick(registrationData, ['成立日期', 'EstablishedDate', 'StartDate', '成立时间']),
        companyScale: pick(registrationData, ['人员规模', '企业规模', 'Scale', 'EmployeeScale']),
        employeeCount: pick(registrationData, ['参保人数', '员工人数', 'EmployeeCount', 'Employees']),
        revenue: deepPick(financialData, ['营业收入', '营业总收入', '主营业务收入', 'Revenue', 'OperatingRevenue']) || '',
        listingStatus: containsNoData(listingData) ? '未发现公开上市记录' : (deepPick(listingData, ['股票代码', 'StockCode', '股票简称', 'StockName']) ? '已上市' : '未发现公开上市记录'),
        financingStatus: financingStatus(financingData) || (containsNoData(financingData) ? '暂无公开融资记录' : '暂无公开融资记录'),
        logoUrl: qccLogo || await findPublicLogo(officialName, shortName),
      });
    } catch (error) {
      const status = error.code === 'QCC_NOT_CONFIGURED' ? 503 : 502;
      send(res, status, { error: error.code === 'QCC_NOT_CONFIGURED' ? error.message : '企查查查询暂时失败，请稍后重试或手动填写。' });
    }
    return;
  }
  const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const publicFiles = new Set(['index.html', 'picker.js', 'persistence.js', 'status.js', 'status-board.js', 'form-submit.js', 'record-interactions.js', 'logo-lookup.js', 'calendar-board.js', 'theme.js', 'work-schedule.js', 'backup.js', 'company-detail-expand.js', 'company-profile.js', 'mobile-responsive.js']);
  if (!publicFiles.has(file)) return send(res, 404, 'Not found', 'text/plain');
  const target = path.join(root, file);
  if (!target.startsWith(root) || !fs.existsSync(target)) return send(res, 404, 'Not found', 'text/plain');
  const type = target.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8';
  let contents = fs.readFileSync(target);
  if (file === 'index.html') {
    const build = process.env.RENDER_GIT_COMMIT || String(fs.statSync(target).mtimeMs);
    const asset = (name) => `<script src="/${name}?v=${encodeURIComponent(build)}"></script>`;
    contents = contents.toString('utf8').replace('</body>', `${asset('picker.js')}${asset('status.js')}${asset('status-board.js')}${asset('form-submit.js')}${asset('record-interactions.js')}${asset('logo-lookup.js')}${asset('calendar-board.js')}${asset('theme.js')}${asset('work-schedule.js')}${asset('persistence.js')}${asset('backup.js')}${asset('company-detail-expand.js')}${asset('company-profile.js')}${asset('mobile-responsive.js')}</body>`);
  }
  send(res, 200, contents, type);
});
const port = Number(process.env.PORT) || 4174;
server.listen(port, () => console.log(`Interview Atlas: http://localhost:${port}`));
