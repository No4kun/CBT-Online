@echo off
echo CBT Online 起動前チェック...

:: ポート3000を使用しているプロセスを確認
echo ポート3000の使用状況をチェック中...
netstat -ano | findstr :3000

:: ポート3000が使用中の場合、終了するか確認
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo.
    echo ポート3000が使用中です（PID: %%a）
    set /p choice="このプロセスを終了しますか？ (y/n): "
    if /i "!choice!"=="y" (
        taskkill /pid %%a /f
        echo プロセスを終了しました
    )
)

echo.
echo CBT Online を起動中...
cd /d "c:\Users\zuino\Desktop\VSCode_Projects\CBT-Online"
npm run dev
pause
