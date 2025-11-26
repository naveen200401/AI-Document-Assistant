# 📄 AI Document Assistant

> **Generate professional Word & PowerPoint documents powered by Google Gemini AI**

AI Document Assistant is a full-stack platform that intelligently generates multi-page reports and presentations. Users can enter a topic, generate comprehensive content page-by-page, refine with AI assistance, and export to professional **DOCX** and **PPTX** formats.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/flask-2.3+-green.svg)](https://flask.palletsprojects.com/)

---

## ✨ Key Features

### 🤖 AI-Powered Content Generation
- **Gemini AI Integration** — Leverages Google's latest language models
- **Page-by-page generation** — Create 5–20+ page documents with structured content
- **Smart content refinement** — Shorten, extend, formalize, or simplify any section

### 📝 Advanced Editing & Feedback
- **Real-time refinement** — Adjust tone (formal, student-friendly, technical)
- **Thumbs up/down feedback** — Rate AI-generated content per page
- **Section comments** — Add notes and annotations to any part
- **Individual page regeneration** — Rewrite specific sections without starting over

### 📤 Professional Export Options
- **Microsoft Word (DOCX)** — Formatted documents ready for editing
- **PowerPoint (PPTX)** — Slide decks with proper layouts
- **Template support** — Apply custom Google Slides templates

### 🔐 User Management
- **Secure authentication** — Email + password login system
- **Project organization** — Manage multiple documents per user
- **Session persistence** — Continue work across sessions

---

## 🎬 Demo

<table>
<tr>
<td width="50%">

### 📹 Video Walkthrough
| Step | Action |
|------|--------|
| ① | Login with credentials |
| ② | Create new project |
| ③ | Enter topic + page count |
| ④ | AI generates content |
| ⑤ | Refine individual pages |
| ⑥ | Add feedback & comments |
| ⑦ | Export to Word |
| ⑧ | Export to PowerPoint |

</td>
<td width="50%">

### 🖼️ Screenshots
```
[Add screenshots here]
- Login screen
- Project dashboard
- Content generation
- Export options
```

</td>
</tr>
</table>

---

## 🧱 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | Flask (Python 3.8+) | REST API server |
| **Database** | SQLite | User & project data |
| **AI Engine** | Google Gemini 2.5 Flash | Content generation |
| **Frontend** | React + Tailwind CSS | User interface |
| **Document Export** | python-docx, python-pptx | File generation |
| **Authentication** | Local storage + Flask sessions | User management |

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Google Gemini API Key** ([Get one](https://makersuite.google.com/app/apikey))
- **Git** ([Install](https://git-scm.com/downloads))

### 1️⃣ Clone Repository

```bash
git clone https://github.com/<your-username>/ai-docs-platform.git
cd ai-docs-platform
```

### 2️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate        # macOS / Linux
.\.venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt
```

### 3️⃣ Configure Environment

Create `.env` file in `/backend` directory:

```env
# Required
GEMINI_API_KEY=your_api_key_here

# Optional
GEMINI_MODEL=models/gemini-2.5-flash
PORT=5001
SECRET_KEY=your-secret-key-change-this
```

**Environment Variables Reference:**

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `GEMINI_API_KEY` | ✅ | — | Google Gemini API key with billing enabled |
| `GEMINI_MODEL` | ❌ | `models/gemini-2.5-flash` | Gemini model version |
| `PORT` | ❌ | `5001` | Backend server port |
| `SECRET_KEY` | ⚠️ | Auto-generated | Flask session secret (set for production) |

### 4️⃣ Launch Application

**Option A: Using restart script** (Recommended)
```bash
# From project root
./restart-backend.sh
```

**Option B: Manual start**
```bash
cd backend
python app.py
```

Backend will run at: `http://127.0.0.1:5001`

### 5️⃣ Start Frontend

```bash
# New terminal window
cd frontend
python -m http.server 8000
```

Frontend will run at: `http://127.0.0.1:8000`

### 6️⃣ Access Application

Open your browser and navigate to:
```
http://127.0.0.1:8000
```

---

## 📂 Project Structure

```
ai-docs-platform/
│
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── restart-backend.sh     # Server restart script
│   ├── database.db           # SQLite database (auto-created)
│   ├── .env                  # Environment variables (create this)
│   └── .venv/                # Virtual environment (auto-created)
│
├── frontend/
│   ├── index.html            # Main HTML file
│   ├── app.js                # React application logic
│   └── assets/               # Images, icons, etc.
│
├── README.md                 # This file
└── LICENSE                   # MIT License
```

---

## 🔌 API Endpoints

### Authentication

```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password"
}
```

```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}
```

### Document Generation

```http
POST /api/generate
Content-Type: application/json
Authorization: Bearer <token>

{
  "topic": "Climate Change Impact",
  "pages": 10,
  "tone": "formal"
}
```

### Content Refinement

```http
POST /api/refine
Content-Type: application/json

{
  "page_id": 123,
  "action": "shorten",  // or "extend", "formalize", "simplify"
  "content": "Original content here..."
}
```

### Export

```http
GET /api/export/docx?project_id=456
GET /api/export/pptx?project_id=456
```

---

## 🐞 Troubleshooting

<details>
<summary><b>❌ Gemini API Quota Exceeded</b></summary>

**Problem:** `429 Resource Exhausted` error

**Solution:**
- Ensure billing is enabled on your Google Cloud account
- Check quota limits at [Google AI Studio](https://makersuite.google.com/)
- Consider upgrading to higher tier if needed
</details>

<details>
<summary><b>❌ Module Not Found Errors</b></summary>

**Problem:** `ModuleNotFoundError: No module named 'python-docx'`

**Solution:**
```bash
pip install python-docx python-pptx google-generativeai flask flask-cors
```
</details>

<details>
<summary><b>❌ Port Already in Use</b></summary>

**Problem:** `Address already in use` on port 5001

**Solution:**
```bash
# Kill existing process
pkill -f app.py

# Or use different port
export PORT=5002
python app.py
```
</details>

<details>
<summary><b>❌ No Content Generated</b></summary>

**Problem:** Empty responses from Gemini

**Solution:**
- Verify `GEMINI_API_KEY` is correct
- Check API key has billing enabled
- Review backend logs for detailed errors
</details>

<details>
<summary><b>❌ CORS Errors in Browser</b></summary>

**Problem:** `Access-Control-Allow-Origin` errors

**Solution:**
- Ensure Flask-CORS is installed
- Check backend is running on correct port
- Verify frontend points to correct backend URL
</details>

---

## 🔒 Security Considerations

> ⚠️ **Important:** This implementation uses local storage for authentication. For production use:

- [ ] Implement proper JWT or session-based authentication
- [ ] Use HTTPS for all communications
- [ ] Hash passwords with bcrypt or argon2
- [ ] Add rate limiting to API endpoints
- [ ] Sanitize all user inputs
- [ ] Set strong `SECRET_KEY` in production
- [ ] Use environment-specific configurations
- [ ] Implement CSRF protection
- [ ] Add API key rotation mechanism

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit changes** (`git commit -m 'Add AmazingFeature'`)
4. **Push to branch** (`git push origin feature/AmazingFeature`)
5. **Open Pull Request**

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint for JavaScript
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed

---

## 📋 Roadmap

- [ ] Multi-language support
- [ ] Real-time collaboration
- [ ] Version control for documents
- [ ] Cloud storage integration (Google Drive, Dropbox)
- [ ] Advanced template editor
- [ ] PDF export option
- [ ] Mobile app (React Native)
- [ ] Team workspace features
- [ ] API rate limiting dashboard
- [ ] Analytics & usage tracking

---

## 📝 Requirements

**Backend (requirements.txt):**
```
flask>=2.3.0
flask-cors>=4.0.0
python-docx>=0.8.11
python-pptx>=0.6.21
google-generativeai>=0.3.0
python-dotenv>=1.0.0
```

---

## 📜 License

This project is licensed under the **MIT License** — free for personal, academic, and commercial use.

See [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** for AI capabilities
- **Flask** framework community
- **React** and **Tailwind CSS** teams
- All contributors and users

---

## 📧 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/naveen200401/ai-docs-platform/issues)
- **Discussions:** [GitHub Discussions](https://github.com/naveen200401/ai-docs-platform/discussions)
- **Email:** your-naveenchandu200401@gmail.com

---

<div align="center">

**Made with ❤️ using Gemini AI**

⭐ Star this repo if you find it helpful!

</div>
