# SourceTrace

**AI-Powered UGC Provenance Triage System**

A 60-second tool for newsrooms to analyze user-generated content authenticity and facilitate rights clearance workflow.

---

## Overview

SourceTrace analyzes images for provenance signals including:
- **EXIF metadata** (camera, timestamp, GPS, software)
- **Reverse image search** (earliest instances, sources)
- **C2PA credentials** (content authenticity markers - mocked in MVP)

An AI synthesizes these signals into a confidence score and actionable recommendations for journalists.

## Tech Stack

- **Backend**: Flask (Python 3.10+)
- **Frontend**: Vanilla JavaScript
- **AI**: OpenAI GPT-4o-mini
- **Reverse Search**: TBD (SerpAPI or custom scraper)
- **Deployment**: Replit

---

## Setup Instructions

### Prerequisites

- Python 3.10 or higher
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Local Development

1. **Clone or download the project**
   ```bash
   cd sourcetrace-prototype
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Access the application**
   ```
   http://localhost:5000
   ```

---

## Project Structure

```
sourcetrace-prototype/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variable template
├── utils/                # Analysis modules
│   ├── __init__.py       # Package initializer
│   ├── exif_analyzer.py  # EXIF extraction
│   ├── reverse_search.py # Reverse image search
│   ├── c2pa_checker.py   # C2PA credentials (mocked)
│   └── llm_synthesizer.py# OpenAI API integration
├── templates/            # HTML templates
│   └── index.html
├── static/               # CSS, JavaScript
│   ├── css/styles.css
│   └── js/app.js
├── PROJECT_PLAN.md       # Overall implementation plan
├── CHUNK_1_PLAN.md       # Phase 1 detailed plan
├── CHANGELOG.md          # Deviations from original spec
└── README.md            # This file
```

---

## API Endpoints

### GET /
Main application interface

### GET /health
Health check endpoint
```json
{"status": "healthy", "version": "1.0.0"}
```

### POST /api/analyze
Analyzes uploaded image or URL for provenance signals.

**Request**: multipart/form-data (file) OR JSON (image_url)

**Response**:
```json
{
  "success": true,
  "confidence": 85,
  "summary": "High confidence in authenticity...",
  "signals": {
    "c2pa": {"present": false, "message": "..."},
    "exif": {"camera_make": "Apple", ...},
    "reverse_search": {"found": true, ...}
  },
  "recommendation": "proceed_to_rights",
  "probable_owner": {"username": "@user", ...}
}
```

### POST /api/generate-outreach
Generates rights clearance outreach message.

**Request**:
```json
{
  "owner_info": {"username": "@user", "platform": "Twitter"},
  "license_params": {"use_case": "breaking_news", ...}
}
```

**Response**:
```json
{
  "success": true,
  "outreach_message": "Hi @user...",
  "license_summary": "...",
  "next_steps": [...]
}
```

---

## Implementation Status

**Current Phase**: Phase 1 - Foundation & Setup ✅

### Completed
- ✅ Project structure created
- ✅ Flask application skeleton
- ✅ Environment configuration
- ✅ All dependencies specified
- ✅ Placeholder modules created

### Next Steps
- ⏳ **Phase 2**: Backend Data Extraction (EXIF, Reverse Search, C2PA)
- ⏳ **Phase 3**: LLM Synthesis (OpenAI Integration)
- ⏳ **Phase 4**: API Endpoints Implementation
- ⏳ **Phase 5-7**: Frontend Implementation
- ⏳ **Phase 8**: Integration & Testing
- ⏳ **Phase 9**: Documentation & Deployment

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for full implementation roadmap.

---

## Known Limitations (MVP)

1. **C2PA checking returns mocked "not found"** - Production would use c2pa-python library
2. **Reverse search TBD** - Free tier may be subject to rate limiting/CAPTCHAs
3. **Graceful degradation** - Analysis continues even if reverse search fails
4. **Social media strips EXIF** - Many images will have limited metadata
5. **Images only** - No video support in MVP
6. **No persistent storage** - Analysis results not saved
7. **No user authentication** - Single-user prototype
8. **Template-based licensing** - Not legally reviewed, for demonstration only

**These are acceptable for a 48-hour prototype demonstration.**

---

## Future Enhancements

### Phase 2 (Production)
- C2PA production implementation with c2pa-python
- Video support (MP4, MOV)
- Persistent storage (PostgreSQL)
- User authentication
- API documentation (OpenAPI/Swagger)

### Phase 3 (Integration)
- CMS integration (WordPress, Drupal)
- Batch processing for multiple assets
- Admin dashboard for metrics
- Team collaboration features
- Rights tracking database

### Phase 4 (Advanced)
- Machine learning for manipulation detection
- Blockchain-based provenance tracking
- Mobile app (iOS, Android)
- API for third-party integration
- Advanced analytics and reporting

---

## Environment Variables

Required in `.env` file:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_key_here       # Required
OPENAI_MODEL=gpt-4o-mini           # Optional, defaults to gpt-4o-mini

# Flask Configuration
FLASK_SECRET_KEY=your_secret_here  # Required for sessions
FLASK_ENV=development              # development or production

# Application Settings
MAX_FILE_SIZE=10485760             # 10MB default
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif
```

---

## Deployment

### Replit Deployment

1. Create new Repl and import from GitHub
2. Set Secrets in Replit dashboard:
   - `OPENAI_API_KEY`
   - `FLASK_SECRET_KEY`
3. Replit will auto-detect Python and install dependencies
4. Application will be accessible at your Repl URL

### Production Deployment

For production deployment:
- Use `gunicorn` instead of Flask dev server
- Set `FLASK_ENV=production`
- Enable HTTPS
- Set up proper logging
- Configure rate limiting
- Implement authentication

---

## Contributing

This is a 48-hour MVP prototype for a job interview demonstration.

For questions or feedback:
- Review [TECHNICAL_SPECIFICATIONS.md](../TECHNICAL_SPECIFICATIONS.md)
- Check [PROJECT_PLAN.md](./PROJECT_PLAN.md)
- See [CHANGELOG.md](./CHANGELOG.md) for deviations from original spec

---

## License

MIT License (for prototype demonstration)

---

## Acknowledgments

**Built for Storyful Interview** - 48-hour MVP prototype demonstrating:
- AI integration (OpenAI GPT-4o-mini)
- External data sources (EXIF, reverse search)
- Product thinking (solves real newsroom problem)
- Responsible AI (human oversight checkpoints)
- Technical competence (clean code, accessibility, deployment)

**Key Differentiators:**
- C2PA awareness (cutting-edge provenance technology)
- Graceful degradation (robust error handling)
- Accessibility-first design (WCAG AA compliance)
- Documented limitations and future roadmap

---

**Status**: Chunk 1 Complete ✅ | Ready for Phase 2 Implementation
