@echo off
setlocal
cd /d "%~dp0"
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
  echo pnpm not found. Install with: npm install -g pnpm
  pause
  exit /b 1
)
echo Installing project dependencies...
call pnpm install
if %errorlevel% neq 0 (
  echo pnpm install failed.
  pause
  exit /b 1
)
echo Starting Old Mutual demo on http://localhost:5173
call pnpm dev
