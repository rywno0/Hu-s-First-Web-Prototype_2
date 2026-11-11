// ==============================================================================
// 검증 스크립트 (tests/verify.js)
// ==============================================================================
// docs/06-검증-배포-완료기준.md에 명시된 기능 및 보안 요구사항을 자동으로 검증합니다.
// ==============================================================================

import handler from '../api/analyze.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ [통과] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [실패] ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 여운 감성 분석기 백엔드 & 보안 자동 검증 시작');
  console.log('====================================================\n');

  // Helper 함수: 가상 요청/응답 객체 생성
  function createMock(reqOptions) {
    let statusCode = 200;
    let headers = {};
    let responseData = null;

    const req = {
      method: reqOptions.method || 'POST',
      body: reqOptions.body,
      headers: reqOptions.headers || {}
    };

    const res = {
      setHeader(k, v) { headers[k] = v; return this; },
      status(code) { statusCode = code; return this; },
      json(data) { responseData = data; return this; }
    };

    return { req, res, getResult: () => ({ statusCode, headers, responseData }) };
  }

  // 1. GET 요청 차단 (405 Method Not Allowed) 검증
  {
    const mock = createMock({ method: 'GET' });
    await handler(mock.req, mock.res);
    const result = mock.getResult();
    assert(result.statusCode === 405, '1. GET 요청 시 405 Method Not Allowed 반환');
    assert(result.headers['Allow'] === 'POST', '1-1. Allow: POST 응답 헤더 포함');
  }

  // 2. 빈 문자열 및 공백 입력 차단 (400 Invalid Input) 검증
  {
    const mock1 = createMock({ method: 'POST', body: { text: '' } });
    await handler(mock1.req, mock1.res);
    assert(mock1.getResult().statusCode === 400, '2. 빈 텍스트 입력 시 400 Bad Request 반환');
    assert(mock1.getResult().responseData?.error?.code === 'INVALID_INPUT', '2-1. 에러 코드가 INVALID_INPUT');

    const mock2 = createMock({ method: 'POST', body: { text: '    \n\t  ' } });
    await handler(mock2.req, mock2.res);
    assert(mock2.getResult().statusCode === 400, '2-2. 공백만 입력 시 400 Bad Request 반환');
  }

  // 3. 2,000자 초과 입력 차단 (413 Payload Too Large) 및 유니코드/이모지 계산 검증
  {
    const text2000 = '가'.repeat(2000);
    const text2001 = '가'.repeat(2001);

    // 2001자는 413을 반환해야 함
    const mockOver = createMock({ method: 'POST', body: { text: text2001 } });
    await handler(mockOver.req, mockOver.res);
    assert(mockOver.getResult().statusCode === 413, '3. 2,001자 입력 시 413 Payload Too Large 반환');
    assert(mockOver.getResult().responseData?.error?.code === 'TEXT_TOO_LONG', '3-1. 에러 코드가 TEXT_TOO_LONG');

    // 이모지가 포함된 글자 수 검증 (이모지 1개 = 코드포인트 1개)
    const emojiText = '😀'.repeat(2001);
    const mockEmoji = createMock({ method: 'POST', body: { text: emojiText } });
    await handler(mockEmoji.req, mockEmoji.res);
    assert(mockEmoji.getResult().statusCode === 413, '3-2. 이모지 2,001개 입력 시에도 코드포인트 기준으로 413 반환');
  }

  // 4. 잘못된 JSON 본문 (400) 검증
  {
    const mockInvalid = createMock({ method: 'POST', body: null });
    await handler(mockInvalid.req, mockInvalid.res);
    assert(mockInvalid.getResult().statusCode === 400, '4. 잘못된 본문(null) 요청 시 400 반환');
  }

  console.log('\n====================================================');
  console.log(`📊 검증 완료: 총 ${passed + failed}개 중 ${passed}개 통과, ${failed}개 실패`);
  console.log('====================================================');
}

runTests().catch(console.error);

