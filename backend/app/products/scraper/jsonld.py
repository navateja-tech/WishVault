"""
JSON-LD structured data parser.
"""
import json
from typing import Any
from bs4 import BeautifulSoup


def parse_jsonld(soup: BeautifulSoup) -> dict[str, Any]:
    """Extract product metadata from JSON-LD script blocks."""
    data: dict[str, Any] = {}

    scripts = soup.find_all("script", type="application/ld+json")
    for script in scripts:
        if not script.string:
            continue
        try:
            raw = json.loads(script.string)
            items = raw if isinstance(raw, list) else [raw]

            for item in items:
                if not isinstance(item, dict):
                    continue

                item_type = item.get("@type", "")
                # Support single string or list of types
                types = [item_type] if isinstance(item_type, str) else item_type

                if "Product" in types or "IndividualProduct" in types or "ProductGroup" in types:
                    if "name" in item and "title" not in data:
                        data["title"] = str(item["name"])

                    if "image" in item and "image_url" not in data:
                        imgs = item["image"]
                        if isinstance(imgs, list) and imgs:
                            data["image_url"] = str(imgs[0])
                        elif isinstance(imgs, str):
                            data["image_url"] = imgs
                        elif isinstance(imgs, dict) and "url" in imgs:
                            data["image_url"] = str(imgs["url"])

                    if "description" in item and "description" not in data:
                        data["description"] = str(item["description"])

                    # Extract price from offers
                    if "offers" in item:
                        offers = item["offers"]
                        offer_list = offers if isinstance(offers, list) else [offers]
                        for offer in offer_list:
                            if isinstance(offer, dict):
                                price = offer.get("price") or offer.get("lowPrice")
                                currency = offer.get("priceCurrency")
                                if price and "price" not in data:
                                    try:
                                        data["price"] = float(str(price).replace(",", "").strip())
                                    except ValueError:
                                        pass
                                if currency and "currency" not in data:
                                    data["currency"] = str(currency).upper()
        except (json.JSONDecodeError, TypeError):
            continue

    return data
