## Quick setup (Windows)

After extracting the ZIP, double-click `SETUP-RUN.bat` from the HireHub project root. It checks for Python and Node.js, installs dependencies, creates/applies migrations, seeds demo data, and starts Django on port 8003 plus the React frontend.

# HireHub — Job Portal & Applicant Tracking System

A runnable portfolio project using Django REST Framework + React.

## Features
- Candidate/recruiter registration and JWT login
- Role-based permissions
- Recruiters create, edit, close, and delete their own jobs
- Candidates search/filter jobs and apply with an optional PDF resume
- Candidates track their applications
- Recruiters view applicants and update application statuses
- Dashboard statistics
- SQLite works by default; optional PostgreSQL configuration
- Demo data seeding command

## Requirements
- Python 3.10+
- Node.js 18+
- npm

## Run backend (port 8003)

Windows PowerShell:
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py makemigrations accounts jobs
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 8003
```

Backend API: http://127.0.0.1:8003/api/
Django admin: http://127.0.0.1:8003/admin/

If PowerShell blocks activation, use Command Prompt:
```bat
.venv\Scripts\activate.bat
```

## Run frontend (new terminal)
```powershell
cd frontend
npm install
npm run dev
```
Open the Vite URL printed in the terminal, usually http://localhost:5173.
The frontend API base URL is configured for `http://127.0.0.1:8003/api`.

## Demo accounts
Run `python manage.py seed_demo` after migrations:
- Recruiter: `recruiter@hirehub.demo` / `HireHubDemo123!`
- Candidate: `candidate@hirehub.demo` / `HireHubDemo123!`

Demo accounts are for local development only. Remove them before deploying publicly.

## API overview
- `POST /api/auth/register/`
- `POST /api/auth/token/`
- `POST /api/auth/token/refresh/`
- `GET /api/auth/me/`
- `GET/POST /api/jobs/`
- `GET/PATCH/DELETE /api/jobs/<id>/`
- `POST /api/jobs/<id>/apply/`
- `GET /api/applications/mine/`
- `GET /api/jobs/<id>/applicants/` (owner recruiter)
- `PATCH /api/applications/<id>/status/` (owner recruiter)
- `GET /api/dashboard/`

## Notes
- This is a portfolio/learning starter, not a hardened production deployment.
- For public deployment, configure environment secrets, HTTPS, allowed hosts, CORS, file storage, email, logging, and PostgreSQL.
