require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'store.json');

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ============ DATA ============
const questions = [
  { subject: 'Ganit', text: 'यदि a + b = 5 और ab = 6 हो, तो a² + b² का मान क्या होगा?', options: ['10', '12', '13', '11'], correct: 2 },
  { subject: 'Vigyan', text: 'प्रकाश संश्लेषण की क्रिया में कौन सी गैस निकलती है?', options: ['CO₂', 'N₂', 'O₂', 'H₂'], correct: 2 },
  { subject: 'Hindi', text: '"रामचरितमानस" के रचयिता कौन हैं?', options: ['कबीरदास', 'तुलसीदास', 'सूरदास', 'मीराबाई'], correct: 1 },
  { subject: 'English', text: 'Choose the correct passive voice: "She writes a letter."', options: ['A letter writes by her', 'A letter is written by her', 'A letter was written by her', 'A letter written by her'], correct: 1 },
  { subject: 'SST', text: 'भारत में पंचायती राज की शुरुआत किस राज्य से हुई?', options: ['UP', 'Bihar', 'Rajasthan', 'MP'], correct: 2 },
  { subject: 'Ganit', text: 'sin²θ + cos²θ = ?', options: ['0', '2', '1', 'sin 2θ'], correct: 2 },
  { subject: 'Vigyan', text: 'ओम का नियम क्या है?', options: ['V = I/R', 'V = IR', 'I = VR', 'R = VI'], correct: 1 },
  { subject: 'Hindi', text: '"दोहा" छंद में कितनी मात्राएं होती हैं?', options: ['24', '13', '16', '11'], correct: 0 },
  { subject: 'English', text: 'Which is a correct sentence?', options: ['I goes to school', 'He go to market', 'She goes to temple', 'They goes home'], correct: 2 },
  { subject: 'SST', text: 'भारत का संविधान कब लागू हुआ?', options: ['15 Aug 1947', '26 Nov 1949', '26 Jan 1950', '2 Oct 1950'], correct: 2 },
  { subject: 'Ganit', text: 'एक वृत्त की त्रिज्या 7 cm है। उसका क्षेत्रफल क्या होगा? (π = 22/7)', options: ['154 cm²', '44 cm²', '49 cm²', '308 cm²'], correct: 0 },
  { subject: 'Vigyan', text: 'DNA का पूरा नाम क्या है?', options: ['Deoxyribose Nucleic Acid', 'Diribonucleic Acid', 'Deoxyribonucleic Acid', 'Dioxy Nucleic Acid'], correct: 2 },
];

const topics = [
  { icon: '📐', name: 'Trigonometry', sub: 'Ganit', score: 42, status: 'weak', priority: 'high' },
  { icon: '🔤', name: 'Passive Voice', sub: 'English', score: 38, status: 'weak', priority: 'high' },
  { icon: '🗳️', name: 'Civics — Democracy', sub: 'SST', score: 55, status: 'medium', priority: 'med' },
  { icon: '💡', name: 'Electricity', sub: 'Vigyan', score: 68, status: 'medium', priority: 'med' },
  { icon: '📝', name: 'Nibandh Lekhan', sub: 'Hindi', score: 75, status: 'medium', priority: 'med' },
  { icon: '📊', name: 'Statistics', sub: 'Ganit', score: 82, status: 'strong', priority: 'low' },
  { icon: '🌱', name: 'Life Processes', sub: 'Vigyan', score: 88, status: 'strong', priority: 'low' },
  { icon: '📖', name: 'Kabir ki Sakhiyaan', sub: 'Hindi', score: 91, status: 'strong', priority: 'low' },
];

const papers = [
  { year: 2024, name: 'UP Board Class 10 — Full Paper', subject: 'ganit', tags: ['Ganit', 'Vigyan', 'Hindi'], questions: 90, duration: '3 hrs' },
  { year: 2023, name: 'UP Board Class 10 — Full Paper', subject: 'vigyan', tags: ['SST', 'English', 'Computer'], questions: 90, duration: '3 hrs' },
  { year: 2022, name: 'UP Board Ganit Special Paper', subject: 'ganit', tags: ['Ganit', 'Algebra', 'Geometry'], questions: 50, duration: '2 hrs' },
  { year: 2022, name: 'UP Board Vigyan Chapter-wise', subject: 'vigyan', tags: ['Physics', 'Chemistry', 'Biology'], questions: 60, duration: '2.5 hrs' },
  { year: 2021, name: 'UP Board Hindi Sahitya Paper', subject: 'hindi', tags: ['Kavita', 'Gadya', 'Nibandh'], questions: 45, duration: '2 hrs' },
  { year: 2021, name: 'UP Board English Paper', subject: 'english', tags: ['Grammar', 'Reading', 'Writing'], questions: 40, duration: '2 hrs' },
  { year: 2020, name: 'UP Board SST Paper', subject: 'sst', tags: ['History', 'Geography', 'Civics'], questions: 70, duration: '3 hrs' },
  { year: 2019, name: 'UP Board Computer Paper', subject: 'all', tags: ['MS Office', 'Internet', 'Programming'], questions: 35, duration: '1.5 hrs' },
];

const leaderboard = [
  { rank: '🥇', name: 'Priya Sharma', school: 'DAV Lucknow', score: 1580, av: 'प' },
  { rank: '🥈', name: 'Rohit Kumar', school: 'KV Varanasi', score: 1520, av: 'र' },
  { rank: '🥉', name: 'Anjali Singh', school: 'GM Inter College', score: 1490, av: 'अ' },
  { rank: '4', name: 'Arjun Verma', school: 'Local School', score: 1240, av: 'A', isYou: true },
  { rank: '5', name: 'Deepak Yadav', school: 'SDM Inter College', score: 1210, av: 'D' },
];

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (_) {}
  return { users: {}, tests: [], offline: {} };
}

function saveStore(store) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function userId(name, cls) {
  return crypto.createHash('sha256').update(`${name}|${cls}`).digest('hex').slice(0, 16);
}

// ============ API ROUTES ============

app.get('/api/health', (_, res) => {
  res.json({ ok: true, ai: !!process.env.ANTHROPIC_API_KEY });
});

app.get('/api/questions', (_, res) => res.json(questions));
app.get('/api/topics', (_, res) => res.json(topics));
app.get('/api/papers', (_, res) => res.json(papers));
app.get('/api/leaderboard', (_, res) => res.json(leaderboard));

app.post('/api/auth/login', (req, res) => {
  const { name, class: cls, dialect } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const id = userId(name, cls || 'Class 10');
  const store = loadStore();
  const user = {
    id,
    name,
    class: cls || 'Class 10',
    dialect: dialect || 'hindi',
    avatar: name.charAt(0),
    streak: store.users[id]?.streak ?? 7,
    lastLogin: new Date().toISOString(),
  };
  store.users[id] = user;
  saveStore(store);
  res.json({ user });
});

app.get('/api/progress/:userId', (req, res) => {
  const store = loadStore();
  const uid = req.params.userId;
  const tests = store.tests.filter((t) => t.userId === uid).slice(-10);
  const offline = store.offline[uid] || [];
  const user = store.users[uid] || null;
  res.json({ user, tests, offline });
});

app.post('/api/test/submit', (req, res) => {
  const { userId: uid, score, correct, total, subjectScores, answers } = req.body;
  if (!uid) return res.status(400).json({ error: 'userId required' });

  const store = loadStore();
  const record = {
    userId: uid,
    score,
    correct,
    total,
    subjectScores,
    answers,
    submittedAt: new Date().toISOString(),
  };
  store.tests.push(record);
  saveStore(store);
  res.json({ ok: true, record });
});

app.post('/api/offline/download', (req, res) => {
  const { userId: uid, chapter } = req.body;
  if (!uid || !chapter) return res.status(400).json({ error: 'userId and chapter required' });

  const store = loadStore();
  if (!store.offline[uid]) store.offline[uid] = [];
  const entry = { chapter, downloadedAt: new Date().toISOString() };
  if (!store.offline[uid].find((o) => o.chapter === chapter)) {
    store.offline[uid].push(entry);
  }
  saveStore(store);
  res.json({ ok: true, entry });
});

app.get('/api/offline/:userId', (req, res) => {
  const store = loadStore();
  res.json(store.offline[req.params.userId] || []);
});

async function callAnthropic(body) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(err || `API error ${resp.status}`);
  }
  return resp.json();
}

app.post('/api/ai/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'question required' });

  try {
    const data = await callAnthropic({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `Tum ek helpful UP Board teacher ho. Student ke sawaal ka jawab SIRF Hindi mein do (Hinglish allowed hai). 
        Jawab SHORT aur SIMPLE rakho — jaise ek gaon ka teacher samjhaye. Step-by-step batao. Max 150 words.`,
      messages: [{ role: 'user', content: question }],
    });

    const answer = data?.content?.[0]?.text || 'Kshama karo, abhi jawab nahi de sakta.';
    res.json({ answer });
  } catch (e) {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({
        answer: `[Demo Mode] "${question}" — Ye ek achha sawaal hai! Server par ANTHROPIC_API_KEY set karo real AI jawab ke liye. Abhi ke liye: topic ko NCERT book se padho aur teacher se poochho.`,
      });
    }
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/ai/solve-image', async (req, res) => {
  const { base64, mimeType } = req.body;
  if (!base64 || !mimeType) return res.status(400).json({ error: 'base64 and mimeType required' });

  try {
    const data = await callAnthropic({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `Tum ek UP Board teacher ho. Student ne copy pe sawaal likha hai. Image dekho aur sawaal identify karo.
        Phir STEP BY STEP solution do Hindi mein. Format:
        SAWAAL: [sawaal ka description]
        STEP 1: [explanation]
        STEP 2: [explanation]
        ANSWER: [final answer]
        SIRF Hindi mein likho. Simple language use karo.`,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
          { type: 'text', text: 'Is image mein jo sawaal hai uska step-by-step solution do Hindi mein.' },
        ],
      }],
    });

    const solution = data?.content?.[0]?.text || 'Image clearly nahi dikh rahi. Dobara try karo.';
    res.json({ solution });
  } catch (e) {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({
        solution: 'SAWAAL: Demo mode — API key set nahi hai\nSTEP 1: .env file mein ANTHROPIC_API_KEY add karo\nSTEP 2: Server restart karo\nANSWER: Phir real solution milega',
      });
    }
    res.status(500).json({ error: e.message });
  }
});

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Vidya AI server: http://localhost:${PORT}`);
  console.log(`AI enabled: ${!!process.env.ANTHROPIC_API_KEY}`);
});
