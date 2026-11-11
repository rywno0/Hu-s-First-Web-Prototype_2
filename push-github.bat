@echo off
chcp 65001 > nul
title 여운 감성 분석기 - GitHub 자동 업로드 도구

echo ==============================================================================
echo 🚀 [여운 감성 분석기] GitHub 업로드를 시작합니다!
echo 🎯 대상 저장소: https://github.com/rywno0/Hu-s-First-Web-Prototype_2.git
echo ==============================================================================
echo.
echo * 보안 확인: .env 파일과 node_modules 폴더는 .gitignore에 의해 자동 제외됩니다.
echo.

REM 1. Git 설치 여부 확인
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [오류] 컴퓨터에 Git이 아직 설치되어 있지 않습니다.
    echo 👉 Git 공식 다운로드: https://git-scm.com/download/win
    echo 위 사이트에서 설치 후 다시 실행해 주세요.
    echo.
    pause
    exit /b
)

REM 2. Git 저장소 초기화 (이미 되어 있으면 건너뜁니다)
if not exist ".git" (
    echo [1/5] Git 저장소를 초기화합니다...
    git init
) else (
    echo [1/5] 이미 초기화된 Git 저장소입니다.
)

REM 3. 기본 브랜치를 main으로 설정
echo [2/5] 기본 브랜치를 main으로 설정합니다...
git branch -M main

REM 4. .env와 node_modules를 제외한 모든 프로젝트 파일 추가
echo [3/5] 변경된 파일들을 추가합니다 (.env, node_modules 자동 제외)...
git add .

REM 5. 커밋 생성
echo [4/5] 커밋 스냅샷을 생성합니다...
git commit -m "feat: 여운 감성 분석기 완성 (화이트 테마, 240초 은하수 공전 및 별빛 반짝임)"

REM 6. 원격 저장소 URL 연결 (기존 origin이 있으면 재설정)
echo [5/5] 원격 저장소와 연결하고 업로드(Push)합니다...
git remote remove origin >nul 2>nul
git remote add origin https://github.com/rywno0/Hu-s-First-Web-Prototype_2.git

REM 7. GitHub로 푸시
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ==============================================================================
    echo 🎉 GitHub 업로드(Push)가 성공적으로 완료되었습니다!
    echo 저장소 주소: https://github.com/rywno0/Hu-s-First-Web-Prototype_2
    echo ==============================================================================
) else (
    echo.
    echo [안내] GitHub 로그인 창이 뜨면 로그인을 진행해 주시거나,
    echo 이미 원격 저장소에 다른 파일(README 등)이 있는 경우 아래 명령어로 합친 후 다시 시도해 보세요:
    echo git pull origin main --allow-unrelated-histories
    echo git push -u origin main
)

echo.
pause

