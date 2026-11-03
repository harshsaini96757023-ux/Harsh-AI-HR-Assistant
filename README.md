<<<<<<< HEAD
# Harsh Saini - Public AI HR Assistant

A public recruiter-facing chatbot built with FastAPI, Groq and HTML/CSS/JavaScript.

## Features
- Public chat without HR login
- Answers grounded in `data/candidate_profile.json`
- Resume download at `/resume`
- Interview enquiry form saved to SQLite
- Basic per-IP in-memory chat rate limit
- Health endpoint at `/health`

## 1. Local setup (Windows PowerShell)

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` and add your Groq API key. Add your final PDF resume at:
`data/Harsh_Saini_Resume.pdf`

Run:
```powershell
uvicorn main:app --reload
```
Open http://127.0.0.1:8000

## 2. Customize your candidate profile
Edit `data/candidate_profile.json`. Remove or correct anything that is not accurate.
Keep `experience` empty if you do not have professional work experience. Do not add unverified claims.

## 3. Deploy to Render
1. Create a GitHub repository and upload this project.
2. Make sure `.env`, private resumes and database files are not committed.
3. In Render, choose **New + > Web Service** and connect the repository.
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables `GROQ_API_KEY` (secret) and `GROQ_MODEL` (`llama-3.3-70b-versatile`).
7. Deploy. Your public link will look like `https://your-service-name.onrender.com`.
8. Open `/health` and test the chatbot before sending the link to HR.

## 4. Important production notes
- Confirm the resume is intended for public sharing before uploading it.
- The SQLite database on an ephemeral host may not persist across deploys/restarts. Use a persistent disk or managed PostgreSQL if you need durable enquiry storage.
- The in-memory rate limiter resets on restart and is per instance. Use Redis for production-scale rate limiting.
- Restrict CORS to your domain if you later separate frontend and backend.
- Add privacy notice, spam protection and email notifications before broad public launch.
- Never expose your Groq API key in browser JavaScript or commit `.env`.
- This is a standalone upgrade scaffold. Merge its routes/templates into your current app only after backing up your existing project.
=======
# Harsh-AI-Resume-Assistant
AI-powered HR Assistant built with Python, FastAPI, Groq LLM, HTML, CSS, and JavaScript. Helps recruiters explore my skills, projects, education, resume, and interview information through an interactive AI chatbot.
>>>>>>> 10946b61e49a2d24f8579cc28bccbe9929356dc3
