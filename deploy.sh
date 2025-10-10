# =========================================

APP_NAME="nextjs-app" # PM2 app 名稱
BRANCH="master"         # Git 分支，可改成你的

echo "========================================="
echo "🔁 Starting deployment for $APP_NAME ..."
echo "========================================="

# 1️⃣ 拉最新代碼
if [ -d .git ]; then
  echo "🌀 Pulling latest code from branch '$BRANCH'..."
  git pull
else
  echo "⚠️ No .git folder found. Skipping git pull."
fi

# 2️⃣ 安裝依賴
if [ -f package.json ]; then
  echo "📦 Installing dependencies with bun..."
  bun install
else
  echo "⚠️ No package.json found. Skipping bun install."
fi

# 3️⃣ 編譯 Next.js
if [ -f package.json ]; then
  echo "🧱 Building Next.js app..."
  bun run build
fi

# 4️⃣ 啟動或平滑重啟 PM2
if pm2 list | grep -q "$APP_NAME"; then
  echo "♻️ Reloading PM2 app (zero downtime)..."
  pm2 reload $APP_NAME --update-env
else
  echo "🚀 Starting PM2 app for the first time..."
  pm2 start "bunx next start -p ${SERVER_PORT:-3000}" --name "$APP_NAME"
fi

echo "✅ Deployment complete! App is running under PM2."
echo "========================================="
pm2 list