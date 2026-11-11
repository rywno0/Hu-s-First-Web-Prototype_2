@echo off
chcp 65001 > nul
title 여운 감성 분석기 로컬 서버

REM 1. 현재 배치 파일이 있는 프로젝트 폴더로 작업 위치를 강제 이동합니다. (경로 오류 완벽 방지)
cd /d "%~dp0"

echo ====================================================
echo 🚀 [여운 감성 분석기] 로컬 서버를 준비 중입니다...
echo ====================================================

REM 2. Node.js 경로를 환경 변수에 자동으로 등록합니다.
set "PATH=C:\Program Files\nodejs;%PATH%"

REM 3. Node.js 설치 확인
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [오류] Node.js를 찾을 수 없습니다.
    echo C:\Program Files\nodejs\node.exe 파일이 있는지 확인해 주세요.
    pause
    exit /b
)

echo.
echo [서버 실행 중...] 이 검은 창을 닫지 마시고 최소화해 두세요!
echo 🌐 브라우저 주소: http://localhost:3000
echo.

REM 4. 서버 실행
node server.js

pause
