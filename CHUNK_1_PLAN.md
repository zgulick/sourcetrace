# Chunk 1: Foundation & Project Setup

## Goal
Create a working Flask application with all dependencies installed and basic structure in place.

**Duration**: 2-3 hours
**Phase**: 1 of 9

## Success Criteria

- ✅ Project structure created according to spec
- ✅ Flask app runs without errors
- ✅ All dependencies installed via requirements.txt
- ✅ Environment variables configured (.env.example)
- ✅ Basic routing serves HTML template
- ✅ README.md with setup instructions
- ✅ .gitignore configured
- ✅ Server accessible at http://localhost:5000

## Tasks

### Task 1: Create Project Structure
Create all necessary directories and placeholder files:

```
sourcetrace-prototype/
├── PROJECT_PLAN.md           # ✅ Already created
├── CHUNK_1_PLAN.md           # ✅ Already created
├── app.py                    # 🔨 Create Flask app
├── requirements.txt          # 🔨 Create dependencies list
├── .env.example             # 🔨 Create env template
├── .gitignore               # 🔨 Create git ignore
├── README.md                # 🔨 Create setup docs
├── static/
│   ├── css/
│   │   └── styles.css       # 🔨 Create (placeholder)
│   └── js/
│       └── app.js           # 🔨 Create (placeholder)
├── templates/
│   └── index.html           # 🔨 Create basic template
└── utils/
    ├── __init__.py          # 🔨 Create package init
    ├── exif_analyzer.py     # 🔨 Create (placeholder)
    ├── reverse_search.py    # 🔨 Create (placeholder)
    ├── c2pa_checker.py      # 🔨 Create (placeholder)
    └── llm_synthesizer.py   # 🔨 Create (placeholder)
```

---

### Task 2: Create requirements.txt

```txt
Flask==3.0.0
python-dotenv==1.0.0
Pillow==10.1.0
exifread==3.0.0
requests==2.31.0
openai==1.3.0
gunicorn==21.2.0
flask-cors==4.0.0
```

**Note**: Reverse image search library will be determined in Phase 2. Options:
- SerpAPI (`google-search-results==2.4.2`) - 100 free searches/month
- Custom implementation using `requests` + `beautifulsoup4`
- Bing Image Search API

Decision will be made based on reliability testing in Phase 2.

---

### Task 3: Create .env.example

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Flask Configuration
FLASK_SECRET_KEY=your_secret_key_here
FLASK_ENV=development

# Application Settings
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif

# Optional: Reverse Image Search API (TBD in Phase 2)
# SERPAPI_KEY=your_serpapi_key_here
```

---

### Task 4: Create .gitignore

```gitignore
# Environment variables
.env
.env.local

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Uploads (temporary)
uploads/
temp/

# Logs
*.log
logs/
```

---

### Task 5: Create Basic Flask Application (app.py)

```python
"""
SourceTrace: AI-Powered UGC Provenance Triage System
Main Flask application
"""

import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_FILE_SIZE', 10485760))  # 10MB default

# Enable CORS for API endpoints
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif'}


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Serve main application page"""
    return render_template('index.html')


@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    Analyze uploaded image or URL for provenance signals

    Accepts:
        - multipart/form-data with 'file' field (file upload)
        - JSON with 'image_url' field (URL input)

    Returns:
        JSON with confidence score, signals, and recommendations
    """
    try:
        # TODO: Implement in Phase 4
        return jsonify({
            'success': False,
            'error': 'Analysis endpoint not yet implemented'
        }), 501

    except Exception as e:
        app.logger.error(f"Analysis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@app.route('/api/generate-outreach', methods=['POST'])
def generate_outreach():
    """
    Generate rights clearance outreach message

    Accepts:
        JSON with owner_info and license_params

    Returns:
        JSON with outreach message and license summary
    """
    try:
        # TODO: Implement in Phase 4
        return jsonify({
            'success': False,
            'error': 'Outreach generation not yet implemented'
        }), 501

    except Exception as e:
        app.logger.error(f"Outreach generation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0'
    })


if __name__ == '__main__':
    # Development server
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
```

---

### Task 6: Create Basic HTML Template (templates/index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="SourceTrace - AI-powered UGC provenance triage">
    <title>SourceTrace - UGC Provenance Triage</title>
    <link rel="stylesheet" href="/static/css/styles.css">
</head>
<body>
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <header role="banner">
        <h1>SourceTrace</h1>
        <p class="tagline">60-Second UGC Provenance Triage</p>
    </header>

    <main id="main-content" role="main">
        <section class="card">
            <h2>Setup Complete</h2>
            <p>Flask application is running. Frontend will be implemented in Phase 5.</p>
        </section>
    </main>

    <footer role="contentinfo">
        <p>SourceTrace MVP Prototype</p>
    </footer>

    <script src="/static/js/app.js"></script>
</body>
</html>
```

---

### Task 7: Create Placeholder CSS (static/css/styles.css)

```css
/* SourceTrace - Placeholder Styles */
/* Full implementation in Phase 6 */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: #1A1A1A;
    background-color: #F5F5F5;
    padding: 20px;
}

.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #0066CC;
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
}

.skip-link:focus {
    top: 0;
}

header {
    text-align: center;
    margin-bottom: 2rem;
}

header h1 {
    font-size: 2rem;
    color: #0066CC;
}

.tagline {
    color: #4A4A4A;
    font-size: 1rem;
}

main {
    max-width: 800px;
    margin: 0 auto;
}

.card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

footer {
    text-align: center;
    margin-top: 3rem;
    color: #767676;
    font-size: 0.875rem;
}
```

---

### Task 8: Create Placeholder JavaScript (static/js/app.js)

```javascript
// SourceTrace - Frontend JavaScript
// Full implementation in Phase 7

console.log('SourceTrace initialized');

// TODO: Implement form handlers in Phase 7
// TODO: Implement API calls in Phase 7
// TODO: Implement UI state management in Phase 7
```

---

### Task 9: Create Utils Package Init (utils/__init__.py)

```python
"""
SourceTrace Utils Package
Contains modules for provenance analysis
"""

__version__ = '1.0.0'
```

---

### Task 10: Create Placeholder Utils Modules

**utils/exif_analyzer.py**
```python
"""
EXIF Analyzer Module
Extracts and parses EXIF metadata from images
"""

def extract_exif(image_path_or_bytes):
    """
    Extract EXIF metadata from image

    Args:
        image_path_or_bytes: File path or bytes object

    Returns:
        dict: EXIF metadata
    """
    # TODO: Implement in Phase 2
    return {
        'error': 'EXIF extraction not yet implemented'
    }
```

**utils/reverse_search.py**
```python
"""
Reverse Image Search Module
Searches for earlier instances of images using Google
"""

def search_image(image_url):
    """
    Perform reverse image search

    Args:
        image_url: URL of image to search

    Returns:
        dict: Search results with matches
    """
    # TODO: Implement in Phase 2
    return {
        'error': 'Reverse search not yet implemented'
    }
```

**utils/c2pa_checker.py**
```python
"""
C2PA Checker Module
Checks for Content Credentials (C2PA) in media files

NOTE: MVP uses mocked implementation. Production would use c2pa-python library.
C2PA adoption is emerging - most social media content lacks credentials.
"""

def check_c2pa(image_path_or_bytes):
    """
    Check for C2PA credentials (MOCKED for MVP)

    Args:
        image_path_or_bytes: File path or bytes object

    Returns:
        dict: C2PA credential data

    Note:
        This is a mock implementation for MVP demonstration.
        Always returns "not found" which is realistic for most UGC.
    """
    # TODO: Implement with c2pa-python in production
    return {
        'present': False,
        'message': 'C2PA credentials not found (most UGC lacks Content Credentials)'
    }
```

**utils/llm_synthesizer.py**
```python
"""
LLM Synthesizer Module
Uses OpenAI API (GPT-4o-mini) to synthesize provenance signals
"""

def synthesize_analysis(signals):
    """
    Synthesize provenance signals into confidence score using OpenAI

    Args:
        signals: dict with c2pa, exif, reverse_search data

    Returns:
        dict: Confidence score, summary, recommendations

    Model: gpt-4o-mini
    Uses JSON mode for structured outputs
    """
    # TODO: Implement in Phase 3
    # Will use OpenAI chat.completions.create with response_format=json_object
    return {
        'error': 'LLM synthesis not yet implemented'
    }


def generate_outreach(owner_info, license_params):
    """
    Generate rights clearance outreach message using OpenAI

    Args:
        owner_info: dict with username, platform
        license_params: dict with use_case, scope, territory, compensation

    Returns:
        dict: Outreach message and license summary

    Model: gpt-4o-mini
    Temperature: 0.5 for natural language generation
    """
    # TODO: Implement in Phase 3
    return {
        'error': 'Outreach generation not yet implemented'
    }
```

---

### Task 11: Create README.md

```markdown
# SourceTrace

**AI-Powered UGC Provenance Triage System**

A 60-second tool for newsrooms to analyze user-generated content authenticity and facilitate rights clearance workflow.

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

## Setup Instructions

### Prerequisites

- Python 3.10 or higher
- OpenAI API key

### Local Development

1. **Clone or download the project**

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

## Project Structure

```
sourcetrace-prototype/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── utils/                 # Analysis modules
│   ├── exif_analyzer.py   # EXIF extraction
│   ├── reverse_search.py  # Reverse image search
│   ├── c2pa_checker.py    # C2PA credentials
│   └── llm_synthesizer.py # AI synthesis
├── templates/             # HTML templates
├── static/                # CSS, JavaScript
└── README.md             # This file
```

## API Endpoints

### POST /api/analyze
Analyzes uploaded image or URL for provenance signals.

**Request**: multipart/form-data (file) OR JSON (image_url)

**Response**:
```json
{
  "success": true,
  "confidence": 85,
  "summary": "High confidence in authenticity...",
  "signals": {...},
  "recommendation": "proceed_to_rights"
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
  "license_summary": "..."
}
```

## Implementation Status

**Current Phase**: Phase 1 - Foundation & Setup ✅

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for full implementation roadmap.

## Known Limitations (MVP)

1. **C2PA checking returns mocked "not found"** - Production would use c2pa-python library
2. **Reverse search TBD** - Free tier may be subject to rate limiting/CAPTCHAs
3. **Graceful degradation** - Analysis continues even if reverse search fails
4. **Social media strips EXIF** - Many images will have limited metadata
5. **Images only** - No video support in MVP
6. **No persistent storage** - Analysis results not saved
7. **No user authentication** - Single-user prototype
8. **Template-based licensing** - Not legally reviewed, for demonstration only

## Future Enhancements

- C2PA production implementation
- Video support
- Persistent storage (PostgreSQL)
- User authentication
- CMS integration
- Batch processing

## License

MIT License (for prototype demonstration)

## Contact

Built for Storyful interview - 48-hour MVP prototype
```

---

## Validation Steps

After completing all tasks:

1. **Check project structure**
   ```bash
   cd /Users/zgulick/downloads/sourcetrace-prototype
   ls -la
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run Flask app**
   ```bash
   python app.py
   ```

5. **Verify in browser**
   - Navigate to http://localhost:5000
   - Should see basic "Setup Complete" page
   - Check browser console for no errors

6. **Test health endpoint**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"healthy","version":"1.0.0"}`

## Next Steps

Once Chunk 1 is complete and validated:
- Move to **Chunk 2**: Backend Data Extraction (Phase 2)
- Implement EXIF analyzer, reverse search, and C2PA checker modules

---

**Chunk 1 Complete**: Foundation ready for feature implementation
