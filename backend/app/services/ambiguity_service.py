import re
from typing import Any


def detect_ambiguity(
    data: dict[str, Any],
    original_text: str = "",
) -> dict[str, Any]:
    """
    Detect financially important ambiguity.

    Clear grammatical direction (NAME ne / NAME ko) is not treated as
    ambiguous just because the verb is diya/diye.
    """
    possible_interpretations = data.get("possible_interpretations") or []
    missing_fields = data.get("missing_fields") or []
    text = (original_text or "").lower().strip()

    if possible_interpretations:
        return {
            "is_ambiguous": True,
            "reason": "Multiple possible interpretations detected.",
            "clarification_question": _clarification_question(data, text),
        }

    if "customer" in missing_fields and data.get("amount") is not None and _looks_like_payment(text):
        amount = data["amount"]
        amount_label = int(amount) if float(amount).is_integer() else amount
        return {
            "is_ambiguous": True,
            "reason": "Customer/recipient is missing for this payment.",
            "clarification_question": f"Kisko ₹{amount_label} diye?",
        }

    if not data.get("money_direction") or not data.get("transaction_type"):
        return {
            "is_ambiguous": True,
            "reason": "Transaction meaning could not be determined.",
            "clarification_question": _clarification_question(data, text),
        }

    if missing_fields:
        return {
            "is_ambiguous": True,
            "reason": "Required transaction information is missing.",
            "clarification_question": _clarification_question(data, text),
        }

    return {
        "is_ambiguous": False,
        "reason": None,
        "clarification_question": None,
    }


def _looks_like_payment(text: str) -> bool:
    return bool(re.search(r"\b(diya|diye|de diye|de diya|chukaya|payment)\b", text))


def _clarification_question(data: dict[str, Any], text: str) -> str:
    amount = data.get("amount")
    if amount is not None and "customer" in (data.get("missing_fields") or []):
        amount_label = int(amount) if float(amount).is_integer() else amount
        if _looks_like_payment(text):
            return f"Kisko ₹{amount_label} diye?"
        return f"Kis customer ke liye ₹{amount_label} ka transaction hai?"
    if not data.get("transaction_type"):
        return "Yeh sale hai ya payment?"
    if "item" in (data.get("missing_fields") or []):
        return "Kaunsa item sale hua?"
    return "Please provide the missing transaction detail."
