// ==============================================================================
// 여운 감성 분석기 클라이언트 스크립트 (app.js)
// ==============================================================================
// 브라우저에서 사용자 입력을 검증하고, 백엔드 API(/api/analyze)를 호출하여
// 감성 분석 결과를 화면에 동적으로 렌더링합니다.
// ==============================================================================

/**
 * 텍스트의 유니코드 코드 포인트 기준 글자 수를 계산합니다.
 * 이모지나 한글 음절이 섞여 있어도 정확한 글자 수를 반환합니다.
 * @param {string} text 
 * @returns {number}
 */
function getCodePointLength(text) {
  return [...text].length;
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. 주요 HTML DOM 요소 참조
  const form = document.getElementById('sentiment-form');
  const textInput = document.getElementById('text-input');
  const charCount = document.getElementById('char-count');
  const errorMessage = document.getElementById('error-message');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.spinner');
  const resetBtn = document.getElementById('reset-btn');

  const resultSection = document.getElementById('result-section');
  const sentimentBox = document.getElementById('sentiment-box');
  const sentimentTag = document.getElementById('sentiment-tag');
  const confidenceValue = document.getElementById('confidence-value');
  const confidenceBarFill = document.getElementById('confidence-bar-fill');
  const confidenceBar = document.getElementById('confidence-bar');
  const reasonText = document.getElementById('reason-text');
  const copyResultBtn = document.getElementById('copy-result-btn');
  const copyBtnText = document.getElementById('copy-btn-text');

  const exampleChips = document.querySelectorAll('.example-chip');

  const MAX_CHARS = 2000;
  let lastAnalysisData = null;

  // 2. 글자 수 실시간 카운트 및 UI 반영
  function updateCharCount() {
    const currentLength = getCodePointLength(textInput.value);
    charCount.textContent = `${currentLength.toLocaleString()} / ${MAX_CHARS.toLocaleString()}자`;

    if (currentLength > MAX_CHARS) {
      charCount.classList.add('limit-reached');
      charCount.classList.remove('limit-near');
    } else if (currentLength >= MAX_CHARS * 0.9) {
      charCount.classList.add('limit-near');
      charCount.classList.remove('limit-reached');
    } else {
      charCount.classList.remove('limit-near', 'limit-reached');
    }
  }

  textInput.addEventListener('input', () => {
    updateCharCount();
    if (!errorMessage.hidden) {
      hideError();
    }
  });

  // 3. 빠른 예시 문장 칩 클릭 이벤트 핸들러
  exampleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const exampleText = chip.getAttribute('data-text');
      if (exampleText) {
        textInput.value = exampleText;
        updateCharCount();
        hideError();
        textInput.focus();
      }
    });
  });

  // 4. 다시 쓰기(지우기) 버튼 핸들러
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      textInput.value = '';
      updateCharCount();
      hideError();
      resultSection.hidden = true;
      lastAnalysisData = null;
      textInput.focus();
    });
  }

  // 5. 결과 복사하기 버튼 핸들러
  if (copyResultBtn) {
    copyResultBtn.addEventListener('click', async () => {
      if (!lastAnalysisData) return;

      const sentimentKorean = {
        positive: '긍정 😊',
        negative: '부정 😢',
        neutral: '중립 😐'
      }[lastAnalysisData.sentiment] || lastAnalysisData.sentiment;

      const copyText = `[여운 감성 분석 결과]\n• 감성 방향: ${sentimentKorean}\n• 신뢰도: ${lastAnalysisData.confidence}%\n• 분석 근거: ${lastAnalysisData.reason}`;

      try {
        await navigator.clipboard.writeText(copyText);
        copyBtnText.textContent = '복사 완료! ✓';
        setTimeout(() => {
          copyBtnText.textContent = '결과 복사';
        }, 2000);
      } catch (err) {
        console.error('클립보드 복사 실패:', err);
      }
    });
  }

  // 6. 에러 메시지 제어 함수
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
  }

  function hideError() {
    errorMessage.textContent = '';
    errorMessage.hidden = true;
  }

  // 7. 로딩 상태 제어
  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      textInput.disabled = true;
      if (resetBtn) resetBtn.disabled = true;
      btnText.textContent = '분석 중...';
      spinner.hidden = false;
      hideError();
    } else {
      submitBtn.disabled = false;
      textInput.disabled = false;
      if (resetBtn) resetBtn.disabled = false;
      btnText.textContent = '감성 분석하기';
      spinner.hidden = true;
    }
  }

  // 8. 감성 분석 결과 렌더링
  function displayResult({ sentiment, confidence, reason }) {
    lastAnalysisData = { sentiment, confidence, reason };

    const sentimentMap = {
      positive: { label: '긍정 😊', className: 'sentiment-positive' },
      negative: { label: '부정 😢', className: 'sentiment-negative' },
      neutral: { label: '중립 😐', className: 'sentiment-neutral' }
    };

    const targetSentiment = sentimentMap[sentiment] || sentimentMap.neutral;

    sentimentBox.className = 'sentiment-box ' + targetSentiment.className;
    sentimentTag.textContent = targetSentiment.label;

    confidenceValue.textContent = `${confidence}%`;
    confidenceBarFill.style.width = `${confidence}%`;
    confidenceBar.setAttribute('aria-valuenow', confidence);

    reasonText.textContent = reason;

    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 9. 감성 분석 폼 제출(Submit) 핸들러
  async function handleSubmit(event) {
    if (event) {
      event.preventDefault();
    }

    const rawText = textInput.value;
    const trimmedText = rawText.trim();
    const length = getCodePointLength(trimmedText);

    if (trimmedText.length === 0) {
      showError('분석할 문장을 입력해 주세요.');
      textInput.focus();
      return;
    }

    if (length > MAX_CHARS) {
      showError('입력은 2,000자 이내로 작성해 주세요.');
      textInput.focus();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: trimmedText })
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.error?.message || '분석을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.';
        showError(message);
        return;
      }

      displayResult(data);

    } catch (networkError) {
      showError('서버와의 통신이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }

  form.addEventListener('submit', handleSubmit);

  // 10. 단축키: Ctrl + Enter / Cmd + Enter
  textInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  });

  // 초기 글자수 반영
  updateCharCount();
});
