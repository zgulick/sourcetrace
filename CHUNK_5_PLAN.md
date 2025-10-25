# Chunk 5: Frontend UI Implementation

**Goal:** Build a modern, interactive web interface that connects to the Flask API backend.

**Duration Estimate:** 3-4 hours

---

## Overview

Create a production-quality frontend with:
- Modern, clean design
- Drag-and-drop file upload
- URL input option
- Real-time progress indicators
- Results visualization (confidence gauges, signal cards)
- Outreach generation modal
- Responsive design
- Error handling and user feedback

---

## Task Breakdown

### Task 1: Update HTML Structure (templates/index.html)
**Duration:** 30 minutes

**Components to Build:**
1. **Header Section**
   - App branding (SourceTrace logo/title)
   - Tagline: "AI-Powered UGC Provenance Triage"

2. **Upload Section**
   - Drag-and-drop zone
   - File upload button
   - OR divider
   - URL input field
   - Analyze button

3. **Progress Section**
   - Hidden by default
   - Shows during analysis
   - Progress bar or spinner
   - Status messages ("Extracting EXIF...", "Checking C2PA...", etc.)

4. **Results Section**
   - Hidden by default
   - Shows after analysis completes
   - Confidence gauge (0-100 visual indicator)
   - Recommendation badge (proceed/manual_review/high_risk)
   - Signal cards (EXIF, C2PA, Reverse Search)
   - Summary text
   - Red flags list
   - Probable owner info
   - "Generate Outreach" button

5. **Outreach Modal**
   - Hidden by default
   - Form fields for license parameters
   - Generate button
   - Display generated message
   - Copy to clipboard button

6. **Error Section**
   - Hidden by default
   - Shows on errors
   - Clear error message
   - Try again button

**HTML Features:**
- Semantic HTML5
- Accessibility (ARIA labels, proper form structure)
- Meta tags for responsiveness

---

### Task 2: Style with Modern CSS (static/css/styles.css)
**Duration:** 45 minutes

**Design System:**
- **Colors:**
  - Primary: #2563eb (blue)
  - Success: #10b981 (green)
  - Warning: #f59e0b (orange)
  - Danger: #ef4444 (red)
  - Background: #f9fafb (light gray)
  - Card background: #ffffff
  - Text: #1f2937 (dark gray)

- **Typography:**
  - Font: System font stack (sans-serif)
  - Headings: Bold, larger sizes
  - Body: 16px base size

- **Spacing:**
  - Consistent padding/margins (8px, 16px, 24px, 32px)

**Components to Style:**
1. **Layout**
   - Container max-width: 1200px
   - Centered layout
   - Responsive breakpoints

2. **Upload Zone**
   - Dashed border
   - Hover state (blue border)
   - Drag-over state (blue background)
   - Icon + text centered

3. **Buttons**
   - Primary: Blue background, white text
   - Hover states
   - Disabled states
   - Loading states

4. **Confidence Gauge**
   - Circular or bar visualization
   - Color-coded (green/yellow/red)
   - Animated fill

5. **Signal Cards**
   - Grid layout (3 columns)
   - Shadow on hover
   - Icon + title + content
   - Status indicators

6. **Modal**
   - Overlay background
   - Centered content
   - Close button
   - Smooth transitions

7. **Responsive Design**
   - Mobile: 1 column
   - Tablet: 2 columns
   - Desktop: 3 columns

---

### Task 3: Implement JavaScript Logic (static/js/app.js)
**Duration:** 1.5 hours

**Core Functions:**

1. **File Upload Handler**
   ```javascript
   // Handle drag-and-drop
   // Handle file input change
   // Validate file type and size
   // Preview uploaded file
   ```

2. **URL Input Handler**
   ```javascript
   // Validate URL format
   // Enable/disable analyze button
   ```

3. **Analyze Function**
   ```javascript
   async function analyzeImage() {
     // Show progress section
     // Determine input mode (file vs URL)
     // Build FormData or JSON
     // POST to /api/analyze
     // Update progress messages
     // Handle response
     // Display results
     // Handle errors
   }
   ```

4. **Results Display**
   ```javascript
   function displayResults(data) {
     // Show results section
     // Update confidence gauge
     // Update recommendation badge
     // Populate signal cards
     // Display summary and red flags
     // Show probable owner
     // Enable outreach button
   }
   ```

5. **Outreach Modal Handler**
   ```javascript
   function openOutreachModal() {
     // Show modal
     // Populate owner info
   }

   async function generateOutreach() {
     // Get form values
     // POST to /api/generate-outreach
     // Display message
     // Enable copy button
   }

   function copyToClipboard() {
     // Copy outreach message
     // Show success feedback
   }
   ```

6. **Progress Updates**
   ```javascript
   function updateProgress(message) {
     // Update progress text
     // Animate progress indicator
   }
   ```

7. **Error Handling**
   ```javascript
   function showError(message) {
     // Hide progress
     // Show error section
     // Display message
   }
   ```

8. **Reset Function**
   ```javascript
   function resetUI() {
     // Hide all sections
     // Clear inputs
     // Reset form
   }
   ```

**Features:**
- AJAX requests using Fetch API
- Error handling with try/catch
- Loading states
- Form validation
- Smooth transitions
- Clipboard API integration

---

### Task 4: Add Visual Enhancements
**Duration:** 30 minutes

**Enhancements:**
1. **Icons**
   - Use Font Awesome or SVG icons
   - Upload icon, check/warning icons, signal type icons

2. **Animations**
   - Fade-in for results
   - Progress spinner
   - Confidence gauge animation
   - Button hover effects

3. **Loading States**
   - Disabled buttons during processing
   - Spinner on analyze button
   - Progress bar animation

4. **Success Feedback**
   - Checkmark animation on completion
   - Copy success message
   - Smooth transitions

---

### Task 5: Testing & Polish
**Duration:** 30 minutes

**Test Scenarios:**
1. **Upload Flow**
   - Drag and drop image
   - Click to upload image
   - View results
   - Generate outreach
   - Copy message

2. **URL Flow**
   - Enter valid URL
   - Analyze
   - View results

3. **Error Cases**
   - Invalid file type
   - No file/URL provided
   - Network error
   - Server error

4. **Responsive Testing**
   - Mobile view
   - Tablet view
   - Desktop view

5. **Browser Testing**
   - Chrome
   - Firefox
   - Safari

**Polish Items:**
- Consistent spacing
- Proper alignment
- Smooth transitions
- Clear error messages
- Helpful tooltips

---

## Deliverables

1. ✅ `templates/index.html` - Complete HTML structure
2. ✅ `static/css/styles.css` - Modern CSS styling
3. ✅ `static/js/app.js` - Interactive JavaScript
4. ✅ Working end-to-end flow (upload → analyze → results → outreach)
5. ✅ Responsive design (mobile, tablet, desktop)
6. ✅ Error handling and user feedback
7. ✅ Manual testing verification

---

## Design Mockup (Text Description)

```
┌─────────────────────────────────────────────────────────────┐
│                         SourceTrace                          │
│              AI-Powered UGC Provenance Triage               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │         [Upload Icon]                                 │  │
│  │                                                       │  │
│  │    Drag & drop your image here                       │  │
│  │         or click to browse                           │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│                        ─── OR ───                            │
│                                                              │
│  Enter image URL:                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ https://example.com/image.jpg                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│                    [Analyze Image]                           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                      RESULTS SECTION                         │
│                                                              │
│  Confidence Score: 85%  [████████░░] [PROCEED TO RIGHTS]   │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ EXIF DATA   │  │  C2PA       │  │ REVERSE     │        │
│  │ ✓ Found     │  │  ✗ Not Found│  │ SEARCH      │        │
│  │ iPhone 14   │  │             │  │ ✓ 3 matches │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
│  Summary: High confidence in authenticity...                │
│                                                              │
│  Red Flags: None                                             │
│                                                              │
│  Probable Owner: @user123 on Twitter/X                      │
│                                                              │
│                [Generate Outreach Message]                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Success Criteria

- ✅ Upload images via drag-and-drop or file picker
- ✅ Analyze images via URL
- ✅ Display all analysis results visually
- ✅ Generate outreach messages
- ✅ Copy to clipboard functionality
- ✅ Responsive on mobile, tablet, desktop
- ✅ Clear error messages
- ✅ Professional, modern design
- ✅ <3 second perceived load time (with progress indicators)
- ✅ No console errors
- ✅ Works in Chrome, Firefox, Safari

---

## Notes

**Key Focus:**
- User experience over fancy animations
- Clear visual hierarchy
- Immediate feedback on all actions
- Progressive disclosure (show results only when ready)
- Graceful error handling

**Performance:**
- Lazy load images
- Minimize CSS/JS file sizes
- Use modern CSS (Grid, Flexbox)
- No heavy libraries (vanilla JS preferred)

**Accessibility:**
- Keyboard navigation
- Screen reader support
- ARIA labels
- Semantic HTML
- High contrast text

---

**Ready to implement!**
