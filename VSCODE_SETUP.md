# VS Code mein kaise kholein

## Step 1 — Folder open karein

1. VS Code kholo
2. **File → Open Folder**
3. Ye folder select karo: `hack (1)` (poora project folder)

Ya double-click: `vidhya-ai-up-board.code-workspace`

## Step 2 — Files structure

```
hack (1)/
├── server.js          ← Backend (Node.js)
├── package.json
├── public/
│   ├── index.html     ← Main page (HTML)
│   ├── css/
│   │   └── style.css  ← Saari styling
│   └── js/
│       └── app.js     ← Saari JavaScript
├── hack/              ← Same files (edit yahan bhi kar sakte ho)
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
└── data/              ← User data save hota hai
```

## Step 3 — App chalana

Terminal (VS Code: Ctrl + `):

```bash
npm install
npm start
```

Browser: **http://localhost:3000**

## Step 4 — Debug (optional)

- **Run → Start Debugging** (F5) → "Vidya AI Server"

## Edit kahan karein

| Kaam | File |
|------|------|
| Design / colors | `public/css/style.css` |
| Buttons / logic | `public/js/app.js` |
| Page layout | `public/index.html` |
| API / backend | `server.js` |
