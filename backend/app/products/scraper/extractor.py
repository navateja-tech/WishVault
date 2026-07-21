"""
Main Metadata Extraction Pipeline Orchestrator.
"""
from typing import Any
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup

from app.core.config import settings
from app.products.scraper.opengraph import parse_opengraph
from app.products.scraper.jsonld import parse_jsonld
from app.products.scraper.meta import parse_standard_meta
from app.products.scraper.fallback import parse_fallback


async def extract_product_metadata(url: str) -> dict[str, Any]:
    """Execute metadata extraction pipeline for a given product URL.

    Extraction order of precedence:
    1. Open Graph tags
    2. JSON-LD structured data
    3. Standard HTML meta tags
    4. BeautifulSoup fallback
    """
    # Ensure scheme is present
    if not url.startswith("http://") and not url.startswith("https://"):
        url = f"https://{url}"

    parsed = urlparse(url)
    domain = parsed.netloc.replace("www.", "")

    # Default fallback object
    extracted: dict[str, Any] = {
        "url": url,
        "domain": domain,
        "website": domain.split(".")[0].capitalize(),
        "title": f"Product from {domain.split('.')[0].capitalize()}",
        "image_url": None,
        "price": None,
        "currency": "USD",
        "description": None,
        "raw_metadata": {},
    }

    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=settings.SCRAPER_TIMEOUT,
            headers={"User-Agent": settings.SCRAPER_USER_AGENT},
        ) as client:
            response = await client.get(url)
            html = response.text
    except Exception as e:
        # Return fallback on network/DNS/timeout errors gracefully
        return extracted

    try:
        soup = BeautifulSoup(html, "lxml")
    except Exception:
        soup = BeautifulSoup(html, "html.parser")

    # Step 1: Parse OpenGraph
    og_data = parse_opengraph(soup)
    
    # Step 2: Parse JSON-LD
    jsonld_data = parse_jsonld(soup)

    # Step 3: Parse Standard Meta Tags
    meta_data = parse_standard_meta(soup)

    # Step 4: Parse Fallback
    fallback_data = parse_fallback(url, soup)

    # Merge according to precedence rule (OG > JSON-LD > Standard Meta > Fallback)
    for source in [fallback_data, meta_data, jsonld_data, og_data]:
        for key in ["title", "image_url", "website", "domain", "price", "currency", "description"]:
            val = source.get(key)
            if val is not None and val != "":
                extracted[key] = val

    # Store raw metadata for future AI tagging / analytics
    extracted["raw_metadata"] = {
        "og": og_data,
        "jsonld": jsonld_data,
        "meta": meta_data,
    }

    return extracted
