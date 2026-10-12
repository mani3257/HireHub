@echo off
setlocal
title HireHub Setup and Run

echo ==========================================
echo          HireHub Setup and Run
echo ==========================================
echo.
echo This script installs backend dependencies,
echo runs database migrations, seeds demo data,
echo and starts Django on port 8003.
echo.

where py >nul 2>nul
if errorlevel 1 (
  echo ERROR: Python launcher "py" was not found.
  echo Install Python 3.10+ from https://www.python.org/downloads/
  echo Make sure Python is added to PATH, then run this file again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm was not found.
  echo Install Node.js 18+ from https://nodejs.org/
  echo Make sure Node.js is added to PATH, then run this file again.
  pause
  exit /b 1
)

if not exist "backend\manage.py" (
  echo ERROR: Cannot find backend\manage.py.
  echo Extract this script in the HireHub project root folder.
  pause
  exit /b 1
)

if not exist "frontend\package.json" (
  echo ERROR: Cannot find frontend\package.json.
  echo Extract this script in the HireHub project root folder.
  pause
  exit /b 1
)

echo [1/6] Creating Python virtual environment if needed...
if not exist "backend\.venv\Scripts\python.exe" (
  py -m venv backend\.venv
  if errorlevel 1 goto :error
)

echo.
echo [2/6] Installing backend dependencies...
backend\.venv\Scripts\python.exe -m pip install --upgrade pip
if errorlevel 1 goto :error
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
if errorlevel 1 goto :error

echo.
echo [3/6] Creating database migrations...
pushd backend
.venv\Scripts\python.exe manage.py makemigrations accounts jobs
if errorlevel 1 (
  popd
  goto :error
)

echo.
echo [4/6] Applying database migrations...
.venv\Scripts\python.exe manage.py migrate
if errorlevel 1 (
  popd
  goto :error
)

echo.
echo [5/6] Creating demo accounts and sample jobs...
.venv\Scripts\python.exe manage.py seed_demo
if errorlevel 1 (
  popd
  goto :error
)
popd

echo.
echo [6/6] Installing frontend packages if needed...
if not exist "frontend\node_modules" (
  pushd frontend
  call npm install
  if errorlevel 1 (
    popd
    goto :error
  )
  popd
)

echo.
echo ==========================================
echo Setup complete!
echo.
echo Starting Django API on http://127.0.0.1:8003
echo Starting React frontend in another window.
echo Close the opened terminal windows to stop them.
echo ==========================================
start "HireHub Django API - Port 8003" cmd /k "cd /d ""%CD%\backend"" && .venv\Scripts\python.exe manage.py runserver 8003"
start "HireHub React Frontend" cmd /k "cd /d ""%CD%\frontend"" && npm run dev"
timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"
echo.
echo If the frontend does not open, visit http://localhost:5173 manually.
pause
exit /b 0

:error
echo.
echo Setup failed. Read the error above, fix it, and run SETUP-RUN.bat again.
pause
exit /b 1
