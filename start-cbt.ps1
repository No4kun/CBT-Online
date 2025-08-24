# CBT Online アプリケーション起動スクリプト
Write-Host "CBT Online アプリケーションを起動しています..." -ForegroundColor Green

# プロジェクトディレクトリに移動
Set-Location "c:\Users\zuino\Desktop\VSCode_Projects\CBT-Online"

# 依存関係をチェック
if (!(Test-Path "node_modules")) {
    Write-Host "依存関係をインストール中..." -ForegroundColor Yellow
    npm install
}

# 開発サーバーを起動
Write-Host "開発サーバーを起動中..." -ForegroundColor Cyan
npm run dev

# エラーハンドリング
if ($LASTEXITCODE -ne 0) {
    Write-Host "エラーが発生しました。何かキーを押してください..." -ForegroundColor Red
    Read-Host
}
