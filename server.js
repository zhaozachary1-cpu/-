const http = require('http');
const https = require('https');
const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const run = promisify(execFile);
const root = __dirname;

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(Buffer.isBuffer(body) || typeof body === 'string' ? body : JSON.stringify(body));
}

async function qcc(tool, company) {
  const { stdout } = await run('npx', ['qcc-agent-cli', 'company', tool, '--json', '--searchKey', company], { cwd: root, timeout: 30000 });
  const jsonStart = stdout.indexOf('{');
  if (jsonStart < 0) throw new Error('企查查未返回结构化数据');
  return JSON.parse(stdout.slice(jsonStart));
}

function pick(obj, candidates) {
  for (const key of candidates) if (obj && obj[key]) return obj[key];
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
      const [registration, profile] = await Promise.all([
        qcc('get_company_registration_info', name),
        qcc('get_company_profile', name).catch(() => ({})),
      ]);
      const registrationData = registration.data || registration.result || registration;
      const profileData = profile.data || profile.result || profile;
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
        logoUrl: qccLogo || await findPublicLogo(officialName, shortName),
      });
    } catch (error) {
      send(res, 502, { error: '企查查查询暂时失败，请稍后重试或手动填写。' });
    }
    return;
  }
  const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const publicFiles = new Set(['index.html', 'picker.js', 'persistence.js', 'status.js', 'status-board.js', 'review.js', 'form-submit.js', 'record-interactions.js', 'logo-lookup.js', 'calendar-board.js', 'theme.js', 'work-schedule.js', 'backup.js', 'company-detail-expand.js']);
  if (!publicFiles.has(file)) return send(res, 404, 'Not found', 'text/plain');
  const target = path.join(root, file);
  if (!target.startsWith(root) || !fs.existsSync(target)) return send(res, 404, 'Not found', 'text/plain');
  const type = target.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8';
  let contents = fs.readFileSync(target);
  if (file === 'index.html') {
    contents = contents.toString('utf8').replace('</body>', '<script src="/picker.js"></script><script src="/status.js"></script><script src="/status-board.js"></script><script src="/review.js"></script><script src="/form-submit.js"></script><script src="/record-interactions.js"></script><script src="/logo-lookup.js"></script><script src="/calendar-board.js"></script><script src="/theme.js"></script><script src="/work-schedule.js"></script><script src="/persistence.js"></script><script src="/backup.js"></script><script src="/company-detail-expand.js"></script></body>');
  }
  send(res, 200, contents, type);
});
const port = Number(process.env.PORT) || 4174;
server.listen(port, () => console.log(`Interview Atlas: http://localhost:${port}`));
