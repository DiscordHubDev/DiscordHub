import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

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

    // 執行部署腳本
    exec('bash deploy.sh', { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error('Deploy error:', stderr);
      } else {
        console.log('Deploy success:', stdout);
      }
    });

    return NextResponse.json({ message: 'Deployment started 🚀' });
  } catch (err) {
    console.error('Deploy failed:', err);
    return NextResponse.json({ error: 'Deploy failed' }, { status: 500 });
  }
}