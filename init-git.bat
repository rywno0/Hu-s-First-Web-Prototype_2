@echo off
chcp 65001 > nul
title 여운 감성 분석기 - Git 초기화 및 첫 커밋 생성기

echo ==============================================================================
echo 📦 [여운 감성 분석기] Git 초기화 및 첫 커밋을 준비합니다!
echo ==============================================================================
echo.
echo * 보안 확인: .env(비밀 키) 파일은 .gitignore에 의해 안전하게 제외됩니다.
echo.

REM 1. Git 설치 여부 확인
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [알림] 컴퓨터에 Git이 아직 설치되어 있지 않거나 경로가 등록되지 않았습니다.
    echo.
    echo 👉 Git 공식 다운로드: https://git-scm.com/download/win
    echo (위 링크에서 다운로드 후 'Next'만 눌러 설치를 완료하시면 됩니다.)
    echo.
    echo 또는 'GitHub Desktop' 프로그램을 사용하셔도 편리합니다:
    echo 👉 https://desktop.github.com/
    echo.
    pause
    exit /b
)

REM 2. Git 저장소 초기화
echo [1/4] Git 저장소를 초기화합니다 (git init)...
git init

REM 3. 기본 브랜치 이름을 main으로 설정
echo [2/4] 기본 브랜치를 main으로 설정합니다 (git branch -M main)...
git branch -M main

REM 4. 모든 프로젝트 파일 스테이징 (.env는 .gitignore에 의해 자동 제외됨)
echo [3/4] 변경 사항을 추가합니다 (git add .)...
git add .

REM 5. 첫 커밋 생성
echo [4/4] 첫 번째 커밋을 생성합니다...
git commit -m "feat: 여운 감성 분석기 완성 (화이트 테마, 240초 은하 공전 및 별빛 반짝임)"

echo.
echo ==============================================================================
echo 🎉 로컬 Git 초기화 및 첫 커밋이 성공적으로 완료되었습니다!
echo.
echo 이제 GitHub에 업로드(Push)하려면 다음 단계를 진행하세요:
echo 1. GitHub (https://github.com/new)에서 새 저장소를 만듭니다.
echo 2. 터미널에 아래 두 줄의 명령어를 입력합니다:
echo.
echo    git remote add origin https://github.com/내아이디/저장소이름.git
echo    git push -u origin main
echo.
echo ==============================================================================
echo.
pause

