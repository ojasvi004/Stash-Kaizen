"""Gemini REST client — NLP, intent extraction, negotiation, and text generation"""
import json
import re

import httpx

from app.core.config import settings

GEMINI_MODEL_FALLBACKS = [
    settings.GEMINI_MODEL or "gemini-flash-latest",
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-pro-latest",
]


class GeminiAPIError(RuntimeError):
    pass


def _normalize_model_name(model_name: str) -> str:
    name = (model_name or "").strip()
    if name.startswith("models/"):
        return name.removeprefix("models/")
    return name


def _model_endpoint(model_name: str) -> str:
    return f"https://generativelanguage.googleapis.com/v1beta/models/{_normalize_model_name(model_name)}:generateContent"


async def _generate_content(prompt: str) -> str:
    if not settings.GOOGLE_AI_API_KEY:
        raise GeminiAPIError("GOOGLE_AI_API_KEY is not configured")

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt,
                    }
                ]
            }
        ]
    }

    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": settings.GOOGLE_AI_API_KEY,
    }

    last_error = None
    async with httpx.AsyncClient(timeout=60.0) as client:
        for model_name in dict.fromkeys(_normalize_model_name(name) for name in GEMINI_MODEL_FALLBACKS if name):
            endpoint = _model_endpoint(model_name)
            response = await client.post(endpoint, headers=headers, json=payload)

            if response.status_code == 404 or response.status_code == 503 or response.status_code == 429:
                last_error = GeminiAPIError(
                    f"Gemini API request failed ({response.status_code}) for {model_name}: {response.text}"
                )
                continue

            if response.status_code >= 400:
                raise GeminiAPIError(
                    f"Gemini API request failed ({response.status_code}) for {model_name}: {response.text}"
                )

            data = response.json()
            candidates = data.get("candidates") or []
            if not candidates:
                last_error = GeminiAPIError(f"Gemini API returned no candidates for {model_name}")
                continue

            parts = candidates[0].get("content", {}).get("parts", [])
            text = "".join(part.get("text", "") for part in parts).strip()
            if not text:
                last_error = GeminiAPIError(f"Gemini API returned empty text for {model_name}")
                continue

            return text

    if last_error:
        raise last_error
    raise GeminiAPIError("No Gemini model candidates were configured")


def _extract_json(text: str) -> dict:
    """Parse JSON returned by Gemini, tolerating fenced blocks."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


async def extract_intent_and_entities(transcript: str) -> dict:
    """Extract intent and entities from a voice transcript in any language."""
    prompt = """You are Stash, an AI godown management assistant for India.
    Extract the intent and entities from this voice transcript.
    The transcript may be in any language, including mixed or code-switched text.

    Return ONLY valid JSON with this structure:
    {
      "intent": "stock_arrival|order_placed|order_status|price_offer|delivery_query|cancel_order|stock_query",
      "entities": {
        "product": "string or null",
        "quantity": "number or null",
        "lot_number": "string or null",
        "expiry_date": "YYYY-MM-DD or null",
        "price": "number or null",
        "order_id": "string or null",
        "phone": "string or null"
      },
      "language_detected": "hi|en|hinglish",
      "confidence": 0.0-1.0
    }

        Try to detect the language as accurately as possible using an ISO language code or a close label such as hi, en, hinglish, es, ar, fr, etc.

        Transcript: """ + transcript

    response_text = await _generate_content(prompt)
    return _extract_json(response_text)


async def classify_telegram_text_query(text: str) -> dict:
        """Classify a free-form Telegram text query and extract the target intent."""
        prompt = f"""You are Stash, a multilingual AI assistant for a godown management platform.
Classify the user text and extract any useful entities.

Return ONLY valid JSON with this structure:
{{
    "intent": "inventory_add|inventory_query|analytics_query|delivery_query|order_query|alert_query|greeting|help|unknown",
    "entities": {{
        "product": "string or null",
        "quantity": "number or null",
        "unit": "string or null",
        "threshold": "number or null",
        "expiry_date": "YYYY-MM-DD or null",
        "order_id": "string or null",
        "phone": "string or null",
        "search_term": "string or null"
    }},
    "reply_language": "ISO 639-1 code or language tag when possible",
    "confidence": 0.0-1.0
}}

Rules:
- If the message asks to add stock, receive goods, restock, or update inventory, use inventory_add.
- If the message asks about stock, quantity, availability, or specific items, use inventory_query.
- If the message asks about sales, revenue, orders, deliveries, performance, trends, or dashboard numbers, use analytics_query.
- If the message asks about delivery status, use delivery_query.
- If the message asks about an order, use order_query.
- If it is a warning or stock-risk question, use alert_query.
- Detect the user's reply language as accurately as possible, even for non-English scripts.

Text: {text}"""

        response_text = await _generate_content(prompt)
        return _extract_json(response_text)


async def rewrite_in_language(text: str, language_code: str) -> str:
        """Rewrite a response in the requested language while preserving meaning and formatting."""
        prompt = f"""Rewrite the following response in the target language.

Target language: {language_code or 'en'}

Requirements:
- Preserve numbers, product names, order refs, currency amounts, and HTML tags.
- Keep the response concise and natural.
- If the target language is English, you may keep the text as-is.

Response:
{text}"""

        return await _generate_content(prompt)


async def negotiate_price(
    product: str,
    offered_price: float,
    floor: float,
    ceiling: float,
    market_rate: float,
    language: str = "hi",
) -> dict:
    """AI price negotiation with 4-tier strategy"""
    prompt = f"""You are a price negotiation AI for Stash godown management.
    Negotiate price for: {product}
    Buyer offered: ₹{offered_price}
    Your floor price: ₹{floor}
    Your ceiling/target: ₹{ceiling}
    Current market rate: ₹{market_rate}

    Apply this 4-tier strategy:
    Tier 1: offered >= market_rate → accept immediately
    Tier 2: floor <= offered < market_rate → accept with minimum quantity condition
    Tier 3: offered < floor but > floor*0.9 → counter at floor+5%, add urgency
    Tier 4: offered < floor*0.9 → hard refuse politely

    Respond in {language}. Return JSON:
    {{
      "decision": "accept|counter|refuse",
      "counter_price": number or null,
      "message": "spoken response in {language}",
      "minimum_quantity": number or null
    }}"""

    response_text = await _generate_content(prompt)
    return _extract_json(response_text)


async def generate_telegram_message(
    context: str, buyer_name: str, language_code: str = "en"
) -> str:
    """Generate a personalized Telegram message in the buyer's language"""
    lang_map = {
        "hi": "Hindi",
        "ta": "Tamil",
        "te": "Telugu",
        "bn": "Bengali",
        "mr": "Marathi",
        "gu": "Gujarati",
        "kn": "Kannada",
        "ml": "Malayalam",
        "pa": "Punjabi",
        "or": "Odia",
        "en": "English",
    }
    language = lang_map.get(language_code, "English")

    prompt = f"""Generate a friendly, professional Telegram message for a godown customer.
    Customer name: {buyer_name}
    Context: {context}
    Language: {language}
    Keep it concise, warm, and use the customer's name naturally.
    Use HTML formatting (bold with <b>, code with <code>).
    Do not use markdown."""

    return await _generate_content(prompt)


async def generate_voice_response(
    intent: str, result: dict, language: str = "hi"
) -> str:
    """Generate natural spoken response for voice call"""
    prompt = f"""Generate a natural spoken response for a voice call system.
    Intent handled: {intent}
    Result data: {json.dumps(result)}
    Language: {language}
    Keep it under 30 words. Natural, conversational. No punctuation that sounds odd when spoken."""

    return await _generate_content(prompt)


async def summarize_disruption_for_owner(alerts: list) -> str:
    """Summarize supply chain disruption alerts"""
    prompt = f"""Summarize these supply chain disruption alerts for a godown owner in 2-3 sentences.
    Be specific about products, quantities, and recommended actions.
    Alerts: {json.dumps(alerts)}"""

    return await _generate_content(prompt)
