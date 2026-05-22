const API = '';

// ============ APP STATE ============
const state = {
  user: { id:null, name:'Arjun Verma', class:'Class 10', dialect:'hindi', avatar:'अ' },
  currentQ: 0,
  answers: [],
  testActive: false,
  timer: null,
  qTimer: null,
  qSeconds: 0,
  voiceListening: false,
  recognition: null,
  streak: 7,
};

// ============ QUESTIONS DB ============
const questions = [
  { subject:'Ganit', text:'यदि a + b = 5 और ab = 6 हो, तो a² + b² का मान क्या होगा?', options:['10','12','13','11'], correct:2 },
  { subject:'Vigyan', text:'प्रकाश संश्लेषण की क्रिया में कौन सी गैस निकलती है?', options:['CO₂','N₂','O₂','H₂'], correct:2 },
  { subject:'Hindi', text:'\"रामचरितमानस\" के रचयिता कौन हैं?', options:['कबीरदास','तुलसीदास','सूरदास','मीराबाई'], correct:1 },
  { subject:'English', text:'Choose the correct passive voice: "She writes a letter."', options:['A letter writes by her','A letter is written by her','A letter was written by her','A letter written by her'], correct:1 },
  { subject:'SST', text:'भारत में पंचायती राज की शुरुआत किस राज्य से हुई?', options:['UP','Bihar','Rajasthan','MP'], correct:2 },
  { subject:'Ganit', text:'sin²θ + cos²θ = ?', options:['0','2','1','sin 2θ'], correct:2 },
  { subject:'Vigyan', text:'ओम का नियम क्या है?', options:['V = I/R','V = IR','I = VR','R = VI'], correct:1 },
  { subject:'Hindi', text:'\"दोहा\" छंद में कितनी मात्राएं होती हैं?', options:['24','13','16','11'], correct:0 },
  { subject:'English', text:'Which is a correct sentence?', options:['I goes to school','He go to market','She goes to temple','They goes home'], correct:2 },
  { subject:'SST', text:'भारत का संविधान कब लागू हुआ?', options:['15 Aug 1947','26 Nov 1949','26 Jan 1950','2 Oct 1950'], correct:2 },
  { subject:'Ganit', text:'एक वृत्त की त्रिज्या 7 cm है। उसका क्षेत्रफल क्या होगा? (π = 22/7)', options:['154 cm²','44 cm²','49 cm²','308 cm²'], correct:0 },
  { subject:'Vigyan', text:'DNA का पूरा नाम क्या है?', options:['Deoxyribose Nucleic Acid','Diribonucleic Acid','Deoxyribonucleic Acid','Dioxy Nucleic Acid'], correct:2 },
];

// ============ PARTICLES ============
function createParticles() {
  const p = document.getElementById('particles');
  const colors = ['#8b5cf6','#ff6b1a','#00d4b8','#f472b6','#fbbf24'];
  for(let i=0;i<20;i++){
    const d=document.createElement('div');
    d.className='particle';
    const size=Math.random()*4+2;
    d.style.cssText=`
      width:${size}px;height:${size}px;
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${Math.random()*15+10}s;
      animation-delay:${Math.random()*10}s;
    `;
    p.appendChild(d);
  }
}

// ============ LOGIN ============
let selectedDialect = 'hindi';

function selectDialect(btn, d) {
  document.querySelectorAll('.dialect-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedDialect = d;
}

async function doLogin() {
  const name = document.getElementById('inp-name').value.trim() || 'Student';
  const cls = document.getElementById('inp-class').value;

  try {
    const res = await fetch(API + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, class: cls, dialect: selectedDialect }),
    });
    const data = await res.json();
    if (data.user) {
      state.user = data.user;
      localStorage.setItem('vidya_user', JSON.stringify(data.user));
    }
  } catch (e) {
    state.user.name = name;
    state.user.class = cls;
    state.user.dialect = selectedDialect;
    state.user.avatar = name.charAt(0);
  }

  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-app').classList.add('active');
  document.getElementById('app-header').style.display='flex';
  document.getElementById('mobile-nav').style.display='grid';
  document.getElementById('user-avatar').textContent = state.user.avatar;
  document.getElementById('greet-name').textContent = name.split(' ')[0];

  const greets = {
    hindi: `Aaj kal mein padhai jaari rakhein — board exam nazdeek aa raha hai!`,
    awadhi: `रोज पढ़ो, होशियार बनो — बोर्ड परीक्षा आवत बा!`,
    hinglish: `Keep it up! Board exam is coming soon — let's crush it! 💪`
  };
  document.getElementById('greet-line').textContent = greets[selectedDialect];

  await loadBackendData();
  buildStreakDays();
  buildTopicList();
  buildPapers();
  buildPerformance();
  initQuestions();
  showOfflineToast('🎉 Welcome! Backend connected — offline mode active');
}

async function loadBackendData() {
  try {
    const [qRes, tRes, pRes] = await Promise.all([
      fetch(API + '/api/questions'),
      fetch(API + '/api/topics'),
      fetch(API + '/api/papers'),
    ]);
    if (qRes.ok) {
      const q = await qRes.json();
      if (q.length) questions.length = 0, questions.push(...q);
    }
    if (tRes.ok) {
      const t = await tRes.json();
      if (t.length) topics.length = 0, topics.push(...t);
    }
    if (pRes.ok) {
      const p = await pRes.json();
      if (p.length) papers.length = 0, papers.push(...p);
    }
    if (state.user.id) {
      const prog = await fetch(API + '/api/progress/' + state.user.id);
      if (prog.ok) {
        const data = await prog.json();
        if (data.user?.streak) state.streak = data.user.streak;
      }
    }
  } catch (e) { /* offline — local data use hoga */ }
}

// ============ STREAK ============
function buildStreakDays() {
  const days = ['So','Mo','Tu','We','Th','Fr','Sa'];
  const today = new Date().getDay();
  let html='';
  days.forEach((d,i)=>{
    let cls = i < today ? 'done' : (i===today ? 'today' : 'upcoming');
    html+=`<div class="streak-day ${cls}">${d}</div>`;
  });
  document.getElementById('streak-days').innerHTML=html;
}

// ============ TABS ============
function showTab(name, navEl) {
  document.querySelectorAll('.tab-pane').forEach(p=>p.style.display='none');
  const t = document.getElementById('tab-'+name);
  if(t){t.style.display='block';}

  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.querySelectorAll('.mob-nav-item').forEach(n=>n.classList.remove('active'));
  if(navEl){
    navEl.classList.add('active');
    // Also sync mobile nav
    const idx = [...document.querySelectorAll('.nav-item')].indexOf(navEl);
    const mobItems = document.querySelectorAll('.mob-nav-item');
    if(mobItems[idx]) mobItems[idx].classList.add('active');
  }

  if(name==='performance') renderPerformanceCharts();
}

// ============ DIAGNOSTIC TEST ============
function initQuestions() {
  state.currentQ = 0;
  state.answers = new Array(questions.length).fill(null);
  loadQuestion();
  startTestTimer();
}

let testTimeLeft = 20*60;
let testTimerInterval;

function startTestTimer() {
  clearInterval(testTimerInterval);
  testTimerInterval = setInterval(()=>{
    testTimeLeft--;
    const m=Math.floor(testTimeLeft/60), s=testTimeLeft%60;
    document.getElementById('test-timer-display').textContent=`${m}:${s.toString().padStart(2,'0')}`;
    if(testTimeLeft<=0){ clearInterval(testTimerInterval); endTest(); }
  },1000);
}

let qTimerInterval;
function startQTimer() {
  state.qSeconds=0;
  clearInterval(qTimerInterval);
  qTimerInterval = setInterval(()=>{
    state.qSeconds++;
    const m=Math.floor(state.qSeconds/60), s=state.qSeconds%60;
    document.getElementById('q-timer').textContent=`⏱ ${m}:${s.toString().padStart(2,'0')}`;
  },1000);
}

function loadQuestion() {
  const q = questions[state.currentQ];
  const total = questions.length;
  const done = state.currentQ;

  document.getElementById('q-label').textContent=`Question ${done+1} of ${total}`;
  document.getElementById('q-subject').textContent=q.subject;
  document.getElementById('q-text').textContent=q.text;
  document.getElementById('next-btn').disabled=true;

  // Update ring
  const offset = 201 - (201*(done/total));
  document.getElementById('ring-progress').style.strokeDashoffset=offset;
  document.getElementById('ring-text').textContent=`${done+1}/${total}`;

  // Options
  const labels=['A','B','C','D'];
  const grid=document.getElementById('options-grid');
  grid.innerHTML='';
  q.options.forEach((opt,i)=>{
    const btn=document.createElement('button');
    btn.className='option-btn';
    btn.innerHTML=`<span class="option-label">${labels[i]}</span>${opt}`;
    btn.onclick=()=>selectAnswer(i,btn);
    grid.appendChild(btn);
  });

  startQTimer();
}

function selectAnswer(idx, btn) {
  document.querySelectorAll('.option-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  state.answers[state.currentQ]=idx;
  document.getElementById('next-btn').disabled=false;
}

function nextQuestion() {
  const q=questions[state.currentQ];
  const ans=state.answers[state.currentQ];
  const btns=document.querySelectorAll('.option-btn');

  if(ans!==null){
    btns[q.correct].classList.add('correct');
    if(ans!==q.correct) btns[ans].classList.add('wrong');
  }

  setTimeout(()=>{
    state.currentQ++;
    if(state.currentQ>=questions.length){ endTest(); }
    else { loadQuestion(); }
  },600);
}

function skipQuestion() {
  state.currentQ++;
  if(state.currentQ>=questions.length){ endTest(); }
  else { loadQuestion(); }
}

async function endTest() {
  clearInterval(testTimerInterval);
  clearInterval(qTimerInterval);
  document.getElementById('question-card').style.display='none';
  document.getElementById('test-result').style.display='block';

  let correct=0;
  state.answers.forEach((a,i)=>{ if(a===questions[i].correct) correct++; });
  const pct=Math.round((correct/questions.length)*100);
  document.getElementById('result-score').textContent=`${pct}% (${correct}/${questions.length})`;

  const subjectScore={};
  questions.forEach((q,i)=>{
    if(!subjectScore[q.subject]) subjectScore[q.subject]={right:0,total:0};
    subjectScore[q.subject].total++;
    if(state.answers[i]===q.correct) subjectScore[q.subject].right++;
  });

  if (state.user.id) {
    fetch(API + '/api/test/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.user.id,
        score: pct,
        correct,
        total: questions.length,
        subjectScores: subjectScore,
        answers: state.answers,
      }),
    }).catch(() => {});
  }

  let weakHtml='<h4 style="margin-bottom:12px;font-family:\'Baloo 2\',cursive">🔍 Learning Gaps Found:</h4>';
  Object.entries(subjectScore).forEach(([sub,sc])=>{
    const pct2=Math.round((sc.right/sc.total)*100);
    const color=pct2<50?'var(--accent-saffron)':pct2<75?'var(--accent-gold)':'var(--accent-teal)';
    weakHtml+=`<div style="display:flex;align-items:center;gap:12px;padding:10px;background:rgba(255,255,255,0.04);border-radius:8px;margin-bottom:8px">
      <span style="flex:1;font-weight:600">${sub}</span>
      <span style="color:${color};font-size:0.85rem">${pct2}%</span>
      <span style="font-size:0.72rem;padding:2px 8px;background:rgba(255,255,255,0.06);border-radius:6px;color:var(--text-secondary)">${pct2<50?'❗ Zyada Practice Karo':pct2<75?'⚠️ Thoda aur padho':'✅ Bahut Accha'}</span>
    </div>`;
  });
  document.getElementById('weak-topics-list').innerHTML=weakHtml;
}

// ============ STUDY PLAN ============
const topics=[
  {icon:'📐',name:'Trigonometry',sub:'Ganit',score:42,status:'weak',priority:'high'},
  {icon:'🔤',name:'Passive Voice',sub:'English',score:38,status:'weak',priority:'high'},
  {icon:'🗳️',name:'Civics — Democracy',sub:'SST',score:55,status:'medium',priority:'med'},
  {icon:'💡',name:'Electricity',sub:'Vigyan',score:68,status:'medium',priority:'med'},
  {icon:'📝',name:'Nibandh Lekhan',sub:'Hindi',score:75,status:'medium',priority:'med'},
  {icon:'📊',name:'Statistics',sub:'Ganit',score:82,status:'strong',priority:'low'},
  {icon:'🌱',name:'Life Processes',sub:'Vigyan',score:88,status:'strong',priority:'low'},
  {icon:'📖',name:'Kabir ki Sakhiyaan',sub:'Hindi',score:91,status:'strong',priority:'low'},
];

function buildTopicList() {
  const colors={weak:'var(--accent-saffron)',medium:'var(--accent-gold)',strong:'var(--accent-teal)'};
  document.getElementById('topic-list').innerHTML=topics.map(t=>`
    <div class="topic-item ${t.status}">
      <div class="topic-icon">${t.icon}</div>
      <div class="topic-info">
        <h4>${t.name}</h4>
        <p>${t.sub}</p>
        <div class="t-bar"><div class="t-fill" style="width:${t.score}%;background:${colors[t.status]}"></div></div>
      </div>
      <div class="topic-status">
        <div class="t-score" style="color:${colors[t.status]}">${t.score}%</div>
        <div class="t-label">Score</div>
        <div class="priority-badge ${t.priority==='high'?'high':t.priority==='med'?'med':'low'}">${t.priority==='high'?'High Priority':t.priority==='med'?'Medium':'Done ✓'}</div>
      </div>
    </div>
  `).join('');
}

function toggleTask(item){
  const check=item.querySelector('.task-check');
  check.classList.toggle('done');
  if(check.classList.contains('done')) check.textContent='✓';
  else check.textContent='';
}

// ============ PRACTICE PAPERS ============
const papers=[
  {year:2024,name:'UP Board Class 10 — Full Paper',subject:'ganit',tags:['Ganit','Vigyan','Hindi'],questions:90,duration:'3 hrs'},
  {year:2023,name:'UP Board Class 10 — Full Paper',subject:'vigyan',tags:['SST','English','Computer'],questions:90,duration:'3 hrs'},
  {year:2022,name:'UP Board Ganit Special Paper',subject:'ganit',tags:['Ganit','Algebra','Geometry'],questions:50,duration:'2 hrs'},
  {year:2022,name:'UP Board Vigyan Chapter-wise',subject:'vigyan',tags:['Physics','Chemistry','Biology'],questions:60,duration:'2.5 hrs'},
  {year:2021,name:'UP Board Hindi Sahitya Paper',subject:'hindi',tags:['Kavita','Gadya','Nibandh'],questions:45,duration:'2 hrs'},
  {year:2021,name:'UP Board English Paper',subject:'english',tags:['Grammar','Reading','Writing'],questions:40,duration:'2 hrs'},
  {year:2020,name:'UP Board SST Paper',subject:'sst',tags:['History','Geography','Civics'],questions:70,duration:'3 hrs'},
  {year:2019,name:'UP Board Computer Paper',subject:'all',tags:['MS Office','Internet','Programming'],questions:35,duration:'1.5 hrs'},
];

function buildPapers(filter='all'){
  const filtered=papers.filter(p=>filter==='all'||p.subject===filter||filter==='all');
  document.getElementById('papers-list').innerHTML=filtered.map(p=>`
    <div class="paper-card">
      <div class="paper-year">${p.year}</div>
      <div class="paper-info">
        <h4>${p.name}</h4>
        <div class="paper-tags">${p.tags.map(t=>`<span class="paper-tag">${t}</span>`).join('')}</div>
      </div>
      <div class="paper-meta">
        <div class="p-qs">${p.questions}</div>
        <div class="p-label">Questions</div>
        <div style="font-size:0.72rem;color:var(--text-dim);margin-top:4px">⏱ ${p.duration}</div>
        <button onclick="showOfflineToast('📝 Paper download ho raha hai...')" style="margin-top:8px;padding:6px 14px;background:rgba(139,92,246,0.2);border:1px solid rgba(139,92,246,0.3);border-radius:8px;color:var(--accent-violet);font-family:inherit;font-size:0.75rem;cursor:pointer">▶ Attempt</button>
      </div>
    </div>
  `).join('');
}

function filterPaper(btn, filter){
  document.querySelectorAll('.filter-chip').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  buildPapers(filter);
}

// ============ VOICE DOUBT ============
function toggleVoice() {
  if(!state.voiceListening){ startVoice(); }
  else { stopVoice(); }
}

function startVoice(){
  state.voiceListening=true;
  const orb=document.getElementById('voice-orb');
  orb.classList.add('listening');
  orb.textContent='🔴';
  document.getElementById('voice-status').textContent='Bol rahe ho... sun raha hun!';
  document.getElementById('voice-hint').textContent='Clearly bolo — phir ruko';

  if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    state.recognition = new SR();
    state.recognition.lang='hi-IN';
    state.recognition.interimResults=false;
    state.recognition.onresult=(e)=>{
      const transcript=e.results[0][0].transcript;
      askVoiceQuestion(transcript);
    };
    state.recognition.onerror=()=>{ stopVoice(); askVoiceQuestion('Pythagorean theorem kya hai?'); };
    state.recognition.onend=()=>{ stopVoice(); };
    state.recognition.start();
  } else {
    setTimeout(()=>{ stopVoice(); askVoiceQuestion('Trigonometry mein sin aur cos ka kya matlab hai?'); }, 2000);
  }
}

function stopVoice(){
  state.voiceListening=false;
  const orb=document.getElementById('voice-orb');
  orb.classList.remove('listening');
  orb.textContent='🎤';
  document.getElementById('voice-status').textContent='Jawab aa raha hai...';
  if(state.recognition) { try{ state.recognition.stop(); }catch(e){} }
}

async function askVoiceQuestion(question){
  stopVoice();
  const result=document.getElementById('voice-result');
  result.classList.add('show');
  document.getElementById('vr-question').textContent='🎤 Aapka Sawaal: '+question;
  document.getElementById('vr-answer').textContent='';
  document.getElementById('vr-ai-loading').style.display='flex';
  document.getElementById('voice-status').textContent='AI soch raha hai...';

  try {
    const resp = await fetch(API + '/api/ai/ask',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ question })
    });
    const d=await resp.json();
    const ans=d.answer||d.error||'Kshama karo, abhi jawab nahi de sakta.';
    document.getElementById('vr-ai-loading').style.display='none';
    document.getElementById('vr-answer').textContent=ans;
    document.getElementById('voice-status').textContent='Jawab tayaar! ✅';
    document.getElementById('voice-hint').textContent='Dobara sawaal poochne ke liye button dabaein';
  } catch(e) {
    document.getElementById('vr-ai-loading').style.display='none';
    document.getElementById('vr-answer').textContent='Net connection check karo. Offline mode mein saved content use karo.';
    document.getElementById('voice-status').textContent='Error — Net check karo';
  }
}

// ============ HANDWRITTEN DOUBT ============
function hwDragOver(e){ e.preventDefault(); document.getElementById('hw-zone').classList.add('dragover'); }
function hwDragLeave(e){ document.getElementById('hw-zone').classList.remove('dragover'); }
function hwDrop(e){ e.preventDefault(); hwDragLeave(); const f=e.dataTransfer.files[0]; if(f) processHWFile(f); }
function hwFileSelect(e){ const f=e.target.files[0]; if(f) processHWFile(f); }

async function processHWFile(file) {
  const reader=new FileReader();
  reader.onload=(e)=>{
    const url=e.target.result;
    document.getElementById('hw-img').src=url;
    document.getElementById('hw-preview').classList.add('show');
    document.getElementById('hw-steps').style.display='none';
    document.getElementById('hw-loading').style.display='flex';
    solveHandwritten(url);
  };
  reader.readAsDataURL(file);
}

async function solveHandwritten(base64url) {
  const base64=base64url.split(',')[1];
  const mimeType=base64url.split(';')[0].split(':')[1];

  try {
    const resp=await fetch(API + '/api/ai/solve-image',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ base64, mimeType })
    });
    const d=await resp.json();
    const sol=d.solution||d.error||'Image clearly nahi dikh rahi. Dobara try karo.';
    document.getElementById('hw-loading').style.display='none';

    const steps=sol.split('\n').filter(s=>s.trim());
    document.getElementById('hw-steps').innerHTML=steps.map((s,i)=>`
      <div class="hw-step">
        <div class="hw-step-num">${i+1}</div>
        <div class="hw-step-text">${s}</div>
      </div>
    `).join('');
    document.getElementById('hw-steps').style.display='flex';
  } catch(e) {
    document.getElementById('hw-loading').style.display='none';
    document.getElementById('hw-steps').innerHTML=`<div class="hw-step"><div class="hw-step-num">!</div><div class="hw-step-text">Net connection check karo ya baad mein try karo.</div></div>`;
    document.getElementById('hw-steps').style.display='flex';
  }
}

// ============ PERFORMANCE CHARTS ============
const weekData=[62,70,68,75,72,80,78];
const weekDays=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function buildPerformance(){}

function renderPerformanceCharts(){
  // Bar chart
  const max=Math.max(...weekData);
  document.getElementById('bar-chart').innerHTML=weekData.map((v,i)=>`
    <div class="bar-wrap">
      <div class="bar" style="height:${(v/max)*100}px"></div>
      <div class="bar-label">${weekDays[i]}</div>
    </div>
  `).join('');

  // Radar
  const subjects=[
    {name:'Ganit',val:0.62},{name:'Vigyan',val:0.78},{name:'Hindi',val:0.85},
    {name:'SST',val:0.55},{name:'Eng',val:0.48}
  ];
  const cx=120,cy=100,r=70;
  const n=subjects.length;
  const angles=subjects.map((_,i)=>((i*2*Math.PI/n)-(Math.PI/2)));

  const gridPts=(scale)=>angles.map(a=>`${cx+r*scale*Math.cos(a)},${cy+r*scale*Math.sin(a)}`).join(' ');
  const dataPts=subjects.map((s,i)=>`${cx+r*s.val*Math.cos(angles[i])},${cy+r*s.val*Math.sin(angles[i])}`).join(' ');
  const axisLines=angles.map(a=>`<line x1="${cx}" y1="${cy}" x2="${cx+r*Math.cos(a)}" y2="${cy+r*Math.sin(a)}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`).join('');
  const labels=subjects.map((s,i)=>{
    const x=cx+(r+14)*Math.cos(angles[i]);
    const y=cy+(r+14)*Math.sin(angles[i]);
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="#a78bca" font-size="9">${s.name}</text>`;
  }).join('');

  document.getElementById('radar-chart').innerHTML=`
    <polygon points="${gridPts(1)}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <polygon points="${gridPts(0.75)}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <polygon points="${gridPts(0.5)}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <polygon points="${gridPts(0.25)}" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    ${axisLines}
    <polygon points="${dataPts}" fill="rgba(139,92,246,0.3)" stroke="var(--accent-violet)" stroke-width="2"/>
    ${labels}
  `;

  // Leaderboard
  const lb=[
    {rank:'🥇',name:'Priya Sharma',school:'DAV Lucknow',score:1580,av:'प'},
    {rank:'🥈',name:'Rohit Kumar',school:'KV Varanasi',score:1520,av:'र'},
    {rank:'🥉',name:'Anjali Singh',school:'GM Inter College',score:1490,av:'अ'},
    {rank:'4',name:'Arjun Verma',school:'Local School',score:1240,av:'A',isYou:true},
    {rank:'5',name:'Deepak Yadav',school:'SDM Inter College',score:1210,av:'D'},
  ];
  document.getElementById('leaderboard').innerHTML=lb.map(l=>`
    <div class="lb-item" ${l.isYou?'style="border:1px solid rgba(139,92,246,0.4);background:rgba(139,92,246,0.1)"':''}>
      <div class="lb-rank">${l.rank}</div>
      <div class="lb-avatar" style="background:linear-gradient(135deg,var(--accent-violet),var(--accent-teal))">${l.av}</div>
      <div class="lb-name">
        ${l.name} ${l.isYou?'<span style="font-size:0.68rem;padding:2px 8px;background:rgba(139,92,246,0.3);border-radius:6px;color:var(--accent-violet)">You</span>':''}
        <div style="font-size:0.72rem;color:var(--text-dim)">${l.school}</div>
      </div>
      <div class="lb-score">${l.score.toLocaleString()} pts</div>
    </div>
  `).join('');
}

// ============ OFFLINE MODAL ============
function showOfflineModal(){ document.getElementById('offline-modal').classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }

function downloadChapter(btn, name){
  btn.textContent='⏳ Downloading...';
  btn.disabled=true;
  const finish = () => {
    btn.textContent='✅ Downloaded';
    btn.style.color='var(--accent-teal)';
    showOfflineToast(`✅ ${name} chapter offline ke liye save ho gaya!`);
    localStorage.setItem(`offline_${name}`,JSON.stringify({
      downloaded: new Date().toISOString(),
      subject: name
    }));
  };
  if (state.user.id) {
    fetch(API + '/api/offline/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.user.id, chapter: name }),
    }).then(finish).catch(() => setTimeout(finish, 1500));
  } else {
    setTimeout(finish, 2000);
  }
}

// ============ TOAST ============
let toastTimeout;
function showOfflineToast(msg, type=''){
  const t=document.getElementById('offline-toast');
  document.getElementById('toast-msg').textContent=msg;
  t.className='offline-toast show '+type;
  clearTimeout(toastTimeout);
  toastTimeout=setTimeout(()=>{ t.className='offline-toast'; },3500);
}

// ============ NETWORK DETECTION ============
window.addEventListener('online',()=>{
  document.getElementById('conn-status').textContent='Online ✓';
  document.querySelector('.offline-dot').style.background='var(--accent-teal)';
  showOfflineToast('📶 Net wapas aa gaya!');
});
window.addEventListener('offline',()=>{
  document.getElementById('conn-status').textContent='Offline';
  document.querySelector('.offline-dot').style.background='#f87171';
  showOfflineToast('📵 Net nahi hai — Offline mode active','offline');
});

// Close modal on overlay click
document.getElementById('offline-modal').addEventListener('click',function(e){
  if(e.target===this) closeModal('offline-modal');
});

// ============ PWA MANIFEST ============
const manifest={
  name:'Vidya AI — UP Board Learning',
  short_name:'VidyaAI',
  description:'UP Board Students ke liye Smart Learning',
  start_url:'/',
  display:'standalone',
  background_color:'#0d0520',
  theme_color:'#8b5cf6',
  icons:[{src:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📚</text></svg>',sizes:'any',type:'image/svg+xml'}]
};
const blob=new Blob([JSON.stringify(manifest)],{type:'application/json'});
document.getElementById('manifest-link').href=URL.createObjectURL(blob);

// ============ SERVICE WORKER ============
if('serviceWorker' in navigator){
  const swCode=`
    const CACHE='vidya-ai-v1';
    const OFFLINE_ASSETS=['/'];
    self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(OFFLINE_ASSETS))); });
    self.addEventListener('fetch',e=>{ e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>new Response('Offline')))); });
  `;
  const swBlob=new Blob([swCode],{type:'application/javascript'});
  const swUrl=URL.createObjectURL(swBlob);
  navigator.serviceWorker.register(swUrl).catch(()=>{});
}

// ============ SESSION RESTORE ============
(function restoreSession(){
  try {
    const saved = localStorage.getItem('vidya_user');
    if (saved) {
      state.user = JSON.parse(saved);
      document.getElementById('inp-name').value = state.user.name || '';
      if (state.user.class) document.getElementById('inp-class').value = state.user.class;
    }
  } catch(e){}
})();

// ============ INIT ============
createParticles();
