const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const HTML_FILE = path.join(__dirname, 'BCCIT_People_of_the_Future_AI_Team.html');

const profiles = {
  'ليلى': 'أنتِ ليلى، مستشارة اللغات الإنجليزية واللغات الأخرى ومهارات التواصل. أجيبي بالعربية أو باللغة التي يطلبها العميل، وقدمي أمثلة وتمارين عند الحاجة.',
  'آدم': 'أنت آدم، مستشار التكنولوجيا والمهارات الرقمية والبرمجة والأدوات التقنية. اشرح ببساطة وبخطوات عملية.',
  'نور': 'أنتِ نور، مستشارة الأعمال والمحاسبة والتمويل والإدارة وريادة الأعمال. قدمي شرحاً عملياً، ولا تختلقي أرقاماً أو بيانات تخص المركز.',
  'زياد': 'أنت زياد، مستشار التطوير الشخصي ومهارات التعلم وتنظيم الوقت وتحقيق الأهداف. قدم خططاً عملية واقعية.'
};

function send(res, status, data, type='application/json; charset=utf-8') {
  res.writeHead(status, {'Content-Type': type, 'Access-Control-Allow-Origin': '*'});
  res.end(typeof data === 'string' ? data : JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, '');
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    if (!fs.existsSync(HTML_FILE)) return send(res, 404, 'Catalog HTML file not found', 'text/plain; charset=utf-8');
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    return fs.createReadStream(HTML_FILE).pipe(res);
  }
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, {ok:true, service:'BCCIT AI Team'});
  if (req.method === 'POST' && req.url === '/api/team-chat') {
    if (!process.env.OPENAI_API_KEY) return send(res, 503, {error:'OPENAI_API_KEY is not configured'});
    let raw='';
    req.on('data', chunk => { raw += chunk; if (raw.length > 1_000_000) req.destroy(); });
    req.on('end', async () => {
      try {
        const body = JSON.parse(raw || '{}');
        const name = String(body.character || 'مستشار BCCIT');
        const profile = profiles[name] || 'أنت مستشار مساعد في BCCIT ACADEMY. أجب بدقة ووضوح، واطلب التوضيح عند الحاجة.';
        const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
        const input = messages.map(m => ({role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '')}));
        const response = await fetch('https://api.openai.com/v1/responses', {
          method:'POST',
          headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
          body:JSON.stringify({model:MODEL, instructions: profile + ' أجب عن السؤال الحالي مباشرة ولا تعتمد على إجابات محفوظة. لا تخترع أسعار أو مواعيد أو سياسات تخص الأكاديمية. إذا لم تتوفر معلومة مؤكدة فقل ذلك بوضوح.', input})
        });
        const data = await response.json();
        if (!response.ok) return send(res, 502, {error:data.error?.message || 'OpenAI request failed'});
        let reply = data.output_text || '';
        if (!reply && Array.isArray(data.output)) reply = data.output.flatMap(x => x.content || []).filter(x => x.type === 'output_text').map(x => x.text).join('\n');
        if (!reply) return send(res, 502, {error:'No response text returned'});
        return send(res, 200, {reply});
      } catch (e) { return send(res, 500, {error:'Server error: '+e.message}); }
    });
    return;
  }
  return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
});
server.listen(PORT, () => console.log(`BCCIT AI Team running on port ${PORT}`));
