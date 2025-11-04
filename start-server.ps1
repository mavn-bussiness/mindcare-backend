# Production-ready server startup script
Write-Host "🚀 MindCare Backend Server Startup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check for .env file
if (-not (Test-Path ".env")) {
    Write-Host "❌ ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file from .env.example" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Check for node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Kill any process using port 5000
Write-Host "🔍 Checking for port 5000..." -ForegroundColor Yellow
try {
    $port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
    if ($port5000) {
        $processId = $port5000.OwningProcess
        Write-Host "⚠️  Found process $processId on port 5000. Stopping it..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "✅ Port 5000 cleared" -ForegroundColor Green
    } else {
        Write-Host "✅ Port 5000 is available" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not check port 5000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Starting server..." -ForegroundColor Green
Write-Host "📡 API will be available at: http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "❤️  Health check: http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
node server.js
