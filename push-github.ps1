# Vidya AI — GitHub par upload (ek baar chalao)
# Pehle: https://github.com/login/device par code daalo (gh auth login ke baad)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "`n=== Vidya AI GitHub Upload ===`n" -ForegroundColor Cyan

$auth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "GitHub login chahiye. Browser khulega / device code milega.`n" -ForegroundColor Yellow
    gh auth login --hostname github.com --git-protocol https --web
}

$user = (gh api user -q .login)
Write-Host "Logged in as: $user`n" -ForegroundColor Green

git remote remove origin 2>$null
gh repo create vidhya-ai-up-board --public --source=. --remote=origin --push --description "UP Board AI Learning - Vidya AI" 2>$null
if ($LASTEXITCODE -ne 0) {
  git remote set-url origin "https://github.com/$user/vidhya-ai-up-board.git"
  git push -u origin main
}

$url = "https://github.com/$user/vidhya-ai-up-board"
Write-Host "`nDone! Repository link:`n$url`n" -ForegroundColor Green
Start-Process $url
