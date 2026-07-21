"""
OpenGraph metadata parser.
"""
from typing import Any
from bs4 import BeautifulSoup


def parse_opengraph(soup: BeautifulSoup) -> dict[str, Any]:
    """Extract OpenGraph meta properties from HTML soup."""
    og_data: dict[str, Any] = {}

    meta_tags = soup.find_all("meta")
    for tag in meta_tags:
        prop = tag.get("property", "").lower()
        content = tag.get("content", "").strip()

        if not prop or not content:
            continue

        if prop == "og:title":
            og_data["title"] = content
        elif prop in ("og:image", "og:image:secure_url"):
            if "image_url" not in og_data:  # Take first valid image
                og_data["image_url"] = content
        elif prop == "og:site_name":
            og_data["website"] = content
        elif prop == "og:description":
            og_data["description"] = content
        elif prop in ("og:price:amount", "product:price:amount"):
            try:
                # Clean currency symbols
                clean_price = content.replace("$", "").replace("₹", "").replace(",", "").strip()
                og_data["price"] = float(clean_price)
            except ValueError:
                pass
        elif prop in ("og:price:currency", "product:price:currency"):
            og_data["currency"] = content.upper()

    return og_data
