@echo off
chcp 65001 > nul
title 여운 감성 분석기 - GitHub 푸시 도구

cd /d "%~dp0"

echo ==============================================================================
echo 🚀 [여운 감성 분석기] GitHub로 최종 업로드(Push)합니다!
echo 🎯 대상 저장소: https://github.com/rywno0/Hu-s-First-Web-Prototype_2.git
echo ==============================================================================
echo.

REM 1. Git 설치 확인
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [오류] Git이 설치되어 있지 않습니다.
    pause
    exit /b
)

REM 2. 원격 저장소 URL 확실하게 확인 및 재설정
git remote set-url origin https://github.com/rywno0/Hu-s-First-Web-Prototype_2.git

echo.
echo [Push 진행 중...] GitHub 로그인 창이 뜨면 브라우저로 로그인 승인을 눌러주세요!
echo.

REM 3. GitHub로 푸시 실행
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ==============================================================================
    echo 🎉 축하합니다! GitHub 업로드가 성공적으로 완료되었습니다!
    echo 🌐 확인 주소: https://github.com/rywno0/Hu-s-First-Web-Prototype_2
    echo ==============================================================================
) else (
    echo.
    echo [안내] 푸시 도중 로그인이 필요하거나 오류가 발생했습니다.
    echo GitHub 로그인 창이 뜨면 'Sign in with your browser'를 눌러주세요.
)

echo.
pause
