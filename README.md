# विद्या AI — UP Board Smart Learning

Gaon ke bacchon ke liye UP Board padhai platform — voice doubt, handwritten solve, diagnostic test, offline chapters.

## Features

- Hindi / Awadhi / Hinglish login
- Diagnostic test with weak-topic analysis
- Voice doubt (AI teacher)
- Handwritten copy photo → step-by-step solution
- Offline chapter download
- Performance charts & leaderboard

## Setup

```bash
npm install
cp .env.example .env
# .env mein ANTHROPIC_API_KEY add karo (optional — bina key demo mode chalega)
npm start
```

Browser: **http://localhost:3000**

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | User login |
| GET | `/api/questions` | Test questions |
| POST | `/api/test/submit` | Save test result |
| GET | `/api/progress/:userId` | User progress |
| POST | `/api/ai/ask` | Voice doubt AI |
| POST | `/api/ai/solve-image` | Handwritten image solve |
| POST | `/api/offline/download` | Save offline chapter |

## GitHub Repository

**Link:** https://github.com/manishaku548-byte/vidhya-ai-up-board

## Deploy

- **Render / Railway / Vercel**: `npm start`, set `ANTHROPIC_API_KEY`
- **GitHub Pages**: sirf static nahi — backend Node server chahiye

## Tech

- Frontend: HTML/CSS/JS (PWA)
- Backend: Node.js + Express
- Storage: JSON file (`data/store.json`)
