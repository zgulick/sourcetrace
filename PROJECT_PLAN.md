# SourceTrace Implementation Plan (48-hour MVP)

## Project Overview

**SourceTrace** is an AI-powered UGC provenance triage system that analyzes images in under 60 seconds to determine authenticity and facilitate rights clearance workflow.

**Interview Context**: This is a 48-hour prototype for a job interview demonstrating:
- AI integration (OpenAI GPT-4)
- External data sources (EXIF, reverse image search)
- Product thinking (solves real newsroom problem)
- Responsible AI (human oversight checkpoints)
- Technical competence (clean code, accessibility, deployment)

## Architecture Summary

### Technology Stack
- **Backend**: Flask + Python 3.10+
- **Frontend**: Vanilla JavaScript (mobile-responsive, WCAG AA compliant)
- **LLM**: OpenAI API (GPT-4/GPT-4o-mini)
- **Reverse Search**: Free Python library (Google scraper)
- **C2PA**: Mock implementation (shows awareness, realistic for timeline)
- **Deployment**: Replit

### Key Adjustments from Original Spec
1. **LLM**: Claude → OpenAI (you have API key)
2. **Reverse Search**: TinEye API ($200) → Free Google scraper library
3. **C2PA**: Production library → Mock (48-hour timeline constraint)
4. **Python**: 3.9+ → 3.10+ (best practice)

## Technical Architecture

```
┌─────────────────┐
│   Frontend      │  Single-page HTML/CSS/JS application
│   (Vanilla JS)  │  Mobile responsive, WCAG AA compliant
└────────┬────────┘
         │ HTTPS
         │
┌────────▼────────┐
│   Flask API     │  RESTful endpoints
│   (Python 3.10+)│  /api/analyze, /api/generate-outreach
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────────┐
│ EXIF  │ │ Reverse     │
│Extract│ │ Search      │
│       │ │ (Google)    │
└───┬───┘ └──┬──────────┘
    │        │
    └────┬───┘
         │
    ┌────▼─────┐
    │ OpenAI   │  LLM synthesis
    │ API      │  Confidence scoring
    └──────────┘
```

## Project Structure

```
sourcetrace-prototype/
├── PROJECT_PLAN.md           # This file - overall plan
├── CHUNK_1_PLAN.md           # First implementation chunk
├── app.py                    # Main Flask application
├── requirements.txt          # Python dependencies
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore file
├── README.md                # Setup instructions
├── static/
│   ├── css/
│   │   └── styles.css       # Main stylesheet
│   └── js/
│       └── app.js           # Frontend JavaScript
├── templates/
│   └── index.html           # Main HTML template
└── utils/
    ├── __init__.py          # Package initializer
    ├── exif_analyzer.py     # EXIF extraction module
    ├── reverse_search.py    # Google reverse search integration
    ├── c2pa_checker.py      # C2PA credential checking (mock)
    └── llm_synthesizer.py   # OpenAI API integration
```

## Implementation Phases

### Phase 1: Foundation & Project Setup (2-3 hours)
**Goal**: Working Flask app with all dependencies installed

1. Create project structure
2. Initialize Flask application skeleton
3. Configure environment variables (.env.example)
4. Create requirements.txt with dependencies:
   - Flask==3.0.0
   - python-dotenv==1.0.0
   - Pillow==10.1.0
   - exifread==3.0.0
   - requests==2.31.0
   - openai==1.3.0
   - flask-cors==4.0.0
   - gunicorn==21.2.0
   - Note: Reverse image search library TBD in Phase 2 (serpapi or custom implementation)
5. Set up basic routing (serve index.html)
6. Test server runs successfully
7. Create .gitignore
8. Write initial README.md

**Validation**: `python app.py` runs without errors, serves basic HTML

---

### Phase 2: Backend Core - Data Extraction (4-5 hours)
**Goal**: Extract provenance signals from images

#### 2A: EXIF Analyzer (utils/exif_analyzer.py)
- Extract metadata: camera make/model, timestamp, GPS coordinates, software
- Handle missing EXIF data gracefully
- Return structured dict with all available metadata
- Strip sensitive data (user comments, serial numbers)

**Function**: `extract_exif(image_path_or_bytes) -> dict`

**Test**: Upload image with EXIF, verify extraction works

#### 2B: Reverse Image Search (utils/reverse_search.py)
- **Decision point**: Choose reverse search implementation:
  - Option 1: SerpAPI (limited free tier, 100 searches/month)
  - Option 2: Custom Google Images scraper (free but may hit rate limits)
  - Option 3: Bing Image Search API (free tier available)
- Search for earlier instances of uploaded image
- Extract: earliest match, match count, source URLs/domains
- Handle errors gracefully (rate limits, CAPTCHAs, timeouts)
- **Important**: Implement graceful degradation - if search fails, continue with other signals
- Return structured match data or error state

**Function**: `search_image(image_url) -> dict`

**Test**: Search known image, verify matches found OR graceful error handling

**Risk**: Free scraping may be unreliable. Build with fallback strategy.

#### 2C: C2PA Checker (utils/c2pa_checker.py)
- Create mock implementation
- Return structured "not found" response
- Add documentation comment explaining production implementation
- Note C2PA as differentiator in README

**Function**: `check_c2pa(image_path_or_bytes) -> dict`

**Test**: Verify returns expected mock structure

**Validation**: All three modules return expected data structures

---

### Phase 3: Backend Core - LLM Synthesis (3-4 hours)
**Goal**: Synthesize signals into actionable intelligence

#### 3A: LLM Synthesizer (utils/llm_synthesizer.py)
- Adapt technical spec prompts for OpenAI message format
- Implement `synthesize_analysis()` function
- Input: dict with c2pa, exif, reverse_search signals
- Output: confidence score (0-100), summary, red flags, recommendation, probable owner
- Implement `generate_outreach()` function
- Input: owner info + license params
- Output: outreach message, license summary, next steps
- Handle OpenAI API errors gracefully
- Use GPT-4 or GPT-4o-mini (check pricing)

**Functions**:
- `synthesize_analysis(signals: dict) -> dict`
- `generate_outreach(owner_info: dict, license_params: dict) -> dict`

**Test**: Mock signal data → verify LLM returns proper JSON structure

**Validation**: LLM produces coherent confidence scores and summaries

---

### Phase 4: Backend Core - Flask API Endpoints (3-4 hours)
**Goal**: Wire up analysis pipeline

#### 4A: POST /api/analyze
- Accept multipart/form-data (file upload) OR JSON (image URL)
- Validate file type (JPG, PNG, GIF)
- Enforce 10MB file size limit
- Download image if URL provided
- Orchestrate pipeline:
  1. Extract EXIF
  2. Run reverse search
  3. Check C2PA
  4. Synthesize with LLM
- Return structured JSON response
- Handle errors at each step gracefully
- Processing time target: <60 seconds

#### 4B: POST /api/generate-outreach
- Accept JSON with owner_info and license_params
- Call LLM synthesizer
- Return outreach message + license summary
- Processing time: <10 seconds

#### 4C: Error Handling
- File validation errors
- API timeout errors
- Missing API key errors
- Invalid image format errors
- User-friendly error messages

**Test**:
- Upload test image → receive confidence score
- Submit license params → receive outreach message

**Validation**: Full backend pipeline works end-to-end

---

### Phase 5: Frontend - HTML Structure (2-3 hours)
**Goal**: Semantic, accessible HTML layout

#### 5A: Base Template (templates/index.html)
- Semantic HTML5 structure
- Three main sections:
  1. Upload section (file upload + URL input)
  2. Results section (confidence score, signals, red flags)
  3. Rights clearance section (license params, outreach message)
- Forms with proper labels
- ARIA attributes for accessibility
- Skip link for screen readers
- Loading states
- Error message areas

#### 5B: Accessibility Features
- ARIA labels on all interactive elements
- Role attributes (banner, main, contentinfo)
- Form validation with clear error messages
- Keyboard navigation support (all via Tab)
- Screen reader announcements (aria-live regions)

**Test**: Run through axe DevTools for accessibility issues

**Validation**: HTML validates, no accessibility errors

---

### Phase 6: Frontend - CSS Styling (3-4 hours)
**Goal**: Mobile-responsive, WCAG AA compliant design

#### 6A: Core Styles (static/css/styles.css)
- CSS reset and base styles
- Typography system
- WCAG AA color palette (4.5:1 contrast minimum)
- Component styles: buttons, forms, cards, alerts
- Confidence score meter visualization
- Focus indicators (3px solid outline)

#### 6B: Responsive Layout
- Mobile-first approach
- Breakpoints:
  - Mobile: 320px - 767px (stacked layout)
  - Tablet: 768px - 1023px (two-column where appropriate)
  - Desktop: 1024px+ (full layout)
- Touch targets minimum 44x44px
- Responsive typography scaling

#### 6C: State Management Styles
- Loading spinner
- Error alerts (red)
- Warning alerts (yellow)
- Success messages (green)
- Disabled states
- Hidden sections (display: none)

**Test**:
- Resize browser to all breakpoints
- Check color contrast with DevTools
- Verify focus indicators visible

**Validation**: Responsive on all devices, WCAG AA compliant

---

### Phase 7: Frontend - JavaScript Logic (4-5 hours)
**Goal**: Interactive UI with API integration

#### 7A: Form Handlers (static/js/app.js)
- Upload form submission
- Validate file/URL input
- Show loading state
- Call `/api/analyze` endpoint
- Handle response/errors
- Display results dynamically

#### 7B: Results Display
- Update confidence score meter (animated)
- Display summary text
- Render detailed signals (C2PA, EXIF, reverse search)
- Show red flags list (if any)
- Display probable owner info
- Show/hide sections based on state

#### 7C: Rights Clearance Workflow
- License form submission
- Call `/api/generate-outreach` endpoint
- Display generated outreach message
- Copy to clipboard functionality
- Export report as JSON
- Confirmation checkbox validation

#### 7D: State Management
- Track current section (upload/results/rights)
- Store analysis data
- Enable/disable buttons based on state
- Handle section transitions
- Announce state changes to screen readers

#### 7E: Error Handling
- Network errors
- API errors
- Validation errors
- User-friendly error messages
- Retry functionality

**Test**:
- Upload image → see results
- Generate outreach → copy message
- Export report → download JSON

**Validation**: Full frontend works end-to-end with backend

---

### Phase 8: Integration & Testing (3-4 hours)
**Goal**: Polished, tested application

#### 8A: End-to-End Testing
- Test with various image types (JPG, PNG, GIF)
- Test with images with/without EXIF
- Test with URL input
- Test error scenarios (bad file, no API key)
- Test on slow connection (loading states)
- Test rights workflow from start to finish

#### 8B: Accessibility Testing
- Keyboard navigation (Tab through all elements)
- Screen reader testing (VoiceOver/NVDA)
- Focus management
- Form validation announcements
- Color contrast verification
- Alt text on images

#### 8C: Cross-Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

#### 8D: Responsive Testing
- Test on actual mobile device
- Test at 320px, 768px, 1024px+ widths
- Touch target sizes
- Text readability at all sizes

#### 8E: Bug Fixes
- Address any issues found in testing
- Refine error messages
- Optimize performance
- Fix visual bugs

**Validation**: All tests pass, no critical bugs

---

### Phase 9: Documentation & Deployment (2-3 hours)
**Goal**: Deployed application with clear documentation

#### 9A: README.md
- Project overview and purpose
- Setup instructions (local development)
- Environment variables required
- API key setup (OpenAI)
- How to run locally
- How to deploy to Replit
- Known limitations (documented from spec)
- Future enhancements (C2PA production, video support, etc.)
- Architecture diagram
- Screenshots (optional but nice)

#### 9B: Code Documentation
- Docstrings on all functions
- Inline comments for complex logic
- Type hints where helpful
- Module-level documentation

#### 9C: Replit Deployment
- Create `.replit` configuration file
- Configure Replit secrets (OPENAI_API_KEY)
- Set run command (gunicorn app:app)
- Test deployment on Replit
- Verify public URL works
- Check environment variables load correctly

#### 9D: Final QA
- Complete testing checklist from technical spec
- Verify all success criteria met
- Document any known issues
- Prepare for demo

**Validation**: App deployed, README clear, ready to demo

---

## Success Criteria

**MVP is complete when:**

1. ✅ User can upload image or paste URL
2. ✅ System returns confidence score <60 seconds
3. ✅ Results display in accessible, mobile-responsive UI
4. ✅ User can proceed to rights workflow
5. ✅ System generates outreach message
6. ✅ All interactions are WCAG AA compliant
7. ✅ Deployed to Replit with public URL
8. ✅ No critical bugs in happy path
9. ✅ README documents setup and limitations
10. ✅ Code is clean and well-commented

## Key Differentiators for Interview

1. **C2PA Awareness**: Even mocked, demonstrates knowledge of cutting-edge provenance technology
2. **Responsible AI**: Human oversight checkpoints throughout (confirmation before use)
3. **Accessibility First**: WCAG AA compliance, keyboard navigation, screen reader support
4. **Product Thinking**: Solves real newsroom problem (60-second triage + rights workflow)
5. **Technical Depth**: Clean architecture, error handling, proper separation of concerns
6. **Practical Tradeoffs**: Mock C2PA for timeline, document for production

## Risks Mitigated

- ✅ No Claude API key → Using OpenAI (you have API key)
- ✅ TinEye $200 cost → Free Google/Bing scraper or SerpAPI free tier
- ⚠️ **New risk**: Google scraping may be rate-limited → Graceful degradation built in
- ✅ C2PA complexity → Mock with documentation (demonstrates awareness)
- ✅ 48-hour deadline → Focused MVP scope, chunked implementation
- ✅ Replit constraints → Tested stack, minimal dependencies

## Risk Management Strategy

**Reverse Image Search Reliability:**
- Build with assumption that search may fail
- LLM can still provide confidence score based on EXIF + C2PA alone
- Document limitation in UI ("Reverse search unavailable")
- Test with multiple images to validate fallback behavior

## Known Limitations (Document in README)

**For MVP Prototype:**
1. **C2PA checking returns mocked "not found"** - Demonstrates awareness, production would use library
2. **Reverse search uses free scraper** - Subject to rate limiting/CAPTCHAs, may fail
3. **Graceful degradation** - Analysis continues even if reverse search unavailable
4. **Social media strips EXIF** - Many real-world images will have limited metadata
5. **Video analysis not implemented** - Images only (JPG, PNG, GIF)
6. **No persistent storage** - Analysis results not saved to database
7. **No user authentication** - Single-user prototype
8. **No CMS integration** - Standalone web application
9. **Rights tracking is UI mockup** - No database tracking of licensing status
10. **License templates not legally reviewed** - For demonstration purposes only

**These are acceptable for a 48-hour prototype demonstration.**

---

## Timeline Estimate

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 1. Foundation & Setup | 2-3 hours | 3 hours |
| 2. Backend Data Extraction | 4-5 hours | 8 hours |
| 3. Backend LLM Synthesis | 3-4 hours | 12 hours |
| 4. Backend API Endpoints | 3-4 hours | 16 hours |
| 5. Frontend HTML | 2-3 hours | 19 hours |
| 6. Frontend CSS | 3-4 hours | 23 hours |
| 7. Frontend JavaScript | 4-5 hours | 28 hours |
| 8. Integration & Testing | 3-4 hours | 32 hours |
| 9. Documentation & Deployment | 2-3 hours | **35 hours** |

**Total Estimated Time**: 35 hours (within 48-hour window with buffer)

---

## Next Steps

See [CHUNK_1_PLAN.md](./CHUNK_1_PLAN.md) for the first implementation chunk (Phase 1: Foundation & Project Setup).
