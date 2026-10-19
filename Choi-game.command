#!/bin/bash
# Double-click trên Mac (hoặc: ./Choi-game.command)
cd "$(dirname "$0")"
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

if ! command -v node >/dev/null 2>&1; then
  echo "Chưa có Node.js. Cài từ https://nodejs.org rồi chạy lại."
  read -r -p "Nhấn Enter để đóng…"
  exit 1
fi

if [ ! -d node_modules ] || [ ! -d node_modules/@rolldown/binding-darwin-arm64 ] && [ ! -d node_modules/@rolldown/binding-darwin-x64 ]; then
  echo "Đang cài / sửa thư viện cho Mac (lần đầu có thể mất vài phút)…"
  npm install
fi

echo ""
echo "Mở game: http://localhost:5173"
echo "Đóng cửa sổ này để tắt server."
echo ""
npm run dev -- --host 127.0.0.1 --port 5173
read -r -p "Nhấn Enter để đóng…"
