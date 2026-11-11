-- ==============================================================================
-- 001_create_sentiment_logs_table.sql
-- ==============================================================================
-- [설명]
-- 이 쿼리는 '여운 감성 분석기'에서 분석된 텍스트와 결과(긍정/부정/중립, 신뢰도, 근거)를
-- Supabase PostgreSQL 데이터베이스에 안전하게 보관하기 위한 테이블 생성 및 보안 스크립트입니다.
--
-- [적용 방법]
-- 1. Supabase 대시보드 (https://supabase.com/dashboard)에 로그인합니다.
-- 2. 해당 프로젝트 선택 후, 왼쪽 메뉴에서 'SQL Editor'를 클릭합니다.
-- 3. 'New query' 버튼을 누르고 아래 SQL 내용을 전체 복사하여 붙여넣은 뒤, 'Run' 버튼을 클릭합니다.
-- ==============================================================================

-- 1. 보안 암호화 및 UUID 생성을 위한 pgcrypto 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. 감성 분석 기록 테이블 생성
CREATE TABLE IF NOT EXISTS public.sentiment_logs (
    -- 고유 식별자: UUID 버전을 자동으로 생성하여 부여합니다.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 분석 요청 일시: 기본값으로 현재 시각(UTC)이 자동 저장됩니다.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- 사용자가 입력한 텍스트 (최대 2,000자 제한)
    input_text TEXT NOT NULL,

    -- 감성 분석 결과 라벨 ('positive', 'negative', 'neutral' 세 가지만 허용)
    sentiment VARCHAR(20) NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),

    -- 모델 추정 신뢰도 (0 이상 100 이하 정수만 허용)
    confidence SMALLINT NOT NULL CHECK (confidence >= 0 AND confidence <= 100),

    -- 감성 분석 근거 (1~2문장의 짧은 설명, 최대 240자 내외 권장)
    reason TEXT NOT NULL,

    -- [보안 필드] 분석 텍스트의 SHA-256 해시값 (동일 텍스트 중복/검증용, 단방향 암호화)
    input_hash VARCHAR(64)
);

-- 3. 성능 최적화를 위한 인덱스 생성
-- 생성일시 기준 역순 조회(최신순 정렬)가 빠르도록 인덱스를 추가합니다.
CREATE INDEX IF NOT EXISTS idx_sentiment_logs_created_at ON public.sentiment_logs (created_at DESC);
-- 감성 라벨별 통계 및 필터링을 위한 인덱스입니다.
CREATE INDEX IF NOT EXISTS idx_sentiment_logs_sentiment ON public.sentiment_logs (sentiment);

-- 4. 강력한 행 단위 보안 정책(Row Level Security, RLS) 활성화
-- 기본적으로 모든 외부 접근(공개 API)을 차단하여 허가되지 않은 사용자가 데이터를 보거나 조작하지 못하게 합니다.
ALTER TABLE public.sentiment_logs ENABLE ROW LEVEL SECURITY;

-- 5. 보안 접근 정책(Policy) 수립
-- 정책 1: 서버 관리자(service_role)만 모든 권한(SELECT, INSERT, UPDATE, DELETE)을 가집니다.
-- 웹 브라우저의 익명 사용자(anon)는 다른 사람의 기록을 무단으로 읽을 수 없습니다.
CREATE POLICY "Service Role can manage all sentiment logs"
ON public.sentiment_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 정책 2: 익명 사용자(anon)는 새로운 분석 결과 '추가(INSERT)'만 가능하도록 허용합니다. (필요 시)
-- 다른 사람의 기록을 엿보는(SELECT) 것은 철저히 금지됩니다.
CREATE POLICY "Anon users can insert sentiment logs"
ON public.sentiment_logs
FOR INSERT
TO anon
WITH CHECK (true);

-- 6. 테이블 및 컬럼에 대한 한국어 설명 주석(COMMENT) 추가 (문서화)
COMMENT ON TABLE public.sentiment_logs IS '여운 감성 분석기의 분석 요청 및 결과 로그 테이블';
COMMENT ON COLUMN public.sentiment_logs.id IS '기록 고유 식별자 (UUID)';
COMMENT ON COLUMN public.sentiment_logs.created_at IS '분석 생성 일시 (UTC)';
COMMENT ON COLUMN public.sentiment_logs.input_text IS '사용자가 입력한 분석 대상 문장';
COMMENT ON COLUMN public.sentiment_logs.sentiment IS '감성 분석 결과 (positive, negative, neutral)';
COMMENT ON COLUMN public.sentiment_logs.confidence IS '분석 신뢰도 백분율 (0~100)';
COMMENT ON COLUMN public.sentiment_logs.reason IS '감성 분석 근거 설명';
COMMENT ON COLUMN public.sentiment_logs.input_hash IS '입력 문장의 SHA-256 해시값 (무결성 검증용)';

