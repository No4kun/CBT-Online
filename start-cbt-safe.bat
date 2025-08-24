@echo off
setlocal enabledelayedexpansion
echo ================================
echo CBT Online 安全起動スクリプト
echo ================================

:: ポート3000を使用しているプロセスを確認
echo.
echo [1/3] ポート3000の使用状況をチェック中...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    set pid=%%a
    echo.
    echo ⚠️  ポート3000が使用中です（PID: !pid!）
    
    :: プロセス名を取得
    for /f "tokens=1" %%b in ('tasklist /fi "PID eq !pid!" /fo csv /nh') do (
        set processname=%%b
        set processname=!processname:"=!
        echo    プロセス名: !processname!
    )
    
    echo.
    set /p choice="このプロセスを終了してCBT Onlineを起動しますか？ (Y/N): "
    if /i "!choice!"=="y" (
        echo [2/3] プロセス（PID: !pid!）を終了中...
        taskkill /pid !pid! /f >nul 2>&1
        if !errorlevel! == 0 (
            echo ✅ プロセスを正常に終了しました
            timeout /t 2 >nul
        ) else (
            echo ❌ プロセスの終了に失敗しました
            pause
            exit /b 1
        )
    ) else (
        echo ❌ ユーザーによりキャンセルされました
        pause
        exit /b 1
    )
)

echo [3/3] CBT Online を起動中...
echo.
cd /d "c:\Users\zuino\Desktop\VSCode_Projects\CBT-Online"

:: 起動試行
npm run dev

:: 起動失敗時の処理
if !errorlevel! neq 0 (
    echo.
    echo ❌ CBT Onlineの起動に失敗しました
    echo    エラーコード: !errorlevel!
    echo.
    echo 可能な解決策:
    echo  1. 他のプロセスがポート3000を使用していないか確認
    echo  2. Node.jsが正しくインストールされているか確認
    echo  3. プロジェクトディレクトリでnpm installを実行
    echo.
)

pause
