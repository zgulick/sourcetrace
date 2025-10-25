"""
Reverse Image Search Module
Searches for earlier instances of images using Google reverse image search

Custom implementation using Google's reverse image search.
Free tier may be subject to rate limits and CAPTCHAs.
Graceful degradation is built in - analysis continues if search fails.

NOTE: This is a lightweight scraper for demonstration. Production would use
a paid API (TinEye, Google Vision API) for reliability.
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus
import time


def search_image(image_url):
    """
    Perform reverse image search using Google

    Args:
        image_url: URL of image to search

    Returns:
        dict: Search results with matches

    Example return (matches found):
        {
            "found": True,
            "match_count": 3,
            "earliest_match": {
                "url": "https://twitter.com/user123/status/123456",
                "domain": "twitter.com",
                "title": "Tweet title"
            },
            "all_matches": [
                {"url": "...", "domain": "...", "title": "..."},
                ...
            ],
            "search_url": "https://www.google.com/searchbyimage?..."
        }

    Error return:
        {
            "found": False,
            "error": "Rate limit exceeded" | "Search unavailable" | "Invalid URL",
            "search_url": "https://www.google.com/searchbyimage?..."
        }

    No matches return:
        {
            "found": False,
            "match_count": 0,
            "message": "No matches found",
            "search_url": "https://www.google.com/searchbyimage?..."
        }
    """
    # Validate image URL
    if not image_url or not isinstance(image_url, str):
        return {
            'found': False,
            'error': 'Invalid image URL provided'
        }

    try:
        # Construct Google reverse search URL
        encoded_url = quote_plus(image_url)
        search_url = f"https://www.google.com/searchbyimage?image_url={encoded_url}&safe=off"

        # Set headers to mimic browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none'
        }

        # Make request with timeout
        response = requests.get(search_url, headers=headers, timeout=15)

        # Check for CAPTCHA or rate limiting
        if response.status_code == 429:
            return {
                'found': False,
                'error': 'Rate limit exceeded - too many requests',
                'search_url': search_url
            }

        if response.status_code != 200:
            return {
                'found': False,
                'error': f'Search failed with status {response.status_code}',
                'search_url': search_url
            }

        # Check if Google blocked the request (CAPTCHA page)
        if 'sorry/index' in response.url or 'recaptcha' in response.text.lower():
            return {
                'found': False,
                'error': 'Google CAPTCHA detected - search unavailable via scraping',
                'message': 'Production version would use paid API',
                'search_url': search_url
            }

        # Parse HTML
        soup = BeautifulSoup(response.text, 'lxml')

        # Try to extract search results
        # Google's HTML structure changes frequently, so this is best-effort
        matches = []

        # Look for search result links (common patterns)
        # This is a simplified extraction - Google's structure varies
        result_divs = soup.find_all('div', class_='g') or soup.find_all('div', {'data-hveid': True})

        for div in result_divs[:5]:  # Limit to first 5 matches
            link = div.find('a', href=True)
            if link and link.get('href', '').startswith('http'):
                url = link['href']

                # Extract domain
                try:
                    from urllib.parse import urlparse
                    domain = urlparse(url).netloc
                except Exception:
                    domain = "unknown"

                # Extract title
                title_elem = div.find('h3') or div.find(['h2', 'h4'])
                title = title_elem.get_text(strip=True) if title_elem else "No title"

                matches.append({
                    'url': url,
                    'domain': domain,
                    'title': title
                })

        # If we found matches
        if matches:
            return {
                'found': True,
                'match_count': len(matches),
                'earliest_match': matches[0],  # First result is typically most relevant
                'all_matches': matches,
                'search_url': search_url,
                'note': 'Scraped results - production would use paid API for reliability'
            }

        # No matches found (or couldn't parse results)
        # This could mean truly no matches, or Google's HTML changed
        return {
            'found': False,
            'match_count': 0,
            'message': 'No matches found or unable to parse results',
            'search_url': search_url,
            'note': 'Manual verification recommended - try search_url in browser'
        }

    except requests.Timeout:
        return {
            'found': False,
            'error': 'Search request timed out after 15 seconds',
            'search_url': search_url if 'search_url' in locals() else None
        }

    except requests.RequestException as e:
        return {
            'found': False,
            'error': f'Network error: {str(e)}',
            'search_url': search_url if 'search_url' in locals() else None
        }

    except Exception as e:
        return {
            'found': False,
            'error': f'Unexpected error during reverse search: {str(e)}',
            'search_url': search_url if 'search_url' in locals() else None
        }
