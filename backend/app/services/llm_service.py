from typing import Any
import re


def _extract_amount(text: str) -> float | None:
    """
    Extract an amount from Hindi/Hinglish/English text.

    Examples:
    120 rupaye
    120 rupees
    ₹120
    500 ka
    500 diye
    """
    patterns = [
        r"₹\s*(\d+(?:\.\d+)?)",
        r"(\d+(?:\.\d+)?)\s*(?:rupaye|rupees|rs\.?|₹)",
        r"(\d+(?:\.\d+)?)\s*(?:ka|ke|ki)",
        r"(\d+(?:\.\d+)?)\s*(?:diye|diya)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))

    return None


def _extract_customer(text: str) -> str | None:
    """
    Handles common patterns such as:

    Raju ne ...
    Ramesh ne ...
    Anita ne ...
    """

    match = re.search(
        r"^\s*([A-Za-z]+)\s+(?:ne|ko)\b",
        text,
        re.IGNORECASE,
    )

    if match:
        return match.group(1).strip().title()

    return None


def _extract_item(text: str) -> tuple[str | None, int | None]:
    """
    Extract a few common product patterns for local testing.

    Quantity is returned only when it is explicitly present.
    """

    known_items = [
        "rice",
        "chocolate",
        "atta",
        "flour",
        "mustard oil",
        "oil",
        "sugar",
        "milk",
        "biscuit",
    ]

    text_lower = text.lower()

    item = None

    for candidate in known_items:
        if candidate in text_lower:
            item = candidate
            break

    if not item:
        return None, None

    quantity = None

    quantity_match = re.search(
        rf"\b(\d+)\s*(?:kg|kgs|packet|packets|pieces|piece|x)?\s*{re.escape(item)}\b",
        text_lower,
    )

    if quantity_match:
        quantity = int(quantity_match.group(1))

    return item, quantity


def extract_transaction(text: str) -> dict[str, Any]:
    """
    Temporary deterministic transaction extractor.

    OpenAI is currently unavailable because API credits are exhausted,
    so this function provides local semantic extraction for testing
    the rest of the MunshiAI pipeline.

    Important:
    AI interpretation happens here.
    This function does NOT write to the database.
    """

    if not text or not text.strip():
        return {
            "customer_name": None,
            "amount": None,
            "transaction_type": None,
            "money_direction": None,
            "payment_status": None,
            "items": [],
            "references": [],
            "missing_fields": ["transaction_information"],
            "possible_interpretations": [],
        }

    text_clean = text.strip()
    text_lower = text_clean.lower()

    customer = _extract_customer(text_clean)
    amount = _extract_amount(text_clean)
    item, quantity = _extract_item(text_clean)

    # ---------------------------------------------------------
    # AMBIGUOUS PAYMENT
    # Example:
    # "500 diye"
    # ---------------------------------------------------------

    payment_words = [
        "diye",
        "diya",
        "pay kiya",
        "payment ki",
        "de diye",
        "de diya",
    ]

    is_payment = any(word in text_lower for word in payment_words)

    if is_payment:

        missing_fields = []

        if not customer:
            missing_fields.append("customer_name")

        if amount is None:
            missing_fields.append("amount")

        # No customer = genuinely ambiguous.
        if not customer:
            return {
                "customer_name": None,
                "amount": amount,
                "transaction_type": None,
                "money_direction": None,
                "payment_status": None,
                "items": [],
                "references": [],
                "missing_fields": missing_fields,
                "possible_interpretations": [
                    "payment_received_from_customer",
                    "payment_made_to_supplier_or_other_party",
                ],
            }

        return {
            "customer_name": customer,
            "amount": amount,
            "transaction_type": "PAYMENT_RECEIVED",
            "money_direction": "IN",
            "payment_status": "PAID",
            "items": [],
            "references": [],
            "missing_fields": missing_fields,
            "possible_interpretations": [],
        }

    # ---------------------------------------------------------
    # SALE / CREDIT
    #
    # Example:
    # "Raju ne 120 rupaye ka chocolate liya"
    # ---------------------------------------------------------

    sale_words = [
        "liya",
        "li",
        "kharida",
        "bought",
        "purchase",
    ]

    is_sale = any(word in text_lower for word in sale_words)

    if is_sale:

        missing_fields = []

        if not customer:
            missing_fields.append("customer_name")

        if amount is None:
            missing_fields.append("amount")

        if not item:
            missing_fields.append("item")

        payment_status = (
            "CREDIT"
            if any(
                word in text_lower
                for word in [
                    "udhaar",
                    "credit",
                    "baki",
                    "baaki",
                ]
            )
            else "PAID"
        )

        items = []

        if item:
            item_data = {
                "name": item,
            }

            if quantity is not None:
                item_data["quantity"] = quantity

            items.append(item_data)

        return {
            "customer_name": customer,
            "amount": amount,
            "transaction_type": "SALE",
            "money_direction": "IN",
            "payment_status": payment_status,
            "items": items,
            "references": [],
            "missing_fields": missing_fields,
            "possible_interpretations": [],
        }

    # ---------------------------------------------------------
    # UNKNOWN / INCOMPLETE
    # ---------------------------------------------------------

    missing_fields = []

    if not customer:
        missing_fields.append("customer_name")

    if amount is None:
        missing_fields.append("amount")

    return {
        "customer_name": customer,
        "amount": amount,
        "transaction_type": None,
        "money_direction": None,
        "payment_status": None,
        "items": [],
        "references": [],
        "missing_fields": missing_fields or ["transaction_information"],
        "possible_interpretations": [],
    }