@echo off
echo ========================================
echo   MindCare Backend Server
echo ========================================
echo.

cd /d "%~dp0"

if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

if not exist ".env" (
    echo Warning: .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo Please update .env with your credentials.
    echo Opening .env in notepad...
    notepad .env
    pause
)

echo Starting backend server...
echo Server will run on http://localhost:5000
echo.
call npm run dev
