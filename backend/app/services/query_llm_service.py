import re
from typing import Any


def extract_query_intent(text: str) -> dict[str, Any]:
    """
    Temporary local mock for query intent detection.

    This replaces the OpenAI API while API credits are unavailable.
    The rest of the query pipeline remains real.
    """

    text_lower = text.lower().strip()

    # Customer balance queries
    balance_keywords = [
        "baki",
        "balance",
        "owe",
        "owes",
        "kitna dena",
        "kitna lena",
        "kitne paise",
        "kitna paisa",
    ]

    if any(keyword in text_lower for keyword in balance_keywords):

        customer_name = None

        # Try to extract the name after common phrases
        patterns = [
            r"([a-zA-Z]+)\s+(?:ka|ki|ke)\s+(?:kitna|kitni)",
            r"([a-zA-Z]+)\s+(?:owes|balance)",
            r"(?:balance|baki)\s+(?:of|for)\s+([a-zA-Z]+)",
        ]

        for pattern in patterns:
            match = re.search(pattern, text_lower)

            if match:
                customer_name = match.group(1).capitalize()
                break

        return {
            "intent": "CUSTOMER_BALANCE",
            "customer_name": customer_name,
        }

    # Total sales queries
    sales_keywords = [
        "total sales",
        "sales kitni",
        "sales kitna",
        "meri sales",
        "sale kitni",
        "sale kitna",
    ]

    if any(keyword in text_lower for keyword in sales_keywords):
        return {
            "intent": "TOTAL_SALES",
            "customer_name": None,
        }

    # Recent transaction queries
    recent_keywords = [
        "recent transactions",
        "recent transaction",
        "latest transactions",
        "latest transaction",
        "recent entries",
        "latest entries",
        "recent records",
    ]

    if any(keyword in text_lower for keyword in recent_keywords):
        return {
            "intent": "RECENT_TRANSACTIONS",
            "customer_name": None,
        }

    return {
        "intent": "UNKNOWN",
        "customer_name": None,
    }