/**
 * SourceTrace - Frontend JavaScript
 * Handles file uploads, API calls, and UI updates
 */

// ========== Global State ==========
let currentFile = null;
let currentOwnerInfo = null;
let currentAnalysisData = null;

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

    // Outreach Modal
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
    copyFeedback: null,

    // Details Modal
    detailsModal: null,
    detailsModalOverlay: null,
    detailsModalClose: null,
    detailsTitle: null,
    detailsContent: null,

    // Signal cards
    exifCard: null,
    c2paCard: null,
    reverseCard: null
};

// ========== Initialization ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    setupTabs();
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

    // Outreach Modal
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

    // Details Modal
    elements.detailsModal = document.getElementById('details-modal');
    elements.detailsModalOverlay = document.getElementById('details-modal-overlay');
    elements.detailsModalClose = document.getElementById('details-modal-close');
    elements.detailsTitle = document.getElementById('details-title');
    elements.detailsContent = document.getElementById('details-content');

    // Signal cards
    elements.exifCard = document.getElementById('exif-card');
    elements.c2paCard = document.getElementById('c2pa-card');
    elements.reverseCard = document.getElementById('reverse-card');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // File upload events
    elements.fileButton.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.fileInput.click();
    });
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

    // Outreach Modal events
    elements.modalClose.addEventListener('click', closeOutreachModal);
    elements.modalOverlay.addEventListener('click', closeOutreachModal);
    elements.outreachForm.addEventListener('submit', handleOutreachSubmit);
    elements.copyButton.addEventListener('click', copyToClipboard);

    // Details Modal events
    elements.detailsModalClose.addEventListener('click', closeDetailsModal);
    elements.detailsModalOverlay.addEventListener('click', closeDetailsModal);

    // Signal card click events
    elements.exifCard.addEventListener('click', () => showDetails('exif'));
    elements.c2paCard.addEventListener('click', () => showDetails('c2pa'));
    elements.reverseCard.addEventListener('click', () => showDetails('reverse'));
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

// ========== Tab Management ==========

/**
 * Setup tab switching functionality
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

/**
 * Switch to a specific tab
 */
function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetContent = document.getElementById(tabId);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

/**
 * Update workflow badge count
 */
function updateWorkflowBadge() {
    const badge = document.getElementById('workflow-badge');
    const count = workflowItems.length;

    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
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

    // Store analysis data for details modal
    currentAnalysisData = data;

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
        // Check if valid or invalid
        if (c2pa.valid === false) {
            // C2PA present but couldn't be validated (incompatible format)
            elements.c2paStatus.textContent = 'Found (Unverified)';
            elements.c2paStatus.className = 'signal-status warning';

            let content = '<p><strong>⚠️ Content Credentials Detected</strong></p>';
            content += `<p style="font-size: 0.85rem; margin-top: 8px;">${c2pa.error || 'C2PA data present but validation failed'}</p>`;

            elements.c2paContent.innerHTML = content;
        } else {
            // C2PA present and validated
            elements.c2paStatus.textContent = 'Found';
            elements.c2paStatus.className = 'signal-status found';

            let content = '<p><strong>Content Credentials Detected</strong></p>';

            // Show validation status
            if (c2pa.valid !== undefined) {
                const validIcon = c2pa.valid ? '✅' : '❌';
                content += `<p><strong>Valid:</strong> ${validIcon} ${c2pa.valid ? 'Yes' : 'No'}</p>`;
            }

            // Show issuer from signature info
            if (c2pa.signature_info && c2pa.signature_info.issuer) {
                content += `<p><strong>Issuer:</strong> ${c2pa.signature_info.issuer}</p>`;
            }

            if (c2pa.creator) content += `<p><strong>Creator:</strong> ${c2pa.creator}</p>`;
            if (c2pa.claim_generator) content += `<p><strong>Claim Generator:</strong> ${c2pa.claim_generator}</p>`;

            elements.c2paContent.innerHTML = content;
        }
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

    // Show form, hide results and loading
    elements.outreachForm.classList.remove('hidden');
    elements.outreachResult.classList.add('hidden');
    elements.outreachLoading.classList.add('hidden');
    elements.copyFeedback.classList.add('hidden');

    // Reset form fields
    elements.outreachForm.reset();

    // Prevent background scroll
    document.body.style.overflow = 'hidden';
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
    const yourName = document.getElementById('your-name').value;
    const yourOrganization = document.getElementById('your-organization').value;
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
                },
                your_name: yourName,
                your_organization: yourOrganization
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

// ========== Details Modal ==========

/**
 * Show details modal for a specific signal type
 */
function showDetails(signalType) {
    if (!currentAnalysisData || !currentAnalysisData.signals) {
        console.error('No analysis data available');
        return;
    }

    const signals = currentAnalysisData.signals;
    let title = '';
    let content = '';

    // Debug logging
    console.log('Signal Type:', signalType);
    console.log('Signal Data:', signalType === 'exif' ? signals.exif : signalType === 'c2pa' ? signals.c2pa : signals.reverse_search);

    switch (signalType) {
        case 'exif':
            title = 'EXIF Metadata Details';
            content = formatExifDetails(signals.exif);
            break;
        case 'c2pa':
            title = 'C2PA Credentials Details';
            content = formatC2paDetails(signals.c2pa);
            break;
        case 'reverse':
            title = 'Reverse Search Details';
            content = formatReverseDetails(signals.reverse_search);
            break;
    }

    elements.detailsTitle.textContent = title;
    elements.detailsContent.innerHTML = content;
    elements.detailsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Close details modal
 */
function closeDetailsModal() {
    elements.detailsModal.classList.add('hidden');
    document.body.style.overflow = '';
}

/**
 * Format EXIF data for display
 */
function formatExifDetails(exifData) {
    if (!exifData || !exifData.has_exif) {
        const message = exifData?.error || 'No EXIF metadata found in this image.';
        return `<div class="details-empty">${message}</div>`;
    }

    // Check if we have any actual metadata beyond has_exif
    const dataKeys = Object.keys(exifData).filter(k => k !== 'has_exif');

    if (dataKeys.length === 0) {
        return `<div class="details-empty">
            <p><strong>EXIF metadata header is present</strong>, but all camera and technical details have been stripped.</p>
            <p>This is common for:</p>
            <ul style="text-align: left; padding-left: 20px; margin-top: 10px;">
                <li>Images that have been resized or processed</li>
                <li>Screenshots and screen captures</li>
                <li>Images from social media (metadata often stripped)</li>
                <li>Web-optimized images</li>
            </ul>
            <p style="margin-top: 15px;"><em>If you need detailed metadata for verification, use the original file from the camera or device.</em></p>
        </div>`;
    }

    let html = '<h4>Camera Information</h4>';
    html += '<table class="details-table">';

    // Map our EXIF fields to display labels
    const fieldMapping = {
        'camera_make': 'Camera Make',
        'camera_model': 'Camera Model',
        'timestamp': 'Date Taken',
        'software': 'Software',
        'gps_latitude': 'GPS Latitude',
        'gps_longitude': 'GPS Longitude',
        'gps_latitude_ref': 'Latitude Ref',
        'gps_longitude_ref': 'Longitude Ref',
        'orientation': 'Orientation',
        'flash': 'Flash',
        'focal_length': 'Focal Length (mm)',
        'iso': 'ISO Speed',
        'f_number': 'F-Number',
        'exposure_time': 'Exposure Time'
    };

    let hasData = false;
    for (const [key, label] of Object.entries(fieldMapping)) {
        if (exifData[key] !== undefined && exifData[key] !== null) {
            let value = exifData[key];

            // Format specific types
            if (key === 'timestamp') {
                try {
                    value = new Date(value).toLocaleString();
                } catch (e) {
                    value = exifData[key];
                }
            } else if (key === 'flash') {
                value = value ? 'Yes' : 'No';
            } else if (typeof value === 'number') {
                value = value.toFixed(2);
            } else if (typeof value === 'object') {
                value = JSON.stringify(value);
            }

            html += `<tr><td>${label}</td><td>${value}</td></tr>`;
            hasData = true;
        }
    }

    html += '</table>';

    if (!hasData) {
        return '<div class="details-empty">EXIF metadata found but no standard camera/technical fields available.</div>';
    }

    // Show raw data
    html += '<h4>Raw EXIF Data</h4>';
    html += `<pre class="details-json">${JSON.stringify(exifData, null, 2)}</pre>`;

    return html;
}

/**
 * Format C2PA data for display
 */
function formatC2paDetails(c2paData) {
    if (!c2paData || !c2paData.present) {
        const message = c2paData?.message || 'No C2PA credentials found in this image.';
        return `<div class="details-empty">${message}</div>`;
    }

    // Handle case where C2PA is present but couldn't be validated
    if (c2paData.valid === false) {
        return `<div class="details-empty">
            <p><strong>⚠️ C2PA Content Credentials Detected</strong></p>
            <p style="margin-top: 15px;">${c2paData.error || 'C2PA data found but validation failed'}</p>
            <p style="margin-top: 15px; font-size: 0.9rem;">${c2paData.note || ''}</p>
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-left: 4px solid #fbbf24; border-radius: 4px;">
                <p><strong>What this means:</strong></p>
                <ul style="text-align: left; padding-left: 20px; margin-top: 10px;">
                    <li>This image <strong>does contain</strong> C2PA Content Credentials</li>
                    <li>The Python library used in this prototype has limited C2PA support</li>
                    <li>Adobe's Content Credentials Verify tool can read this format</li>
                    <li>A production implementation would use the full C2PA SDK</li>
                </ul>
            </div>
            ${c2paData.technical_error ? `<p style="margin-top: 15px; font-size: 0.85rem; color: #6b7280;"><strong>Technical error:</strong> ${c2paData.technical_error}</p>` : ''}
        </div>`;
    }

    let html = '<h4>C2PA Credential Information</h4>';
    html += '<table class="details-table">';

    if (c2paData.creator) {
        html += `<tr><td>Creator</td><td>${c2paData.creator}</td></tr>`;
    }

    if (c2paData.claim_generator) {
        html += `<tr><td>Claim Generator</td><td>${c2paData.claim_generator}</td></tr>`;
    }

    // Show validation status
    if (c2paData.valid !== undefined) {
        const isValid = c2paData.valid;
        const validIcon = isValid ? '✅' : '❌';
        html += `<tr><td>Credentials Valid</td><td>${validIcon} ${isValid ? 'Yes' : 'No'}</td></tr>`;
    }

    // Show signature info
    if (c2paData.signature_info) {
        html += `<tr><td>Issuer</td><td>${c2paData.signature_info.issuer || 'Unknown'}</td></tr>`;
        if (c2paData.signature_info.time) {
            const timestamp = new Date(c2paData.signature_info.time).toLocaleString();
            html += `<tr><td>Signed</td><td>${timestamp}</td></tr>`;
        }
    }

    html += '</table>';

    // Show raw data
    html += '<h4>Raw C2PA Data</h4>';
    html += `<pre class="details-json">${JSON.stringify(c2paData, null, 2)}</pre>`;

    return html;
}

/**
 * Format reverse search data for display
 */
function formatReverseDetails(reverseData) {
    if (!reverseData || !reverseData.found) {
        const message = reverseData?.message || 'No matches found in reverse image search.';

        let html = `<div class="details-empty">
            <p><strong>${message}</strong></p>`;

        // If there's a search URL, provide a manual search option
        if (reverseData?.search_url) {
            html += `
                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-left: 4px solid #3b82f6; border-radius: 4px;">
                    <p><strong>🔍 Manual Search Available</strong></p>
                    <p style="margin-top: 10px; font-size: 0.9rem;">
                        The automated scraper couldn't parse Google's results (this is common due to anti-bot protections).
                    </p>
                    <p style="margin-top: 10px;">
                        <a href="${reverseData.search_url}" target="_blank" rel="noopener noreferrer"
                           style="display: inline-block; padding: 8px 16px; background: #3b82f6; color: white;
                                  text-decoration: none; border-radius: 4px; font-weight: 600;">
                            🔗 Open Google Reverse Image Search
                        </a>
                    </p>
                    <p style="margin-top: 15px; font-size: 0.85rem; color: #6b7280;">
                        <strong>Note:</strong> A production version would use Google Vision API or TinEye API for reliable automated results.
                    </p>
                </div>`;
        }

        // Show note if available
        if (reverseData?.note) {
            html += `<p style="margin-top: 15px; font-size: 0.9rem; color: #6b7280;"><em>${reverseData.note}</em></p>`;
        }

        // Show error if available
        if (reverseData?.error) {
            html += `<p style="margin-top: 15px; font-size: 0.9rem; color: #dc2626;"><strong>Error:</strong> ${reverseData.error}</p>`;
        }

        html += '</div>';
        return html;
    }

    let html = '<h4>Search Results</h4>';
    html += `<p><strong>Total Matches Found:</strong> ${reverseData.match_count || 0}</p>`;

    if (reverseData.matches && reverseData.matches.length > 0) {
        html += '<ul class="details-list">';

        reverseData.matches.forEach(match => {
            html += '<li>';
            if (match.title) {
                html += `<strong>${match.title}</strong><br>`;
            }
            if (match.url) {
                html += `<a href="${match.url}" target="_blank" rel="noopener noreferrer">${match.url}</a><br>`;
            }
            if (match.domain) {
                html += `<em>Domain: ${match.domain}</em>`;
            }
            html += '</li>';
        });

        html += '</ul>';
    }

    // Show raw data
    html += '<h4>Raw Search Data</h4>';
    html += `<pre class="details-json">${JSON.stringify(reverseData, null, 2)}</pre>`;

    return html;
}

// ========== Workflow Tracker ==========

// Global state for workflow tracking
let workflowItems = [];
let currentImageDataURL = null;
let analysisCount = 0;

/**
 * Initialize workflow tracker from localStorage
 */
function initializeWorkflowTracker() {
    // Load from localStorage
    const saved = localStorage.getItem('sourcetrace_workflow');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            workflowItems = data.items || [];
            analysisCount = data.analysisCount || 0;
        } catch (e) {
            console.error('Failed to load workflow data:', e);
        }
    }

    // Setup event listeners
    const sendTrackButton = document.getElementById('send-track-button');
    const workflowToggle = document.getElementById('workflow-toggle');

    if (sendTrackButton) {
        sendTrackButton.addEventListener('click', handleSendAndTrack);
    }

    if (workflowToggle) {
        workflowToggle.addEventListener('click', toggleWorkflowSection);
    }

    // Render workflow if we have items (this will also update the badge)
    if (workflowItems.length > 0) {
        renderWorkflow();
    }
}

/**
 * Save current image as data URL for workflow tracking
 */
function saveImageForTracking() {
    if (currentFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentImageDataURL = e.target.result;
        };
        reader.readAsDataURL(currentFile);
    }
}

/**
 * Track that an analysis was performed
 */
function trackAnalysis() {
    analysisCount++;
    saveWorkflowData();
    saveImageForTracking();
}

/**
 * Handle "Send & Track" button click
 */
function handleSendAndTrack() {
    if (!currentOwnerInfo || !currentOwnerInfo.username) {
        alert('Owner information not available');
        return;
    }

    // Get outreach message
    const message = elements.outreachMessage.textContent;
    if (!message) {
        alert('No outreach message generated');
        return;
    }

    // Create workflow item
    const item = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        owner: currentOwnerInfo.username,
        platform: currentOwnerInfo.platform,
        contact: currentOwnerInfo.contact_method || 'Unknown',
        status: 'sent',
        message: message,
        imageData: currentImageDataURL || null
    };

    // Add to workflow
    workflowItems.push(item);
    saveWorkflowData();

    // Copy message to clipboard
    navigator.clipboard.writeText(message).catch(e => {
        console.error('Failed to copy:', e);
    });

    // Show success feedback
    const trackFeedback = document.getElementById('track-feedback');
    trackFeedback.innerHTML = '<i class="fas fa-check-circle"></i> Message sent and added to workflow!';
    trackFeedback.classList.remove('hidden');

    // Close modal after 1.5 seconds and switch to workflow tab
    setTimeout(() => {
        closeOutreachModal();
        switchTab('workflow-tab');
        renderWorkflow();
        updateWorkflowBadge();
        trackFeedback.classList.add('hidden');
    }, 1500);

    console.log('✅ Workflow item added:', item);
}


/**
 * Toggle workflow section visibility
 */
function toggleWorkflowSection() {
    const columns = document.getElementById('workflow-columns');
    const toggle = document.getElementById('workflow-toggle');
    const icon = toggle.querySelector('i');

    if (columns.style.display === 'none') {
        columns.style.display = 'grid';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        columns.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

/**
 * Render entire workflow
 */
function renderWorkflow() {
    // Update stats
    updateStats();

    // Clear all columns
    document.getElementById('sent-cards').innerHTML = '';
    document.getElementById('negotiating-cards').innerHTML = '';
    document.getElementById('approved-cards').innerHTML = '';
    document.getElementById('rejected-cards').innerHTML = '';

    // Render items by status
    workflowItems.forEach(item => {
        const container = document.getElementById(`${item.status}-cards`);
        if (container) {
            container.appendChild(createWorkflowCard(item));
        }
    });

    // Update counts
    updateColumnCounts();

    // Update badge
    updateWorkflowBadge();
}

/**
 * Create workflow card element
 */
function createWorkflowCard(item) {
    const card = document.createElement('div');
    card.className = 'workflow-card new';
    card.dataset.id = item.id;

    // Remove 'new' class after animation
    setTimeout(() => card.classList.remove('new'), 300);

    const thumbnail = item.imageData
        ? `<img src="${item.imageData}" class="workflow-card-thumbnail" alt="Content thumbnail">`
        : `<div class="workflow-card-thumbnail" style="background: var(--border-gray); display: flex; align-items: center; justify-content: center;"><i class="fas fa-image"></i></div>`;

    const date = new Date(item.timestamp);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    card.innerHTML = `
        <div class="workflow-card-header">
            ${thumbnail}
            <div class="workflow-card-info">
                <div class="workflow-card-owner">${item.owner}</div>
                <div class="workflow-card-platform">${item.platform}</div>
                <div class="workflow-card-contact"><i class="fas fa-envelope"></i> ${item.contact || 'Unknown'}</div>
            </div>
        </div>
        <div class="workflow-card-date">${formattedDate}</div>
        <div class="workflow-card-actions">
            ${item.status === 'sent' ? '<button class="btn btn-secondary" onclick="updateWorkflowStatus(\'' + item.id + '\', \'negotiating\')"><i class="fas fa-comments"></i> Negotiating</button>' : ''}
            ${item.status === 'negotiating' ? '<button class="btn btn-success" onclick="updateWorkflowStatus(\'' + item.id + '\', \'approved\')"><i class="fas fa-check"></i> Approved</button>' : ''}
            ${item.status === 'negotiating' ? '<button class="btn" style="background: var(--danger); color: white;" onclick="updateWorkflowStatus(\'' + item.id + '\', \'rejected\')"><i class="fas fa-times"></i> Rejected</button>' : ''}
        </div>
        <button class="workflow-card-delete" onclick="deleteWorkflowItem('${item.id}')">
            <i class="fas fa-trash"></i> Delete
        </button>
    `;

    return card;
}

/**
 * Update workflow item status
 */
function updateWorkflowStatus(itemId, newStatus) {
    const item = workflowItems.find(i => i.id === itemId);
    if (item) {
        item.status = newStatus;
        saveWorkflowData();
        renderWorkflow();
    }
}

/**
 * Delete workflow item
 */
function deleteWorkflowItem(itemId) {
    if (confirm('Remove this item from workflow tracker?')) {
        workflowItems = workflowItems.filter(i => i.id !== itemId);
        saveWorkflowData();
        renderWorkflow();

        // Hide section if no items left
        if (workflowItems.length === 0) {
            document.getElementById('workflow-section').classList.add('hidden');
        }
    }
}

/**
 * Update statistics
 */
function updateStats() {
    document.getElementById('stat-analyzed').textContent = analysisCount;
    document.getElementById('stat-sent').textContent = workflowItems.length;

    const approved = workflowItems.filter(i => i.status === 'approved').length;
    document.getElementById('stat-approved').textContent = approved;

    const sent = workflowItems.length;
    const rate = sent > 0 ? Math.round((approved / sent) * 100) : 0;
    document.getElementById('stat-rate').textContent = rate + '%';
}

/**
 * Update column counts
 */
function updateColumnCounts() {
    const counts = {
        sent: workflowItems.filter(i => i.status === 'sent').length,
        negotiating: workflowItems.filter(i => i.status === 'negotiating').length,
        approved: workflowItems.filter(i => i.status === 'approved').length,
        rejected: workflowItems.filter(i => i.status === 'rejected').length
    };

    document.getElementById('sent-count').textContent = counts.sent;
    document.getElementById('negotiating-count').textContent = counts.negotiating;
    document.getElementById('approved-count').textContent = counts.approved;
    document.getElementById('rejected-count').textContent = counts.rejected;
}

/**
 * Save workflow data to localStorage
 */
function saveWorkflowData() {
    try {
        localStorage.setItem('sourcetrace_workflow', JSON.stringify({
            items: workflowItems,
            analysisCount: analysisCount
        }));
    } catch (e) {
        console.error('Failed to save workflow data:', e);
    }
}

// Make functions globally accessible
window.updateWorkflowStatus = updateWorkflowStatus;
window.deleteWorkflowItem = deleteWorkflowItem;

// Initialize workflow tracker on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeWorkflowTracker();
});

// Track analysis when results are displayed
const originalDisplayResults = displayResults;
displayResults = function(data) {
    originalDisplayResults(data);
    trackAnalysis();
};

console.log('✅ SourceTrace frontend initialized with workflow tracking');
