"""
BeautifulSoup fallback heuristics for missing metadata.
"""
from urllib.parse import urlparse
from typing import Any
from bs4 import BeautifulSoup


def parse_fallback(url: str, soup: BeautifulSoup) -> dict[str, Any]:
    """Fallback heuristics when OpenGraph and JSON-LD metadata are missing."""
    fallback: dict[str, Any] = {}
    parsed_url = urlparse(url)

    # Extract Domain & Website Name
    domain = parsed_url.netloc.replace("www.", "")
    fallback["domain"] = domain
    
    # Capitalize domain as site name (e.g. amazon.com -> Amazon)
    site_name = domain.split(".")[0].capitalize()
    fallback["website"] = site_name

    # Fallback title from URL path if no title tag found
    path_segments = [s for s in parsed_url.path.split("/") if s]
    if path_segments:
        slug = path_segments[-1].replace("-", " ").replace("_", " ")
        if len(slug) > 3:
            fallback["title"] = slug.capitalize()
    else:
        fallback["title"] = f"Product from {site_name}"

    # Image heuristic: find largest image or first <img> with src
    imgs = soup.find_all("img")
    for img in imgs:
        src = img.get("src") or img.get("data-src")
        if src and (src.startswith("http") or src.startswith("//")):
            if not any(excluded in src.lower() for excluded in ["logo", "icon", "avatar", "badge"]):
                if src.startswith("//"):
                    src = f"https:{src}"
                fallback["image_url"] = src
                break

    return fallback
