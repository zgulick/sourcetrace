"""
EXIF Analyzer Module
Extracts and parses EXIF metadata from images

Uses exifread library to extract camera metadata, timestamps, GPS coordinates,
and other technical information from image files.
"""

import exifread
from datetime import datetime
from io import BytesIO
from PIL import Image


def _convert_to_degrees(value):
    """
    Convert GPS coordinates to decimal degrees

    Args:
        value: GPS coordinate in degrees/minutes/seconds format

    Returns:
        float: Decimal degrees
    """
    try:
        d = float(value.values[0].num) / float(value.values[0].den)
        m = float(value.values[1].num) / float(value.values[1].den)
        s = float(value.values[2].num) / float(value.values[2].den)
        return d + (m / 60.0) + (s / 3600.0)
    except (AttributeError, ZeroDivisionError, IndexError):
        return None


def _parse_datetime(dt_string):
    """
    Parse EXIF datetime string to ISO 8601 format

    Args:
        dt_string: EXIF datetime string (YYYY:MM:DD HH:MM:SS)

    Returns:
        str: ISO 8601 formatted datetime or None
    """
    try:
        dt = datetime.strptime(str(dt_string), '%Y:%M:%D %H:%M:%S')
        return dt.isoformat() + 'Z'
    except (ValueError, AttributeError):
        return None


def extract_exif(image_path_or_bytes):
    """
    Extract EXIF metadata from image

    Args:
        image_path_or_bytes: File path (str) or bytes/BytesIO object

    Returns:
        dict: EXIF metadata with standardized fields

    Returns structure:
        {
            "camera_make": "Apple",
            "camera_model": "iPhone 14 Pro",
            "timestamp": "2024-10-15T14:23:45Z",
            "gps_latitude": 31.5017,
            "gps_longitude": 34.4668,
            "gps_latitude_ref": "N",
            "gps_longitude_ref": "E",
            "software": "iOS 17.1.2",
            "orientation": 1,
            "flash": False,
            "focal_length": 24.0,
            "iso": 100,
            "f_number": 1.8,
            "exposure_time": "1/120",
            "has_exif": True
        }

    Error returns:
        {"error": "No EXIF metadata found", "has_exif": False}
        {"error": "Unable to read image file", "has_exif": False}
    """
    try:
        # Handle both file paths and byte objects
        if isinstance(image_path_or_bytes, (bytes, BytesIO)):
            if isinstance(image_path_or_bytes, bytes):
                f = BytesIO(image_path_or_bytes)
            else:
                f = image_path_or_bytes
                f.seek(0)  # Reset to beginning
        else:
            # File path
            try:
                f = open(image_path_or_bytes, 'rb')
            except (FileNotFoundError, IOError) as e:
                return {
                    'error': f'Unable to read image file: {str(e)}',
                    'has_exif': False
                }

        # Read EXIF tags
        tags = exifread.process_file(f, details=False)

        # Close file if we opened it
        if isinstance(image_path_or_bytes, str):
            f.close()

        # If no EXIF data found
        if not tags or len(tags) == 0:
            return {
                'error': 'No EXIF metadata found (common for screenshots and social media images)',
                'has_exif': False
            }

        # Extract and structure EXIF data
        result = {'has_exif': True}

        # Camera information
        if 'Image Make' in tags:
            result['camera_make'] = str(tags['Image Make']).strip()

        if 'Image Model' in tags:
            result['camera_model'] = str(tags['Image Model']).strip()

        # Timestamp
        if 'EXIF DateTimeOriginal' in tags:
            result['timestamp'] = _parse_datetime(tags['EXIF DateTimeOriginal'])
        elif 'Image DateTime' in tags:
            result['timestamp'] = _parse_datetime(tags['Image DateTime'])

        # GPS coordinates
        if 'GPS GPSLatitude' in tags and 'GPS GPSLatitudeRef' in tags:
            lat = _convert_to_degrees(tags['GPS GPSLatitude'])
            lat_ref = str(tags['GPS GPSLatitudeRef'])
            if lat is not None:
                result['gps_latitude'] = lat if lat_ref == 'N' else -lat
                result['gps_latitude_ref'] = lat_ref

        if 'GPS GPSLongitude' in tags and 'GPS GPSLongitudeRef' in tags:
            lon = _convert_to_degrees(tags['GPS GPSLongitude'])
            lon_ref = str(tags['GPS GPSLongitudeRef'])
            if lon is not None:
                result['gps_longitude'] = lon if lon_ref == 'E' else -lon
                result['gps_longitude_ref'] = lon_ref

        # Software
        if 'Image Software' in tags:
            result['software'] = str(tags['Image Software']).strip()

        # Orientation
        if 'Image Orientation' in tags:
            try:
                result['orientation'] = int(str(tags['Image Orientation']))
            except ValueError:
                pass

        # Flash
        if 'EXIF Flash' in tags:
            flash_value = str(tags['EXIF Flash'])
            result['flash'] = 'Flash fired' in flash_value

        # Focal length
        if 'EXIF FocalLength' in tags:
            try:
                focal = tags['EXIF FocalLength']
                if hasattr(focal, 'values') and len(focal.values) > 0:
                    result['focal_length'] = float(focal.values[0].num) / float(focal.values[0].den)
            except (AttributeError, ZeroDivisionError, IndexError):
                pass

        # ISO
        if 'EXIF ISOSpeedRatings' in tags:
            try:
                result['iso'] = int(str(tags['EXIF ISOSpeedRatings']))
            except ValueError:
                pass

        # F-number (aperture)
        if 'EXIF FNumber' in tags:
            try:
                fnumber = tags['EXIF FNumber']
                if hasattr(fnumber, 'values') and len(fnumber.values) > 0:
                    result['f_number'] = float(fnumber.values[0].num) / float(fnumber.values[0].den)
            except (AttributeError, ZeroDivisionError, IndexError):
                pass

        # Exposure time
        if 'EXIF ExposureTime' in tags:
            result['exposure_time'] = str(tags['EXIF ExposureTime'])

        return result

    except Exception as e:
        return {
            'error': f'Error processing EXIF data: {str(e)}',
            'has_exif': False
        }
