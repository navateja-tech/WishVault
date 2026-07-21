"""
Standard HTML meta tags parser.
"""
from typing import Any
from bs4 import BeautifulSoup


def parse_standard_meta(soup: BeautifulSoup) -> dict[str, Any]:
    """Extract standard HTML title and meta tag values."""
    meta_data: dict[str, Any] = {}

    # Title tag
    title_tag = soup.find("title")
    if title_tag and title_tag.string:
        meta_data["title"] = title_tag.string.strip()

    # Meta description
    desc_tag = soup.find("meta", attrs={"name": lambda x: x and x.lower() == "description"})
    if desc_tag and desc_tag.get("content"):
        meta_data["description"] = desc_tag["content"].strip()

    # Meta twitter image fallback
    twitter_img = soup.find("meta", attrs={"name": lambda x: x and x.lower() == "twitter:image"})
    if twitter_img and twitter_img.get("content"):
        meta_data["image_url"] = twitter_img["content"].strip()

    return meta_data
