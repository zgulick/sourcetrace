/**
 * SourceTrace - Frontend JavaScript
 * Handles file uploads, API calls, and UI updates
 */

// ========== Global State ==========
let currentFile = null;
let currentOwnerInfo = null;

// ========== DOM Elements ==========
const elements = {
    // Upload section
    dropZone: null,
    fileInput: null,
    fileButton: null,
    urlInput: null,
    analyzeButton: null,

    // Progress section
    progressSection: null,
    progressMessage: null,
    progressFill: null,

    // Results section
    resultsSection: null,
    confidenceScore: null,
    gaugeFill: null,
    recommendationBadge: null,
    recommendationText: null,

    // Signal cards
    exifStatus: null,
    exifContent: null,
    c2paStatus: null,
    c2paContent: null,
    reverseStatus: null,
    reverseContent: null,

    // Summary
    summaryText: null,
    redFlagsSection: null,
    redFlagsList: null,
    ownerSection: null,
    ownerUsername: null,
    ownerPlatform: null,
    ownerConfidence: null,
    ownerContact: null,

    // Buttons
    generateOutreachButton: null,
    resetButton: null,

    // Error section
    errorSection: null,
    errorMessage: null,
    errorRetryButton: null,

    // Upload section (ref)
    uploadSection: null,

    // Modal
    outreachModal: null,
    modalOverlay: null,
    modalClose: null,
    outreachForm: null,
    outreachResult: null,
    outreachLoading: null,
    outreachMessage: null,
    licenseSummary: null,
    nextStepsList: null,
    copyButton: null,
    copyFeedback: null
};

// ========== Initialization ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    checkHealth();
});

/**
 * Initialize all DOM element references
 */
function initializeElements() {
    // Upload section
    elements.dropZone = document.getElementById('drop-zone');
    elements.fileInput = document.getElementById('file-input');
    elements.fileButton = document.getElementById('file-button');
    elements.urlInput = document.getElementById('url-input');
    elements.analyzeButton = document.getElementById('analyze-button');
    elements.uploadSection = document.getElementById('upload-section');

    // Progress section
    elements.progressSection = document.getElementById('progress-section');
    elements.progressMessage = document.getElementById('progress-message');
    elements.progressFill = document.getElementById('progress-fill');

    // Results section
    elements.resultsSection = document.getElementById('results-section');
    elements.confidenceScore = document.getElementById('confidence-score');
    elements.gaugeFill = document.getElementById('gauge-fill');
    elements.recommendationBadge = document.getElementById('recommendation-badge');
    elements.recommendationText = document.getElementById('recommendation-text');

    // Signal cards
    elements.exifStatus = document.getElementById('exif-status');
    elements.exifContent = document.getElementById('exif-content');
    elements.c2paStatus = document.getElementById('c2pa-status');
    elements.c2paContent = document.getElementById('c2pa-content');
    elements.reverseStatus = document.getElementById('reverse-status');
    elements.reverseContent = document.getElementById('reverse-content');

    // Summary
    elements.summaryText = document.getElementById('summary-text');
    elements.redFlagsSection = document.getElementById('red-flags-section');
    elements.redFlagsList = document.getElementById('red-flags-list');
    elements.ownerSection = document.getElementById('owner-section');
    elements.ownerUsername = document.getElementById('owner-username');
    elements.ownerPlatform = document.getElementById('owner-platform');
    elements.ownerConfidence = document.getElementById('owner-confidence');
    elements.ownerContact = document.getElementById('owner-contact');

    // Buttons
    elements.generateOutreachButton = document.getElementById('generate-outreach-button');
    elements.resetButton = document.getElementById('reset-button');

    // Error section
    elements.errorSection = document.getElementById('error-section');
    elements.errorMessage = document.getElementById('error-message');
    elements.errorRetryButton = document.getElementById('error-retry-button');

    // Modal
    elements.outreachModal = document.getElementById('outreach-modal');
    elements.modalOverlay = document.getElementById('modal-overlay');
    elements.modalClose = document.getElementById('modal-close');
    elements.outreachForm = document.getElementById('outreach-form');
    elements.outreachResult = document.getElementById('outreach-result');
    elements.outreachLoading = document.getElementById('outreach-loading');
    elements.outreachMessage = document.getElementById('outreach-message');
    elements.licenseSummary = document.getElementById('license-summary');
    elements.nextStepsList = document.getElementById('next-steps-list');
    elements.copyButton = document.getElementById('copy-button');
    elements.copyFeedback = document.getElementById('copy-feedback');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // File upload events
    elements.fileButton.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop events
    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    elements.dropZone.addEventListener('dragover', handleDragOver);
    elements.dropZone.addEventListener('dragleave', handleDragLeave);
    elements.dropZone.addEventListener('drop', handleDrop);

    // URL input events
    elements.urlInput.addEventListener('input', handleUrlInput);
    elements.analyzeButton.addEventListener('click', handleAnalyzeClick);

    // Enter key on URL input
    elements.urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !elements.analyzeButton.disabled) {
            handleAnalyzeClick();
        }
    });

    // Button events
    elements.resetButton.addEventListener('click', resetUI);
    elements.errorRetryButton.addEventListener('click', resetUI);
    elements.generateOutreachButton.addEventListener('click', openOutreachModal);

    // Modal events
    elements.modalClose.addEventListener('click', closeOutreachModal);
    elements.modalOverlay.addEventListener('click', closeOutreachModal);
    elements.outreachForm.addEventListener('submit', handleOutreachSubmit);
    elements.copyButton.addEventListener('click', copyToClipboard);
}

/**
 * Check API health on load
 */
async function checkHealth() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        console.log('✅ API Health:', data);
    } catch (error) {
        console.error('❌ Health check failed:', error);
    }
}

// ========== File Upload Handlers ==========

/**
 * Handle file selection via input
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

/**
 * Handle drag over event
 */
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    elements.dropZone.classList.add('drag-over');
}

/**
 * Handle drag leave event
 */
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    elements.dropZone.classList.remove('drag-over');
}

/**
 * Handle file drop
 */
function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    elements.dropZone.classList.remove('drag-over');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

/**
 * Process and validate file
 */
function processFile(file) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        showError('Invalid file type. Please upload a JPG, PNG, or GIF image.');
        return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showError('File is too large. Maximum size is 10MB.');
        return;
    }

    // Store file and start analysis
    currentFile = file;
    analyzeImage();
}

/**
 * Handle URL input changes
 */
function handleUrlInput() {
    const url = elements.urlInput.value.trim();
    elements.analyzeButton.disabled = url.length === 0;
}

/**
 * Handle analyze button click
 */
function handleAnalyzeClick() {
    const url = elements.urlInput.value.trim();
    if (url) {
        currentFile = null; // Clear file if using URL
        analyzeImage();
    }
}

// ========== Analysis Functions ==========

/**
 * Main analysis function
 */
async function analyzeImage() {
    // Show progress section
    showProgress();

    try {
        // Determine input mode
        let requestData;
        let isFileUpload = false;

        if (currentFile) {
            // File upload mode
            isFileUpload = true;
            requestData = new FormData();
            requestData.append('file', currentFile);
        } else {
            // URL mode
            const url = elements.urlInput.value.trim();
            requestData = JSON.stringify({ image_url: url });
        }

        // Update progress
        updateProgress('Preparing analysis...', 10);

        // Make API call
        const options = {
            method: 'POST',
            body: requestData
        };

        // Only set content-type for JSON (let browser set it for FormData)
        if (!isFileUpload) {
            options.headers = {
                'Content-Type': 'application/json'
            };
        }

        updateProgress('Extracting metadata...', 25);

        const response = await fetch('/api/analyze', options);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Analysis failed');
        }

        updateProgress('Checking authenticity...', 50);

        // Simulate progress updates for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        updateProgress('Analyzing signals...', 75);

        await new Promise(resolve => setTimeout(resolve, 500));
        updateProgress('Finalizing...', 90);

        // Display results
        await new Promise(resolve => setTimeout(resolve, 300));
        displayResults(data);

    } catch (error) {
        console.error('Analysis error:', error);
        showError(error.message || 'An unexpected error occurred. Please try again.');
    }
}

/**
 * Display analysis results
 */
function displayResults(data) {
    const { analysis, signals } = data;

    // Hide progress, show results
    elements.progressSection.classList.add('hidden');
    elements.resultsSection.classList.remove('hidden');

    // Update confidence score and gauge
    updateConfidenceGauge(analysis.confidence);

    // Update recommendation badge
    updateRecommendationBadge(analysis.recommendation);

    // Update signal cards
    updateSignalCards(signals);

    // Update summary
    elements.summaryText.textContent = analysis.summary || 'No summary available.';

    // Update red flags
    if (analysis.red_flags && analysis.red_flags.length > 0) {
        elements.redFlagsSection.classList.remove('hidden');
        elements.redFlagsList.innerHTML = '';
        analysis.red_flags.forEach(flag => {
            const li = document.createElement('li');
            li.textContent = flag;
            elements.redFlagsList.appendChild(li);
        });
    } else {
        elements.redFlagsSection.classList.add('hidden');
    }

    // Update probable owner
    if (analysis.probable_owner) {
        currentOwnerInfo = analysis.probable_owner;
        elements.ownerSection.classList.remove('hidden');
        elements.ownerUsername.textContent = analysis.probable_owner.username || 'Unknown';
        elements.ownerPlatform.textContent = analysis.probable_owner.platform || 'Unknown';
        elements.ownerConfidence.textContent = analysis.probable_owner.confidence || 'N/A';
        elements.ownerContact.textContent = analysis.probable_owner.contact_method || 'Unknown';
    } else {
        elements.ownerSection.classList.add('hidden');
    }

    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Update confidence gauge
 */
function updateConfidenceGauge(confidence) {
    elements.confidenceScore.textContent = confidence;

    // Calculate gauge fill (arc length = 251.2, percentage based fill)
    const arcLength = 251.2;
    const fillAmount = arcLength - (arcLength * (confidence / 100));
    elements.gaugeFill.style.strokeDashoffset = fillAmount;

    // Color based on confidence
    let color;
    if (confidence >= 70) {
        color = '#10b981'; // green
    } else if (confidence >= 40) {
        color = '#f59e0b'; // orange
    } else {
        color = '#ef4444'; // red
    }
    elements.gaugeFill.style.stroke = color;
}

/**
 * Update recommendation badge
 */
function updateRecommendationBadge(recommendation) {
    // Remove existing classes
    elements.recommendationBadge.classList.remove('proceed', 'manual-review', 'high-risk');

    // Map recommendation to badge
    const recommendationMap = {
        'proceed_to_rights': {
            class: 'proceed',
            icon: 'fa-check-circle',
            text: 'Proceed to Rights Clearance'
        },
        'manual_review': {
            class: 'manual-review',
            icon: 'fa-exclamation-circle',
            text: 'Manual Review Required'
        },
        'high_risk': {
            class: 'high-risk',
            icon: 'fa-times-circle',
            text: 'High Risk - Do Not Use'
        }
    };

    const badge = recommendationMap[recommendation] || recommendationMap['manual_review'];
    elements.recommendationBadge.classList.add(badge.class);
    elements.recommendationBadge.innerHTML = `
        <i class="fas ${badge.icon}"></i>
        <span id="recommendation-text">${badge.text}</span>
    `;
}

/**
 * Update signal cards
 */
function updateSignalCards(signals) {
    // Update EXIF card
    updateExifCard(signals.exif);

    // Update C2PA card
    updateC2paCard(signals.c2pa);

    // Update Reverse Search card
    updateReverseSearchCard(signals.reverse_search);
}

/**
 * Update EXIF card
 */
function updateExifCard(exif) {
    if (exif.has_exif) {
        elements.exifStatus.textContent = 'Found';
        elements.exifStatus.className = 'signal-status found';

        let content = '';
        if (exif.camera_make) content += `<p><strong>Camera:</strong> ${exif.camera_make}`;
        if (exif.camera_model) content += ` ${exif.camera_model}</p>`;
        else if (exif.camera_make) content += `</p>`;
        if (exif.timestamp) content += `<p><strong>Date:</strong> ${new Date(exif.timestamp).toLocaleString()}</p>`;
        if (exif.gps_latitude && exif.gps_longitude) {
            content += `<p><strong>Location:</strong> ${exif.gps_latitude.toFixed(4)}, ${exif.gps_longitude.toFixed(4)}</p>`;
        }
        if (exif.software) content += `<p><strong>Software:</strong> ${exif.software}</p>`;

        elements.exifContent.innerHTML = content || '<p>Metadata found but limited details.</p>';
    } else {
        elements.exifStatus.textContent = 'Not Found';
        elements.exifStatus.className = 'signal-status not-found';
        elements.exifContent.innerHTML = `<p>${exif.message || 'No EXIF metadata detected.'}</p>`;
    }
}

/**
 * Update C2PA card
 */
function updateC2paCard(c2pa) {
    if (c2pa.present) {
        elements.c2paStatus.textContent = 'Found';
        elements.c2paStatus.className = 'signal-status found';

        let content = '<p><strong>Content Credentials Detected</strong></p>';
        if (c2pa.creator) content += `<p><strong>Creator:</strong> ${c2pa.creator}</p>`;
        if (c2pa.claim_generator) content += `<p><strong>Claim Generator:</strong> ${c2pa.claim_generator}</p>`;
        if (c2pa.signature_info) {
            const validIcon = c2pa.signature_info.is_valid ? '✅' : '❌';
            content += `<p><strong>Signature:</strong> ${validIcon} ${c2pa.signature_info.is_valid ? 'Valid' : 'Invalid'}</p>`;
        }

        elements.c2paContent.innerHTML = content;
    } else {
        elements.c2paStatus.textContent = 'Not Found';
        elements.c2paStatus.className = 'signal-status not-found';
        elements.c2paContent.innerHTML = `<p>${c2pa.message || 'No C2PA credentials found.'}</p>`;
    }
}

/**
 * Update Reverse Search card
 */
function updateReverseSearchCard(reverseSearch) {
    if (reverseSearch.found) {
        elements.reverseStatus.textContent = `${reverseSearch.match_count} Matches`;
        elements.reverseStatus.className = 'signal-status found';

        let content = `<p><strong>${reverseSearch.match_count} similar images found</strong></p>`;

        if (reverseSearch.matches && reverseSearch.matches.length > 0) {
            content += '<ul style="padding-left: 20px; margin-top: 8px;">';
            reverseSearch.matches.slice(0, 3).forEach(match => {
                content += `<li><a href="${match.url}" target="_blank" rel="noopener">${match.domain || match.title}</a></li>`;
            });
            content += '</ul>';
        }

        elements.reverseContent.innerHTML = content;
    } else {
        if (reverseSearch.message) {
            elements.reverseStatus.textContent = 'Unavailable';
            elements.reverseStatus.className = 'signal-status not-found';
            elements.reverseContent.innerHTML = `<p>${reverseSearch.message}</p>`;
        } else {
            elements.reverseStatus.textContent = 'No Matches';
            elements.reverseStatus.className = 'signal-status not-found';
            elements.reverseContent.innerHTML = '<p>No similar images found.</p>';
        }
    }
}

// ========== Progress Functions ==========

/**
 * Show progress section
 */
function showProgress() {
    elements.uploadSection.classList.add('hidden');
    elements.resultsSection.classList.add('hidden');
    elements.errorSection.classList.add('hidden');
    elements.progressSection.classList.remove('hidden');
    updateProgress('Starting analysis...', 0);
}

/**
 * Update progress message and bar
 */
function updateProgress(message, percentage) {
    elements.progressMessage.textContent = message;
    elements.progressFill.style.width = `${percentage}%`;
}

// ========== Error Handling ==========

/**
 * Show error section
 */
function showError(message) {
    elements.uploadSection.classList.add('hidden');
    elements.progressSection.classList.add('hidden');
    elements.resultsSection.classList.add('hidden');
    elements.errorSection.classList.remove('hidden');
    elements.errorMessage.textContent = message;
}

// ========== UI Reset ==========

/**
 * Reset UI to initial state
 */
function resetUI() {
    // Clear state
    currentFile = null;
    currentOwnerInfo = null;
    elements.fileInput.value = '';
    elements.urlInput.value = '';
    elements.analyzeButton.disabled = true;

    // Hide all sections except upload
    elements.uploadSection.classList.remove('hidden');
    elements.progressSection.classList.add('hidden');
    elements.resultsSection.classList.add('hidden');
    elements.errorSection.classList.add('hidden');

    // Close modal if open
    closeOutreachModal();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== Outreach Modal ==========

/**
 * Open outreach modal
 */
function openOutreachModal() {
    elements.outreachModal.classList.remove('hidden');
    elements.outreachForm.reset();
    elements.outreachResult.classList.add('hidden');
    elements.outreachLoading.classList.add('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

/**
 * Close outreach modal
 */
function closeOutreachModal() {
    elements.outreachModal.classList.add('hidden');
    elements.copyFeedback.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scroll
}

/**
 * Handle outreach form submission
 */
async function handleOutreachSubmit(event) {
    event.preventDefault();

    // Get form values
    const useCase = document.getElementById('use-case').value;
    const scope = document.getElementById('scope').value;
    const territory = document.getElementById('territory').value;
    const compensation = document.getElementById('compensation').value;

    // Show loading
    elements.outreachForm.classList.add('hidden');
    elements.outreachLoading.classList.remove('hidden');

    try {
        // Make API call
        const response = await fetch('/api/generate-outreach', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                owner_info: {
                    username: currentOwnerInfo.username,
                    platform: currentOwnerInfo.platform
                },
                license_params: {
                    use_case: useCase,
                    scope: scope,
                    territory: territory,
                    compensation: compensation
                }
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to generate outreach message');
        }

        // Display result
        displayOutreachResult(data.outreach);

    } catch (error) {
        console.error('Outreach generation error:', error);
        alert('Failed to generate outreach message: ' + error.message);
        elements.outreachLoading.classList.add('hidden');
        elements.outreachForm.classList.remove('hidden');
    }
}

/**
 * Display outreach result
 */
function displayOutreachResult(outreach) {
    // Hide loading, show result
    elements.outreachLoading.classList.add('hidden');
    elements.outreachResult.classList.remove('hidden');

    // Populate message
    elements.outreachMessage.textContent = outreach.outreach_message;
    elements.licenseSummary.textContent = outreach.license_summary;

    // Populate next steps
    elements.nextStepsList.innerHTML = '';
    outreach.next_steps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        elements.nextStepsList.appendChild(li);
    });
}

/**
 * Copy outreach message to clipboard
 */
async function copyToClipboard() {
    const text = elements.outreachMessage.textContent;

    try {
        await navigator.clipboard.writeText(text);
        elements.copyFeedback.classList.remove('hidden');

        // Hide feedback after 3 seconds
        setTimeout(() => {
            elements.copyFeedback.classList.add('hidden');
        }, 3000);
    } catch (error) {
        console.error('Failed to copy:', error);
        alert('Failed to copy to clipboard. Please copy manually.');
    }
}

// ========== Utility Functions ==========

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp) {
    try {
        return new Date(timestamp).toLocaleString();
    } catch {
        return timestamp;
    }
}

console.log('✅ SourceTrace frontend initialized');
