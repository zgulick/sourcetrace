"""
LLM Synthesizer Module
Uses OpenAI API (GPT-4o-mini) to synthesize provenance signals

This module integrates with OpenAI's API to:
1. Analyze provenance signals and generate confidence scores
2. Generate rights clearance outreach messages

Model: gpt-4o-mini (cost-effective, fast)
Uses JSON mode for structured outputs
"""

import os
import json
from openai import OpenAI


def _check_api_key():
    """
    Check if OpenAI API key is configured

    Returns:
        tuple: (bool, str) - (is_valid, message)
    """
    api_key = os.getenv('OPENAI_API_KEY')

    if not api_key:
        return False, "OPENAI_API_KEY not found in environment variables"

    if api_key == 'your_openai_api_key_here':
        return False, "OPENAI_API_KEY is still set to placeholder value"

    if len(api_key) < 20:
        return False, "OPENAI_API_KEY appears invalid (too short)"

    return True, "API key configured"


def _validate_analysis_response(data):
    """
    Validate LLM analysis response structure

    Args:
        data: dict from LLM response

    Returns:
        tuple: (bool, str) - (is_valid, message)
    """
    required_fields = ['confidence', 'summary', 'recommendation']

    # Check required fields
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"

    # Validate confidence range
    confidence = data.get('confidence')
    if not isinstance(confidence, (int, float)) or not (0 <= confidence <= 100):
        return False, f"Confidence must be integer 0-100, got: {confidence}"

    # Validate recommendation enum
    valid_recs = ['proceed_to_rights', 'manual_review', 'high_risk']
    if data.get('recommendation') not in valid_recs:
        return False, f"Invalid recommendation '{data.get('recommendation')}'. Must be one of: {valid_recs}"

    return True, "Valid"


def _validate_outreach_response(data):
    """
    Validate outreach generation response structure

    Args:
        data: dict from LLM response

    Returns:
        tuple: (bool, str) - (is_valid, message)
    """
    required_fields = ['outreach_message', 'license_summary', 'next_steps']

    # Check required fields
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"

    # Validate next_steps is a list
    if not isinstance(data.get('next_steps'), list):
        return False, "next_steps must be a list"

    return True, "Valid"


def synthesize_analysis(signals):
    """
    Synthesize provenance signals into confidence score using OpenAI

    Args:
        signals: dict with c2pa, exif, reverse_search data
            Example:
            {
                "c2pa": {"present": False, "message": "..."},
                "exif": {"camera_make": "Apple", ...},
                "reverse_search": {"found": True, "match_count": 5, ...}
            }

    Returns:
        dict: Confidence score, summary, recommendations
            Example:
            {
                "confidence": 85,
                "summary": "High confidence in authenticity...",
                "red_flags": [],
                "recommendation": "proceed_to_rights",
                "reasoning": "Strong EXIF metadata...",
                "probable_owner": {
                    "username": "@user123",
                    "platform": "Twitter/X",
                    "confidence": 68,
                    "contact_method": "DM on X"
                }
            }

    Model: gpt-4o-mini
    Uses JSON mode for structured outputs (response_format={"type": "json_object"})
    Temperature: 0.3 (lower for consistency)
    """
    # Check API key
    key_valid, key_message = _check_api_key()
    if not key_valid:
        return {
            'confidence': 50,
            'summary': 'Unable to perform automated analysis. Manual review required.',
            'red_flags': ['LLM analysis unavailable: ' + key_message],
            'recommendation': 'manual_review',
            'reasoning': 'OpenAI API key not configured',
            'probable_owner': {
                'username': 'Unknown',
                'platform': 'Unknown',
                'confidence': 0,
                'contact_method': 'Manual investigation required'
            },
            'error': key_message
        }

    try:
        # Initialize OpenAI client
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

        # Build system message
        system_message = """You are a media verification expert analyzing user-generated content provenance.

Provide your analysis in this exact JSON format. Respond ONLY with valid JSON, no other text:
{
  "confidence": <0-100 integer>,
  "summary": "<2-3 sentence plain English explanation>",
  "red_flags": [<list of specific concerns, if any - can be empty array>],
  "recommendation": "<proceed_to_rights|manual_review|high_risk>",
  "reasoning": "<explanation of confidence score>",
  "probable_owner": {
    "username": "<if identifiable from signals, otherwise 'Unknown'>",
    "platform": "<if identifiable, otherwise 'Unknown'>",
    "confidence": <0-100 integer>,
    "contact_method": "<recommended contact approach>"
  }
}

Scoring guidance:
- 80-100: High confidence (C2PA present OR strong EXIF + no conflicts)
- 60-79: Medium confidence (good EXIF, some uncertainties)
- 40-59: Low confidence (missing data OR minor conflicts)
- 0-39: Very low confidence (significant red flags OR manipulated)

Red flags to check for:
- EXIF timestamp doesn't match claimed event timing
- Location data conflicts with known event location
- Evidence of editing software use after claimed capture
- Multiple earlier versions found suggesting repost
- No metadata at all (stripped, suggesting attempt to hide origin)
- Reverse search shows earlier instances (likely repost)

Recommendation:
- proceed_to_rights: High confidence, ready for licensing workflow
- manual_review: Medium confidence, human verification recommended
- high_risk: Low confidence, likely fake or manipulated"""

        # Build user message with signals
        user_message = f"""Analyze these provenance signals:

C2PA Credentials: {json.dumps(signals.get('c2pa', {}), indent=2)}
EXIF Metadata: {json.dumps(signals.get('exif', {}), indent=2)}
Reverse Image Search: {json.dumps(signals.get('reverse_search', {}), indent=2)}

Provide your analysis as JSON."""

        # Call OpenAI API
        response = client.chat.completions.create(
            model=os.getenv('OPENAI_MODEL', 'gpt-4o-mini'),
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=1024,
            timeout=30.0
        )

        # Parse response
        result_text = response.choices[0].message.content
        result = json.loads(result_text)

        # Validate response
        valid, validation_message = _validate_analysis_response(result)
        if not valid:
            raise ValueError(f"Invalid LLM response: {validation_message}")

        # Ensure confidence is int
        result['confidence'] = int(result['confidence'])

        # Ensure red_flags is a list
        if 'red_flags' not in result:
            result['red_flags'] = []

        # Ensure probable_owner has confidence as int
        if 'probable_owner' in result and 'confidence' in result['probable_owner']:
            result['probable_owner']['confidence'] = int(result['probable_owner']['confidence'])

        return result

    except json.JSONDecodeError as e:
        return {
            'confidence': 50,
            'summary': 'Error parsing analysis results. Manual review required.',
            'red_flags': [f'JSON parsing error: {str(e)}'],
            'recommendation': 'manual_review',
            'reasoning': 'LLM returned invalid JSON format',
            'probable_owner': {
                'username': 'Unknown',
                'platform': 'Unknown',
                'confidence': 0,
                'contact_method': 'Manual investigation required'
            },
            'error': f'JSON parsing failed: {str(e)}'
        }

    except Exception as e:
        error_str = str(e)

        # Check for specific error types
        if 'api_key' in error_str.lower() or 'authentication' in error_str.lower():
            message = 'OpenAI API authentication failed - check API key'
        elif 'rate_limit' in error_str.lower():
            message = 'OpenAI API rate limit exceeded - try again later'
        elif 'timeout' in error_str.lower():
            message = 'OpenAI API request timed out'
        else:
            message = f'OpenAI API error: {error_str[:100]}'

        return {
            'confidence': 50,
            'summary': 'Unable to complete automated analysis. Manual review required.',
            'red_flags': [message],
            'recommendation': 'manual_review',
            'reasoning': 'LLM analysis failed due to API error',
            'probable_owner': {
                'username': 'Unknown',
                'platform': 'Unknown',
                'confidence': 0,
                'contact_method': 'Manual investigation required'
            },
            'error': message
        }


def generate_outreach(owner_info, license_params):
    """
    Generate rights clearance outreach message using OpenAI

    Args:
        owner_info: dict with username, platform
            Example: {"username": "@user123", "platform": "Twitter/X"}

        license_params: dict with use_case, scope, territory, compensation
            Example:
            {
                "use_case": "breaking_news",
                "scope": "single_use",
                "territory": "worldwide",
                "compensation": "standard_rate"
            }

    Returns:
        dict: Outreach message and license summary
            Example:
            {
                "outreach_message": "Hi @user123, I'm reaching out...",
                "license_summary": "Single-use license for breaking news...",
                "next_steps": [
                    "Send message via Twitter DM",
                    "Await written confirmation",
                    "Document permission before use"
                ]
            }

    Model: gpt-4o-mini
    Temperature: 0.5 (slightly higher for natural language generation)
    Uses JSON mode for structured outputs
    """
    # Check API key
    key_valid, key_message = _check_api_key()
    if not key_valid:
        username = owner_info.get('username', 'content creator')
        platform = owner_info.get('platform', 'platform')
        use_case = license_params.get('use_case', 'content usage')
        compensation = license_params.get('compensation', 'negotiable')

        return {
            'outreach_message': f"Hi {username}, We'd like to use your content for {use_case}. Please contact us to discuss licensing terms. Compensation: {compensation}",
            'license_summary': f"Standard licensing terms for {use_case}. Territory: {license_params.get('territory', 'worldwide')}. Scope: {license_params.get('scope', 'single use')}.",
            'next_steps': [
                f"Contact {username} via {platform}",
                "Negotiate licensing terms and compensation",
                "Obtain written permission before use"
            ],
            'error': key_message
        }

    try:
        # Initialize OpenAI client
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

        # Build system message
        system_message = """Generate a professional outreach message for UGC licensing.

You will receive owner information and licensing parameters. Generate:
1. A friendly but professional outreach message (150 words max)
2. A brief license summary explaining terms in plain language
3. Next steps for the journalist

Format as JSON:
{
  "outreach_message": "<message text>",
  "license_summary": "<plain language summary>",
  "next_steps": ["<step 1>", "<step 2>", "<step 3>"]
}

Tone: Professional, respectful, clear about intent and compensation.
The message should:
- Address the creator respectfully
- Clearly state intent to license content
- Mention the use case
- Reference compensation
- Request written confirmation
- Be friendly but professional"""

        # Build user message
        user_message = f"""Owner: {owner_info.get('username', 'content creator')} on {owner_info.get('platform', 'platform')}
Use case: {license_params.get('use_case', 'content usage')}
Scope: {license_params.get('scope', 'single use')}
Territory: {license_params.get('territory', 'worldwide')}
Compensation: {license_params.get('compensation', 'standard rate')}

Generate the outreach message and license summary."""

        # Call OpenAI API
        response = client.chat.completions.create(
            model=os.getenv('OPENAI_MODEL', 'gpt-4o-mini'),
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            response_format={"type": "json_object"},
            temperature=0.5,  # Higher for natural language
            max_tokens=800,
            timeout=30.0
        )

        # Parse response
        result_text = response.choices[0].message.content
        result = json.loads(result_text)

        # Validate response
        valid, validation_message = _validate_outreach_response(result)
        if not valid:
            raise ValueError(f"Invalid LLM response: {validation_message}")

        return result

    except json.JSONDecodeError as e:
        username = owner_info.get('username', 'content creator')
        use_case = license_params.get('use_case', 'content usage')

        return {
            'outreach_message': f"Hi {username}, We'd like to use your content for {use_case}. Please contact us to discuss licensing.",
            'license_summary': "Standard licensing terms apply.",
            'next_steps': [
                "Contact content creator",
                "Negotiate terms",
                "Obtain written permission"
            ],
            'error': f'JSON parsing failed: {str(e)}'
        }

    except Exception as e:
        error_str = str(e)

        # Generate fallback message
        username = owner_info.get('username', 'content creator')
        platform = owner_info.get('platform', 'platform')
        use_case = license_params.get('use_case', 'content usage')
        compensation = license_params.get('compensation', 'negotiable')

        return {
            'outreach_message': f"Hi {username}, We'd like to use your content for {use_case}. Compensation: {compensation}. Please contact us to discuss licensing.",
            'license_summary': f"Standard licensing for {use_case}. Territory: {license_params.get('territory', 'worldwide')}.",
            'next_steps': [
                f"Contact {username} via {platform}",
                "Discuss and negotiate terms",
                "Obtain written permission"
            ],
            'error': f'OpenAI API error: {error_str[:100]}'
        }
