import svgCaptcha from '@/lib/svg-captcha';
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import crypto from 'crypto';

// Use a secret for HMAC signing of the answer
const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || 'captcha-secret-key-change-me';

export const dynamic = 'force-dynamic';

import path from 'path';

// Fix for Next.js app directory where node_modules paths can be tricky
try {
  // Use font copied to public directory for reliability
  const fontPath = path.join(process.cwd(), 'public', 'Comismsh.ttf');
  svgCaptcha.loadFont(fontPath);
} catch (e) {
  console.error('Failed to load font:', e);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const theme = searchParams.get('theme');
  
  // Choose colors based on theme
  // Dark mode: background #1E1E1E (MUI Paper dark), text color handled by svg-captcha color=true
  // Light mode: background #F0F0F0 or #FFFFFF
  
  const isDark = theme === 'dark';
  const background = isDark ? '#2e2e2e' : '#f0f0f0'; // slightly lighter gray for dark mode readability
  
  const captcha = svgCaptcha.createMathExpr({
    size: 6, 
    ignoreChars: '0o1i', 
    noise: 2, 
    color: true, 
    background: background, 
    mathMin: 1,
    mathMax: 9,
    mathOperator: '+',
  });

  // Hash the text validation to avoid client-side tampering
  const hash = crypto.createHmac('sha256', CAPTCHA_SECRET)
    .update(captcha.text)
    .digest('hex');

  // Set cookie with the hash
  const cookie = serialize('captcha', hash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 300, // 5 minutes
    path: '/',
  });

  const response = new NextResponse(captcha.data, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store, max-age=0',
    },
  });

  response.headers.set('Set-Cookie', cookie);

  return response;
}
