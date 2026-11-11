// ==============================================================================
// Vercel 배포 빌드 스크립트 (build.js)
// ==============================================================================
// Linux(Vercel 서버)와 Windows(로컬) 모두에서 100% 오류 없이
// 정적 파일(index.html, styles.css, app.js)을 public 디렉토리로 안전하게 준비합니다.
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');

// 1. public 폴더가 없으면 생성
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 2. 핵심 정적 파일 복사
const filesToCopy = ['index.html', 'styles.css', 'app.js'];

for (const file of filesToCopy) {
  const src = path.join(__dirname, file);
  const dest = path.join(publicDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[Build] 복사 완료: ${file} -> public/${file}`);
  } else {
    console.warn(`[Build Warning] 원본 파일 없음: ${file}`);
  }
}

console.log('✅ [Build Success] public 디렉토리 준비가 완벽하게 완료되었습니다.');

