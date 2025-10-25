"""
Test Suite for Flask API Endpoints
Tests POST /api/analyze and POST /api/generate-outreach endpoints

Run with: python test_api_endpoints.py
"""

import os
import sys
import json
import io
import tempfile
from PIL import Image
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import Flask app
from app import app

# Test configuration
# Using httpbin.org which allows testing HTTP requests
TEST_IMAGE_URL = "https://httpbin.org/image/jpeg"


def create_test_image():
    """
    Create a simple test image with EXIF data

    Returns:
        BytesIO: In-memory image file
    """
    # Create a simple RGB image
    img = Image.new('RGB', (800, 600), color=(73, 109, 137))

    # Save to BytesIO
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)

    return img_bytes


def create_test_image_file():
    """
    Create a temporary test image file

    Returns:
        str: Path to temporary file
    """
    # Create image
    img = Image.new('RGB', (800, 600), color=(73, 109, 137))

    # Save to temp file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
    img.save(temp_file.name, format='JPEG')
    temp_file.close()

    return temp_file.name


def print_test_header(test_name):
    """Print formatted test header"""
    print("\n" + "=" * 70)
    print(f"TEST: {test_name}")
    print("=" * 70)


def print_response(response, show_full=False):
    """Print formatted response data"""
    print(f"\nStatus Code: {response.status_code}")

    try:
        data = response.get_json()
        if show_full:
            print(f"\nFull Response:\n{json.dumps(data, indent=2)}")
        else:
            # Print condensed view
            print(f"\nResponse Keys: {list(data.keys())}")
            if 'success' in data:
                print(f"Success: {data['success']}")
            if 'error' in data:
                print(f"Error: {data['error']}")
            if 'analysis' in data:
                analysis = data['analysis']
                print(f"\nAnalysis:")
                print(f"  Confidence: {analysis.get('confidence', 'N/A')}")
                print(f"  Recommendation: {analysis.get('recommendation', 'N/A')}")
                print(f"  Summary: {analysis.get('summary', 'N/A')[:100]}...")
            if 'signals' in data:
                signals = data['signals']
                print(f"\nSignals:")
                print(f"  EXIF present: {signals.get('exif', {}).get('has_exif', False)}")
                print(f"  C2PA present: {signals.get('c2pa', {}).get('present', False)}")
                print(f"  Reverse search found: {signals.get('reverse_search', {}).get('found', False)}")
            if 'processing_time_ms' in data:
                print(f"\nProcessing Time: {data['processing_time_ms']}ms")
            if 'outreach' in data:
                outreach = data['outreach']
                print(f"\nOutreach:")
                print(f"  Message length: {len(outreach.get('outreach_message', ''))} chars")
                print(f"  Next steps: {len(outreach.get('next_steps', []))} items")

    except Exception as e:
        print(f"\nError parsing response: {e}")
        print(f"Raw response: {response.data}")


def test_analyze_file_upload():
    """Test POST /api/analyze with file upload"""
    print_test_header("POST /api/analyze - File Upload")

    with app.test_client() as client:
        # Create test image
        img_bytes = create_test_image()

        # Send request
        response = client.post(
            '/api/analyze',
            data={'file': (img_bytes, 'test_image.jpg')},
            content_type='multipart/form-data'
        )

        print_response(response)

        # Assertions
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        data = response.get_json()
        assert data['success'] is True, "Expected success=True"
        assert 'analysis' in data, "Missing 'analysis' field"
        assert 'signals' in data, "Missing 'signals' field"
        assert 'processing_time_ms' in data, "Missing 'processing_time_ms' field"

        # Check analysis structure
        analysis = data['analysis']
        assert 'confidence' in analysis, "Missing 'confidence' in analysis"
        assert 'summary' in analysis, "Missing 'summary' in analysis"
        assert 'recommendation' in analysis, "Missing 'recommendation' in analysis"
        assert isinstance(analysis['confidence'], int), "Confidence should be integer"
        assert 0 <= analysis['confidence'] <= 100, "Confidence should be 0-100"
        assert analysis['recommendation'] in ['proceed_to_rights', 'manual_review', 'high_risk'], \
            f"Invalid recommendation: {analysis['recommendation']}"

        # Check signals structure
        signals = data['signals']
        assert 'exif' in signals, "Missing 'exif' in signals"
        assert 'c2pa' in signals, "Missing 'c2pa' in signals"
        assert 'reverse_search' in signals, "Missing 'reverse_search' in signals"

        print("\n✅ Test passed: File upload analysis works correctly")
        return True


def test_analyze_url():
    """Test POST /api/analyze with image URL"""
    print_test_header("POST /api/analyze - Image URL")

    with app.test_client() as client:
        # Send request with URL
        response = client.post(
            '/api/analyze',
            json={'image_url': TEST_IMAGE_URL},
            content_type='application/json'
        )

        print_response(response)

        # Assertions
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        data = response.get_json()
        assert data['success'] is True, "Expected success=True"
        assert 'analysis' in data, "Missing 'analysis' field"
        assert 'signals' in data, "Missing 'signals' field"

        # Check that reverse search was performed (since we have URL)
        signals = data['signals']
        reverse_search = signals.get('reverse_search', {})
        assert 'message' in reverse_search or 'found' in reverse_search, \
            "Reverse search should have been attempted with URL"

        print("\n✅ Test passed: URL analysis works correctly")
        return True


def test_analyze_no_input():
    """Test POST /api/analyze with no file or URL"""
    print_test_header("POST /api/analyze - No Input (Error Case)")

    with app.test_client() as client:
        # Send empty request
        response = client.post(
            '/api/analyze',
            json={},
            content_type='application/json'
        )

        print_response(response)

        # Assertions
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"

        data = response.get_json()
        assert data['success'] is False, "Expected success=False"
        assert 'error' in data, "Missing 'error' field"
        assert 'file or image_url' in data['error'].lower(), "Error should mention missing file or URL"

        print("\n✅ Test passed: No input error handling works correctly")
        return True


def test_analyze_invalid_file_type():
    """Test POST /api/analyze with invalid file type"""
    print_test_header("POST /api/analyze - Invalid File Type")

    with app.test_client() as client:
        # Create text file instead of image
        txt_file = io.BytesIO(b"This is not an image")

        # Send request
        response = client.post(
            '/api/analyze',
            data={'file': (txt_file, 'test.txt')},
            content_type='multipart/form-data'
        )

        print_response(response)

        # Assertions
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"

        data = response.get_json()
        assert data['success'] is False, "Expected success=False"
        assert 'error' in data, "Missing 'error' field"

        print("\n✅ Test passed: Invalid file type error handling works correctly")
        return True


def test_analyze_invalid_url():
    """Test POST /api/analyze with invalid URL"""
    print_test_header("POST /api/analyze - Invalid URL")

    with app.test_client() as client:
        # Send request with invalid URL
        response = client.post(
            '/api/analyze',
            json={'image_url': 'https://httpbin.org/status/404'},
            content_type='application/json'
        )

        print_response(response)

        # Assertions
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"

        data = response.get_json()
        assert data['success'] is False, "Expected success=False"
        assert 'error' in data, "Missing 'error' field"

        print("\n✅ Test passed: Invalid URL error handling works correctly")
        return True


def test_generate_outreach():
    """Test POST /api/generate-outreach"""
    print_test_header("POST /api/generate-outreach")

    with app.test_client() as client:
        # Send request
        response = client.post(
            '/api/generate-outreach',
            json={
                'owner_info': {
                    'username': '@test_user',
                    'platform': 'Twitter/X'
                },
                'license_params': {
                    'use_case': 'breaking_news',
                    'scope': 'single_use',
                    'territory': 'worldwide',
                    'compensation': 'standard_rate'
                }
            },
            content_type='application/json'
        )

        print_response(response)

        # Assertions
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        data = response.get_json()
        assert data['success'] is True, "Expected success=True"
        assert 'outreach' in data, "Missing 'outreach' field"
        assert 'processing_time_ms' in data, "Missing 'processing_time_ms' field"

        # Check outreach structure
        outreach = data['outreach']
        assert 'outreach_message' in outreach, "Missing 'outreach_message' in outreach"
        assert 'license_summary' in outreach, "Missing 'license_summary' in outreach"
        assert 'next_steps' in outreach, "Missing 'next_steps' in outreach"
        assert isinstance(outreach['next_steps'], list), "next_steps should be a list"
        assert len(outreach['outreach_message']) > 0, "outreach_message should not be empty"

        print("\n✅ Test passed: Outreach generation works correctly")
        return True


def test_generate_outreach_missing_fields():
    """Test POST /api/generate-outreach with missing fields"""
    print_test_header("POST /api/generate-outreach - Missing Fields")

    with app.test_client() as client:
        # Send request with missing license_params
        response = client.post(
            '/api/generate-outreach',
            json={
                'owner_info': {
                    'username': '@test_user',
                    'platform': 'Twitter/X'
                }
                # Missing license_params
            },
            content_type='application/json'
        )

        print_response(response)

        # Assertions
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"

        data = response.get_json()
        assert data['success'] is False, "Expected success=False"
        assert 'error' in data, "Missing 'error' field"
        assert 'license_params' in data['error'].lower(), "Error should mention missing license_params"

        print("\n✅ Test passed: Missing fields error handling works correctly")
        return True


def test_health_endpoint():
    """Test GET /health endpoint"""
    print_test_header("GET /health")

    with app.test_client() as client:
        # Send request
        response = client.get('/health')

        print_response(response, show_full=True)

        # Assertions
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

        data = response.get_json()
        assert 'status' in data, "Missing 'status' field"
        assert data['status'] == 'healthy', "Expected status=healthy"
        assert 'modules' in data, "Missing 'modules' field"

        modules = data['modules']
        assert modules['exif_analyzer'] == 'loaded', "exif_analyzer not loaded"
        assert modules['reverse_search'] == 'loaded', "reverse_search not loaded"
        assert modules['c2pa_checker'] == 'loaded', "c2pa_checker not loaded"
        assert modules['llm_synthesizer'] == 'loaded', "llm_synthesizer not loaded"

        print("\n✅ Test passed: Health endpoint works correctly")
        return True


def test_processing_time_limits():
    """Test that processing times are within acceptable limits"""
    print_test_header("Processing Time Limits")

    with app.test_client() as client:
        # Test analyze endpoint
        img_bytes = create_test_image()
        response = client.post(
            '/api/analyze',
            data={'file': (img_bytes, 'test_image.jpg')},
            content_type='multipart/form-data'
        )

        data = response.get_json()
        analyze_time = data.get('processing_time_ms', 0)
        print(f"\nAnalyze processing time: {analyze_time}ms")

        # Test outreach endpoint
        response = client.post(
            '/api/generate-outreach',
            json={
                'owner_info': {'username': '@test', 'platform': 'Twitter/X'},
                'license_params': {
                    'use_case': 'breaking_news',
                    'scope': 'single_use',
                    'territory': 'worldwide',
                    'compensation': 'standard_rate'
                }
            },
            content_type='application/json'
        )

        data = response.get_json()
        outreach_time = data.get('processing_time_ms', 0)
        print(f"Outreach processing time: {outreach_time}ms")

        # Assertions (generous limits for testing environment)
        assert analyze_time < 60000, f"Analyze took {analyze_time}ms (>60s limit)"
        assert outreach_time < 10000, f"Outreach took {outreach_time}ms (>10s limit)"

        print("\n✅ Test passed: Processing times within limits")
        return True


def run_all_tests():
    """Run all test cases"""
    print("\n" + "=" * 70)
    print("SOURCETRACE API TEST SUITE")
    print("=" * 70)

    # Check API key
    if not os.getenv('OPENAI_API_KEY'):
        print("\n⚠️  WARNING: OPENAI_API_KEY not set - some tests may fail")
    else:
        print("\n✓ OpenAI API key configured")

    # Run tests
    tests = [
        test_health_endpoint,
        test_analyze_file_upload,
        test_analyze_url,
        test_analyze_no_input,
        test_analyze_invalid_file_type,
        test_analyze_invalid_url,
        test_generate_outreach,
        test_generate_outreach_missing_fields,
        test_processing_time_limits
    ]

    passed = 0
    failed = 0
    errors = []

    for test_func in tests:
        try:
            test_func()
            passed += 1
        except AssertionError as e:
            failed += 1
            errors.append((test_func.__name__, str(e)))
            print(f"\n❌ Test failed: {e}")
        except Exception as e:
            failed += 1
            errors.append((test_func.__name__, str(e)))
            print(f"\n❌ Test error: {e}")

    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    print(f"\nTotal tests: {len(tests)}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")

    if errors:
        print("\nFailed tests:")
        for test_name, error in errors:
            print(f"  - {test_name}: {error}")

    print("\n" + "=" * 70)

    return passed == len(tests)


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)
