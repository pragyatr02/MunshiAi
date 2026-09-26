from typing import Any


def calculate_confidence(
    data: dict[str, Any],
    context_result: dict[str, Any] | None = None,
) -> int:
    context_result = context_result or {}

    score = 0

    # 20 points: customer is clearly identified
    if data.get("customer_name"):
        score += 20

    # 20 points: amount is clearly identified
    if data.get("amount") is not None:
        score += 20

    # 20 points: transaction type is identified
    if data.get("transaction_type"):
        score += 20

    # 20 points: money direction is explicitly determined
    if data.get("money_direction"):
        score += 20

    # 20 points: context was actually used and successfully resolved
    if (
        context_result.get("context_used")
        and context_result.get("resolved_customer")
    ):
        score += 20

    return score


def get_confidence_level(score: int) -> str:
    if score >= 80:
        return "HIGH"
    elif score >= 60:
        return "MEDIUM"
    else:
        return "LOW"