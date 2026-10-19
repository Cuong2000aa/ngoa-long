@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules (
  echo Dang cai thu vien lan dau...
  call npm install
)
echo Mo game tai http://localhost:5173  (dong cua so nay de tat game)
call npm run dev
