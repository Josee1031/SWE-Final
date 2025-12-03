import html


def sanitize_string(value):
    """
    Escape HTML characters to prevent XSS attacks.
    Returns None if input is None, otherwise returns sanitized string.
    """
    if value is None:
        return None
    return html.escape(str(value).strip())
