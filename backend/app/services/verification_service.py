from typing import Any

from app.services.confidence_service import (
    calculate_confidence,
    get_confidence_level,
)
from app.services.ambiguity_service import detect_ambiguity


def evaluate_transaction(
    data: dict[str, Any],
    original_text: str = "",
    context_result: dict[str, Any] | None = None,
) -> dict[str, Any]:

    context_result = context_result or {}

    evaluation_data = data.copy()
    resolved_customer = context_result.get("resolved_customer")

    if not evaluation_data.get("customer_name") and resolved_customer:
        evaluation_data["customer_name"] = resolved_customer
        missing = [
            field
            for field in evaluation_data.get("missing_fields", [])
            if field != "customer"
        ]
        evaluation_data["missing_fields"] = missing

    confidence_score = calculate_confidence(
        evaluation_data,
        context_result,
    )
    confidence_level = get_confidence_level(confidence_score)

    ambiguity = detect_ambiguity(evaluation_data, original_text)

    if (
        evaluation_data.get("references")
        and not resolved_customer
    ):
        ambiguity = {
            "is_ambiguous": True,
            "reason": "Reference could not be resolved from available context.",
            "clarification_question": "Kis customer ki baat ho rahi hai?",
        }

    if ambiguity["is_ambiguous"]:
        decision = "CLARIFY"
    elif confidence_level == "HIGH":
        decision = "AUTO_VERIFY"
    elif confidence_level == "MEDIUM":
        decision = "CONFIRM"
    else:
        decision = "CLARIFY"

    return {
        "confidence_score": confidence_score,
        "confidence_level": confidence_level,
        "is_ambiguous": ambiguity["is_ambiguous"],
        "ambiguity_reason": ambiguity["reason"],
        "clarification_question": ambiguity.get("clarification_question"),
        "decision": decision,
        "context_used": context_result.get("context_used", False),
        "resolved_customer": resolved_customer,
        "confidence": round(confidence_score / 100, 2),
        "ambiguity": ambiguity["is_ambiguous"],
    }
