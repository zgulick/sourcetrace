"""
SourceTrace: AI-Powered UGC Provenance Triage System
Main Flask application
"""

import os
import tempfile
import time
import requests
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

# Import our analysis modules
from utils.exif_analyzer import extract_exif
from utils.reverse_search import search_image
from utils.c2pa_checker import check_c2pa
from utils.llm_synthesizer import synthesize_analysis, generate_outreach as generate_outreach_message

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


def save_uploaded_file(file):
    """
    Save uploaded file to temp location

    Args:
        file: Flask uploaded file object

    Returns:
        str: Path to temporary file
    """
    suffix = os.path.splitext(secure_filename(file.filename))[1]
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    file.save(temp_file.name)
    temp_file.close()
    return temp_file.name


def download_image_from_url(url):
    """
    Download image from URL to temp location

    Args:
        url: Image URL to download

    Returns:
        str: Path to temporary file

    Raises:
        ValueError: If URL doesn't point to an image
        requests.RequestException: If download fails
    """
    # Download with timeout
    response = requests.get(url, timeout=30, stream=True)
    response.raise_for_status()

    # Check content type
    content_type = response.headers.get('content-type', '')
    if 'image' not in content_type.lower():
        raise ValueError(f"URL does not point to an image (content-type: {content_type})")

    # Save to temp file
    suffix = os.path.splitext(url.split('?')[0])[1] or '.jpg'
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)

    for chunk in response.iter_content(chunk_size=8192):
        temp_file.write(chunk)

    temp_file.close()
    return temp_file.name


def validate_request_data(data, required_fields):
    """
    Validate request has required fields

    Args:
        data: Request data dict
        required_fields: List of required field names

    Returns:
        tuple: (is_valid, error_message)
    """
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    return True, None


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
    start_time = time.time()
    temp_path = None
    image_url = None

    try:
        # Determine input mode: file upload or URL
        if request.files and 'file' in request.files:
            # Mode A: File upload
            file = request.files['file']

            if file.filename == '':
                return jsonify({
                    'success': False,
                    'error': 'No file selected'
                }), 400

            if not allowed_file(file.filename):
                return jsonify({
                    'success': False,
                    'error': f'Invalid file type. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'
                }), 400

            app.logger.info(f"Analysis request received: file upload ({file.filename})")
            temp_path = save_uploaded_file(file)

        elif request.is_json and 'image_url' in request.json:
            # Mode B: Image URL
            image_url = request.json['image_url']
            app.logger.info(f"Analysis request received: URL ({image_url})")

            try:
                temp_path = download_image_from_url(image_url)
            except requests.RequestException as e:
                return jsonify({
                    'success': False,
                    'error': f'Failed to download image from URL: {str(e)}'
                }), 400
            except ValueError as e:
                return jsonify({
                    'success': False,
                    'error': str(e)
                }), 400

        else:
            return jsonify({
                'success': False,
                'error': 'No file or image_url provided. Send file via multipart/form-data or image_url via JSON'
            }), 400

        # Pipeline Step 1: Extract EXIF
        app.logger.info("Step 1/4: Extracting EXIF metadata...")
        exif_data = extract_exif(temp_path)
        app.logger.info(f"EXIF data extracted: {exif_data}")

        # Pipeline Step 2: Check C2PA
        app.logger.info("Step 2/4: Checking C2PA credentials...")
        c2pa_data = check_c2pa(temp_path)

        # Pipeline Step 3: Reverse image search
        app.logger.info("Step 3/4: Performing reverse image search...")
        if image_url:
            # We have a URL, can do reverse search
            reverse_search_data = search_image(image_url)
        else:
            # File upload - no URL available for reverse search
            reverse_search_data = {
                "found": False,
                "message": "Reverse search not available for file uploads (URL required)",
                "note": "For reverse search functionality, provide image URL instead of file upload"
            }

        # Pipeline Step 4: Synthesize with LLM
        app.logger.info("Step 4/4: Synthesizing analysis with AI...")
        signals = {
            "c2pa": c2pa_data,
            "exif": exif_data,
            "reverse_search": reverse_search_data
        }
        analysis = synthesize_analysis(signals)

        # Calculate processing time
        processing_time_ms = int((time.time() - start_time) * 1000)

        app.logger.info(f"Analysis completed in {processing_time_ms}ms, confidence: {analysis.get('confidence', 'N/A')}")

        # Log signals before sending
        app.logger.info(f"Signals being returned - EXIF: {signals['exif']}")

        # Return complete result
        return jsonify({
            'success': True,
            'analysis': analysis,
            'signals': signals,
            'processing_time_ms': processing_time_ms
        })

    except Exception as e:
        app.logger.error(f"Analysis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

    finally:
        # Clean up temporary file
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
                app.logger.info(f"Cleaned up temporary file: {temp_path}")
            except Exception as e:
                app.logger.warning(f"Failed to clean up temp file {temp_path}: {str(e)}")


@app.route('/api/generate-outreach', methods=['POST'])
def generate_outreach():
    """
    Generate rights clearance outreach message

    Accepts:
        JSON with owner_info and license_params

    Returns:
        JSON with outreach message and license summary
    """
    start_time = time.time()

    try:
        # Validate request is JSON
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'Request must be JSON'
            }), 400

        data = request.json

        # Validate required top-level fields
        valid, error = validate_request_data(data, ['owner_info', 'license_params'])
        if not valid:
            return jsonify({
                'success': False,
                'error': error
            }), 400

        # Validate owner_info fields
        owner_info = data['owner_info']
        valid, error = validate_request_data(owner_info, ['username', 'platform'])
        if not valid:
            return jsonify({
                'success': False,
                'error': f'Invalid owner_info: {error}'
            }), 400

        # Validate license_params fields
        license_params = data['license_params']
        required_params = ['use_case', 'scope', 'territory', 'compensation']
        valid, error = validate_request_data(license_params, required_params)
        if not valid:
            return jsonify({
                'success': False,
                'error': f'Invalid license_params: {error}'
            }), 400

        # Extract user info (optional fields with defaults)
        your_name = data.get('your_name', 'Metro News Desk Reporter')
        your_organization = data.get('your_organization', 'Metro News Desk')

        app.logger.info(f"Outreach generation request: {owner_info['username']} on {owner_info['platform']}")

        # Generate outreach message
        outreach = generate_outreach_message(owner_info, license_params, your_name, your_organization)

        # Calculate processing time
        processing_time_ms = int((time.time() - start_time) * 1000)

        app.logger.info(f"Outreach generated in {processing_time_ms}ms")

        return jsonify({
            'success': True,
            'outreach': outreach,
            'processing_time_ms': processing_time_ms
        })

    except Exception as e:
        app.logger.error(f"Outreach generation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'modules': {
            'exif_analyzer': 'loaded',
            'reverse_search': 'loaded',
            'c2pa_checker': 'loaded',
            'llm_synthesizer': 'loaded'
        }
    })


if __name__ == '__main__':
    # Development server
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
