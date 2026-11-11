// ==============================================================================
// 로컬 개발용 서버 (server.js)
// ==============================================================================
// UTF-8 멀티바이트(한글, 이모지) 데이터를 온전히 처리하는 안정적인 로컬 서버입니다.
// ==============================================================================

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import analyzeHandler from './api/analyze.js';
import dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// 지원하는 파일 확장자별 MIME 타입 (UTF-8 인코딩 명시)
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // 1. 감성 분석 API 엔드포인트 라우팅 (/api/analyze)
  if (pathname === '/api/analyze') {
    const chunks = [];
    req.on('data', chunk => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      // 버퍼를 합친 후 안전하게 UTF-8 문자열로 디코딩 (한글 깨짐 원천 방지)
      const rawBody = Buffer.concat(chunks).toString('utf-8');

      // Vercel Serverless Function 형식의 req, res 모방 객체 구성
      const mockReq = {
        method: req.method,
        headers: req.headers,
        body: rawBody
      };

      const mockRes = {
        statusCode: 200,
        headers: {},
        setHeader(name, value) {
          this.headers[name] = value;
          return this;
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          res.writeHead(this.statusCode, {
            'Content-Type': 'application/json; charset=utf-8',
            ...this.headers
          });
          res.end(JSON.stringify(data));
        }
      };

      try {
        await analyzeHandler(mockReq, mockRes);
      } catch (err) {
        console.error('Server error during analysis:', err);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: '서버 내부 오류가 발생했습니다.'
          }
        }));
      }
    });
    return;
  }

  // 2. 정적 웹 파일 서빙 (HTML, CSS, JS 등)
  let filePath = pathname === '/' ? path.join(__dirname, 'index.html') : path.join(__dirname, pathname);
  
  // 보안: 디렉토리 탐색(../) 방지
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 [여운 감성 분석기] 로컬 서버가 정상 작동 중입니다!`);
  console.log(`🌐 브라우저 주소: http://localhost:${PORT}`);
  console.log('💡 서버를 종료하려면 터미널에서 Ctrl + C 를 누르세요.');
  console.log('====================================================');
});
