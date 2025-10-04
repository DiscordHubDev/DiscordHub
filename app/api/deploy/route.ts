import { NextResponse } from 'next/server';
import path from 'path';
import { spawn } from 'child_process';

// (可選) 你可以設定一個 SECRET 來驗證 Webhook
const DEPLOY_SECRET = process.env.CRON_SECRET || '';

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');

  // 驗證 Secret（可防止惡意請求）
  if (DEPLOY_SECRET && secret !== DEPLOY_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  try {
    // 確保執行路徑正確
    const cwd = path.resolve(process.cwd(), '/home/container');

    const deploy = spawn('bash', ['deploy.sh'], { cwd });

    deploy.stdout.on('data', (data) => {
      console.log(`[deploy.sh] ${data}`);
    });

    deploy.stderr.on('data', (data) => {
      console.error(`[deploy.sh ERROR] ${data}`);
    });

    deploy.on('close', (code) => {
      console.log(`deploy.sh exited with code ${code}`);
    });

    return NextResponse.json({ message: 'Deployment started 🚀' });
  } catch (err) {
    console.error('Deploy failed:', err);
    return NextResponse.json({ error: 'Deploy failed' }, { status: 500 });
  }
}