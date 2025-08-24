@echo off
setlocal enabledelayedexpansion
echo ================================
echo CBT Online 自動起動スクリプト
echo ================================

:: ポート3000を使用しているプロセスを自動終了
echo [1/2] ポート3000のクリーンアップ中...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    set pid=%%a
    echo    既存プロセス（PID: !pid!）を終了中...
    taskkill /pid !pid! /f >nul 2>&1
    if !errorlevel! == 0 (
        echo    ✅ プロセスを終了しました
    )
)

echo [2/2] CBT Online を起動中...
echo.
cd /d "c:\Users\zuino\Desktop\VSCode_Projects\CBT-Online"

:: 少し待ってから起動
timeout /t 1 >nul
npm run dev

pause
