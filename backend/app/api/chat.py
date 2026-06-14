"""
Chat API — Admin AI Chatbot with Generative UI
Endpoint prefix: /api/chat
Powered by Google Gemini 1.5 Pro with structured JSON responses.
"""
import json
import logging
import uuid
from datetime import datetime
from typing import Optional
import asyncio

import httpx
from fastapi import APIRouter, HTTPException, File, Form, UploadFile
from pydantic import BaseModel

from app.core.config import settings
from app.services.firestore_service import firestore_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["chat"])

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
GEMINI_FLASH_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"



class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    query: str
    history: list[ChatMessage] = []
    user_phone: Optional[str] = None
    mode: str = "text"  # "text" | "voice" | "file"


class ChatResponse(BaseModel):
    id: str
    type: str  # "text" | "list" | "table" | "chart" | "card" | "approval" | "mixed"
    title: Optional[str] = None
    content: object
    voice_reply: str
    created_at: str



async def _fetch_context() -> dict:
    """Fetch live dashboard context for the AI prompt."""
    context = {
        "inventory_summary": {},
        "recent_orders": [],
        "low_stock_items": [],
        "restock_pending": [],
        "stats": {},
    }

    if not firestore_service.is_enabled:
        return context

    try:
        async def fetch_inv():
            docs = []
            async for doc in firestore_service.db.collection("inventory").stream():
                d = doc.to_dict()
                d["id"] = doc.id
                docs.append(d)
            return docs

        async def fetch_ord():
            docs = []
            async for doc in firestore_service.db.collection("orders").limit(20).stream():
                d = doc.to_dict()
                d["id"] = doc.id
                docs.append(d)
            return docs

        async def fetch_bills():
            docs = []
            async for doc in firestore_service.db.collection("bills").limit(100).stream():
                docs.append(doc.to_dict())
            return docs

        async def fetch_del():
            docs = []
            async for doc in firestore_service.db.collection("delivery_updates").limit(20).stream():
                d = doc.to_dict()
                d["id"] = doc.id
                docs.append(d)
            return docs

        inventory, orders, bills, deliveries = await asyncio.gather(
            fetch_inv(), fetch_ord(), fetch_bills(), fetch_del()
        )

        low_stock = [
            i for i in inventory
            if float(i.get("current_stock", 0)) < float(i.get("threshold", 0))
        ]
        critical = [
            i for i in inventory
            if float(i.get("current_stock", 0)) < float(i.get("threshold", 0)) * 0.5
        ]

        context["inventory_summary"] = {
            "total_products": len(inventory),
            "low_stock_count": len(low_stock),
            "critical_count": len(critical),
        }
        context["low_stock_items"] = [
            {
                "name": i.get("product_name"),
                "current_stock": i.get("current_stock"),
                "threshold": i.get("threshold"),
                "unit": i.get("unit"),
            }
            for i in low_stock[:8]
        ]

        orders.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        context["recent_orders"] = [
            {
                "ref": o.get("order_ref"),
                "status": o.get("status"),
                "amount": o.get("total_amount"),
                "date": o.get("created_at", "")[:10] if o.get("created_at") else "",
            }
            for o in orders[:8]
        ]

        context["stats"] = {
            "pending_payments": sum(float(b.get("total") or 0) for b in bills if b.get("status") != "paid"),
            "collected": sum(float(b.get("total") or 0) for b in bills if b.get("status") == "paid"),
            "total_bills": len(bills),
        }

        context["deliveries"] = deliveries

    except Exception as exc:
        logger.warning("Context fetch error: %s", exc)

    return context


SYSTEM_PROMPT = """You are Stash AI — the intelligent admin assistant for Stash, India's godown management platform.
You help warehouse admins query their inventory, orders, suppliers, billing, and get smart restock recommendations.
You are also fully capable of answering ANY general questions, providing tips on stock management, and handling out-of-the-box queries gracefully. Always provide a helpful and informative response to any question asked.
You can also perform database mutations (like adding inventory, creating orders, sharing bills on telegram, and initiating barter) when explicitly requested.

IMPORTANT: You MUST always respond with a single valid JSON object using this exact schema:
{
  "type": "text" | "list" | "table" | "chart" | "card" | "approval" | "mixed",
  "title": "Short descriptive title (optional)",
  "content": <see below>,
  "voice_reply": "A concise 1-2 sentence spoken summary of the answer"
}

Content schema by type:
- "text": { "markdown": "Full markdown text answer" }
- "list": { "items": [{ "label": "...", "value": "...", "badge": "ok|warn|error|info", "subtitle": "..." }] }
- "table": { "headers": ["Col1", ...], "rows": [["val1", ...], ...] }
- "chart": { "chart_type": "bar"|"line"|"pie", "labels": ["..."], "datasets": [{ "label": "...", "values": [0, ...], "color": "#hex" }] }
- "card": { "items": [{ "title": "...", "value": "...", "icon": "inventory|orders|revenue|alert|supplier", "trend": "+5%" }] }
- "approval": { "action": "add_inventory" | "restock" | "create_order" | "share_bill_telegram" | "start_barter", "items": [{ "id": "...", "name": "...", "qty": 0, "unit": "...", "cost": 0, "status": "pending", "threshold": 0 }] }
- "mixed": { "sections": [<any of the above content objects with "type" key each>] }

Rules:
- Use "approval" when the user asks to add an item to inventory, restock, create a new order, share a bill via Telegram, or start a barter negotiation. Populate the 'items' array with the extracted details. The user must approve it first.
- For "create_order": use 'name' for buyer name (or product name if buyer missing), 'qty' for quantity, 'cost' for total amount, 'unit' for unit.
- For "share_bill_telegram": use 'id' for bill_ref (e.g. INV-1234), 'name' for "Share Bill on Telegram".
- For "start_barter": use 'name' for product to barter, 'qty' for requested quantity.
- Use "chart" aggressively for revenue trends, data summaries, stock history, and demand forecasts. Always visualize analytics!
- Use "list" for inventory items, stock levels, supplier lists
- Use "table" for orders, bills, deliveries data
- Use "card" for quick KPI summaries and dashboard stats
- Use "approval" for restock suggestions the admin can approve/decline
- Use "text" for general questions, explanations, greetings
- Keep voice_reply short and natural (it will be read aloud)
- Always reference the live context data provided if available
- For Indian rupee values, use ₹ symbol
- Detect the language of the user's query and respond in the same language. Keep the JSON structure identical but translate the text values inside 'content' and 'voice_reply' to the user's language.
- CRITICAL: Embrace the persona of an Indian godown trader. Liberally use Indian wholesale market slangs and terminologies natively in your conversational text and voice replies (e.g., "bhai", "hathi", "seth ji", "maal", "peti", "khata", "party", "bahi-khata", "bhaiya", "boss"). Do this naturally in all languages you respond in, mixing these slangs as is typical in Indian trading circles.
- Do NOT include any text outside the JSON object
"""


async def _call_gemini(
    query: str,
    history: list[ChatMessage],
    context: dict,
    image_base64: Optional[str] = None,
) -> dict:
    """Call Gemini and parse the generative UI JSON response."""
    if not settings.GOOGLE_AI_API_KEY:
        return {
            "type": "text",
            "title": None,
            "content": {"markdown": "AI service not configured. Please add GOOGLE_AI_API_KEY."},
            "voice_reply": "AI service not configured.",
        }

    context_str = json.dumps(context, indent=2, default=str)
    context_message = f"LIVE STASH DATA:\n```json\n{context_str}\n```\n\nUser query: {query}"

    # Build conversation history
    contents = []
    for msg in history[-6:]:  # last 6 turns of context
        role = "user" if msg.role == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg.content}]
        })

    # Current message — optionally multimodal
    current_parts = [{"text": context_message}]
    if image_base64:
        current_parts.append({
            "inline_data": {
                "mime_type": "image/jpeg",
                "data": image_base64
            }
        })
    contents.append({"role": "user", "parts": current_parts})

    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": contents,
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 2048,
            "responseMimeType": "application/json",
        },
    }

    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": settings.GOOGLE_AI_API_KEY,
    }

    try:
        url = GEMINI_API_URL if image_base64 else GEMINI_FLASH_URL
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)

        if resp.status_code >= 400:
            logger.error("Gemini API error %d: %s", resp.status_code, resp.text[:300])
            return _fallback_response(query)

        data = resp.json()
        candidates = data.get("candidates") or []
        if not candidates:
            return _fallback_response(query)

        raw_text = ""
        for part in candidates[0].get("content", {}).get("parts", []):
            raw_text += part.get("text", "")

        raw_text = raw_text.strip()
        # Strip markdown code fences if present
        if raw_text.startswith("```"):
            import re
            raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
            raw_text = re.sub(r"\s*```$", "", raw_text)

        parsed = json.loads(raw_text)
        return parsed

    except json.JSONDecodeError as e:
        logger.warning("Gemini JSON parse error: %s", e)
        # Try to extract just the markdown or voice_reply text if it was a broken JSON
        import re
        match = re.search(r'"markdown"\s*:\s*"([^"]+)"', raw_text)
        if match:
            return _text_response(match.group(1))
            
        match = re.search(r'"voice_reply"\s*:\s*"([^"]+)"', raw_text)
        if match:
            return _text_response(match.group(1))
            
        return _text_response("Sorry, my response was corrupted. Please try asking again.")
    except Exception as e:
        logger.error("Gemini call failed: %s", e)
        return _fallback_response(query)


def _fallback_response(query: str) -> dict:
    return {
        "type": "text",
        "title": "Stash AI",
        "content": {"markdown": f"I'm having trouble processing that right now. Please try again in a moment."},
        "voice_reply": "I'm having trouble processing that. Please try again.",
    }


def _text_response(text: str) -> dict:
    return {
        "type": "text",
        "title": None,
        "content": {"markdown": text},
        "voice_reply": text[:200],
    }


def _get_static_or_context_response(query: str, context: dict) -> dict | None:
    q = query.strip().lower()
    
    # 1. Greetings
    if q in ["hi", "hello", "hey", "namaste", "greetings", "good morning", "good afternoon", "good evening", "how are you"]:
        return {
            "type": "text",
            "title": "Welcome",
            "content": {"markdown": "Hello! I am Stash AI, your godown assistant. How can I help you today? You can ask me about stock levels, orders, revenue, or restock suggestions."},
            "voice_reply": "Hello! How can I help you today?"
        }
    
    # 2. Help
    if q in ["help", "what can you do", "commands", "menu"]:
        return {
            "type": "text",
            "title": "Stash AI Help",
            "content": {
                "markdown": "Here is what I can help you with:\n\n"
                            "- 📦 **Inventory & stock levels**: Ask 'Show stock list' or 'Show low stock'\n"
                            "- 🛒 **Orders & billing**: Ask 'Show recent orders' or 'Total pending payments'\n"
                            "- 📊 **Revenue & analytics**: Ask 'Revenue summary' or 'Weekly trends'\n"
                            "- 🔄 **Restock suggestions**: Ask 'Restock suggestions' or 'EOQ recommendations'\n"
                            "- 🎤 **Voice input**: Hold the microphone button to talk to me!"
            },
            "voice_reply": "I can help you monitor inventory, view orders, check revenue, and manage restock suggestions."
        }
    
    # 3. About
    if q in ["who are you", "what is stash", "about"]:
        return {
            "type": "text",
            "title": "About Stash AI",
            "content": {"markdown": "Stash AI is an intelligent godown assistant for Stash, India's voice-native supply chain platform. I help godown operators manage inventory, track logistics, automate billing, and predict demands using artificial intelligence."},
            "voice_reply": "I am Stash AI, your godown management assistant."
        }

    # 4. Low stock/inventory
    if any(k in q for k in ["low stock", "stock level", "inventory", "stock status", "current stock", "critical stock", "products"]):
        low_stock_items = context.get("low_stock_items", [])
        if not low_stock_items:
            return {
                "type": "text",
                "title": "Stock Status",
                "content": {"markdown": "🎉 **All items are well stocked!** There are currently no items below their threshold levels."},
                "voice_reply": "All items are well stocked. You have zero low stock items."
            }
        
        items = []
        for item in low_stock_items:
            curr = item.get("current_stock", 0)
            thresh = item.get("threshold", 0)
            unit = item.get("unit", "units")
            badge = "error" if float(curr) < float(thresh) * 0.5 else "warn"
            items.append({
                "label": item.get("name", "Unknown Item"),
                "value": f"{curr} / {thresh} {unit}",
                "badge": badge,
                "subtitle": f"Under threshold level of {thresh} {unit}"
            })
            
        return {
            "type": "list",
            "title": f"Low Stock Items ({len(items)})",
            "content": {"items": items},
            "voice_reply": f"You have {len(items)} items low on stock. I have shown them in a list."
        }

    # 5. Recent orders
    if any(k in q for k in ["recent orders", "orders list", "placed orders", "latest orders", "show orders"]):
        recent_orders = context.get("recent_orders", [])
        if not recent_orders:
            return {
                "type": "text",
                "title": "Order History",
                "content": {"markdown": "No recent orders found in the database."},
                "voice_reply": "No recent orders were found."
            }
        
        headers = ["Order Ref", "Status", "Amount", "Date"]
        rows = []
        for o in recent_orders:
            rows.append([
                o.get("ref", "N/A"),
                o.get("status", "unknown").capitalize(),
                f"₹{o.get('amount', 0):,.2f}",
                o.get("date", "N/A")
            ])
            
        return {
            "type": "table",
            "title": "Recent Orders",
            "content": {
                "headers": headers,
                "rows": rows
            },
            "voice_reply": f"Here are your {len(rows)} most recent orders."
        }

    # 6. Financials / billing / revenue
    if any(k in q for k in ["revenue", "bill", "billing", "payment", "pending payment", "collected payment", "earnings"]):
        stats = context.get("stats", {})
        pending = stats.get("pending_payments", 0.0)
        collected = stats.get("collected", 0.0)
        total_bills = stats.get("total_bills", 0)
        
        return {
            "type": "card",
            "title": "Financial Summary",
            "content": {
                "items": [
                    {"title": "Pending Payments", "value": f"₹{pending:,.2f}", "icon": "alert", "trend": "Action Required"},
                    {"title": "Collected Revenue", "value": f"₹{collected:,.2f}", "icon": "revenue", "trend": "This Month"},
                    {"title": "Total Bills", "value": str(total_bills), "icon": "orders", "trend": "Processed"}
                ]
            },
            "voice_reply": f"You have collected ₹{collected:,.2f} in revenue, with ₹{pending:,.2f} pending payment."
        }

    # 7. Restock suggestions
    if any(k in q for k in ["restock", "suggestion", "reorder", "eoq", "replenish"]):
        low_stock_items = context.get("low_stock_items", [])
        items = []
        for item in low_stock_items:
            curr = float(item.get("current_stock", 0))
            thresh = float(item.get("threshold", 0))
            diff = thresh - curr
            reorder_qty = max(50, int(diff * 1.5))
            items.append({
                "id": f"PO-{uuid.uuid4().hex[:4].upper()}",
                "name": item.get("name", "Item"),
                "qty": reorder_qty,
                "unit": item.get("unit", "units"),
                "cost": reorder_qty * 120,  # Simulated cost at ₹120 per unit
                "status": "pending"
            })
            
        # Fallback if no low stock items
        if not items:
            items = [
                {
                    "id": "PO-DFLT",
                    "name": "Basmati Rice (Premium)",
                    "qty": 100,
                    "unit": "kg",
                    "cost": 12000,
                    "status": "pending"
                }
            ]
            
        return {
            "type": "approval",
            "title": "Recommended Restock Orders (EOQ)",
            "content": {"items": items},
            "voice_reply": f"Based on stock levels, I have generated {len(items)} restock recommendation for your approval."
        }

    # 8. Deliveries
    if any(k in q for k in ["delivery", "transit", "deliveries", "shipment", "truck"]):
        deliveries = context.get("deliveries", [])
        if not deliveries:
            return {
                "type": "text",
                "title": "Deliveries Status",
                "content": {"markdown": "🚚 No active deliveries or updates found in the system at this time."},
                "voice_reply": "No delivery updates were found."
            }
        
        headers = ["Order Ref", "Status", "ETA", "Note"]
        rows = []
        for d in deliveries[:8]:
            rows.append([
                d.get("order_id") or d.get("id") or "N/A",
                (d.get("status") or "unknown").replace("_", " ").capitalize(),
                d.get("eta") or "N/A",
                d.get("note") or "—"
            ])
            
        return {
            "type": "table",
            "title": "Active Deliveries & Shipments",
            "content": {
                "headers": headers,
                "rows": rows
            },
            "voice_reply": f"I found {len(rows)} deliveries in the system."
        }

    # 9. Stockout / Disruption Alerts
    if any(k in q for k in ["alert", "disruption", "stockout", "risk", "critical"]):
        low_stock_items = context.get("low_stock_items", [])
        if not low_stock_items:
            return {
                "type": "text",
                "title": "Operations Alert",
                "content": {"markdown": "🎉 **All operations running smoothly.** No critical stockouts or supply chain disruptions predicted."},
                "voice_reply": "All operations running smoothly. Zero disruptions predicted."
            }
        
        items = []
        for item in low_stock_items:
            curr = float(item.get("current_stock", 0))
            thresh = float(item.get("threshold", 0))
            unit = item.get("unit", "units")
            badge = "error" if curr < thresh * 0.5 else "warn"
            
            # Predict days remaining
            days_left = max(1, int(curr / 5)) if curr > 0 else 0
            subtitle = f"Predicted stockout in {days_left} days! Reorder recommended." if days_left < 7 else f"Below threshold."
            
            items.append({
                "label": item.get("name", "Unknown Item"),
                "value": f"{curr} {unit} left",
                "badge": badge,
                "subtitle": subtitle
            })
            
        return {
            "type": "list",
            "title": "Critical Stockout Risks",
            "content": {"items": items},
            "voice_reply": f"Alert! You have {len(items)} items at risk of running out of stock."
        }

    # 10. Analytics / Business overview
    if any(k in q for k in ["analytics", "overview", "stats", "summary", "dashboard"]):
        stats = context.get("stats", {})
        pending = stats.get("pending_payments", 0.0)
        collected = stats.get("collected", 0.0)
        total_bills = stats.get("total_bills", 0)
        
        recent_orders = context.get("recent_orders", [])
        low_stock_items = context.get("low_stock_items", [])
        
        sections = [
            {
                "type": "card",
                "items": [
                    {"title": "Pending Payments", "value": f"₹{pending:,.2f}", "icon": "alert", "trend": "Action Required"},
                    {"title": "Collected Revenue", "value": f"₹{collected:,.2f}", "icon": "revenue", "trend": "This Month"},
                    {"title": "Total Bills", "value": str(total_bills), "icon": "orders", "trend": "Processed"}
                ]
            }
        ]
        
        if recent_orders:
            headers = ["Order Ref", "Status", "Amount", "Date"]
            rows = [[o.get("ref", "N/A"), o.get("status", "unknown").capitalize(), f"₹{o.get('amount', 0):,.2f}", o.get("date", "N/A")] for o in recent_orders[:3]]
            sections.append({
                "type": "table",
                "title": "Recent Orders Summary",
                "headers": headers,
                "rows": rows
            })
            
        return {
            "type": "mixed",
            "title": "Stash Business Overview",
            "content": {"sections": sections},
            "voice_reply": f"Here is your business overview. Revenue is ₹{collected:,.2f} and there are {len(recent_orders)} recent orders."
        }

    return None


# ─── Endpoints ──────────────────────────────────────────────────────────────

@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Main text chat endpoint — returns generative UI JSON."""
    context = await _fetch_context()
    
    result = await _call_gemini(
        query=request.query,
        history=request.history,
        context=context,
    )

    return ChatResponse(
        id=str(uuid.uuid4()),
        type=result.get("type", "text"),
        title=result.get("title"),
        content=result.get("content", {}),
        voice_reply=result.get("voice_reply", ""),
        created_at=datetime.utcnow().isoformat(),
    )


@router.post("/multimodal")
async def chat_multimodal(
    query: str = Form(...),
    history: str = Form(default="[]"),
    user_phone: Optional[str] = Form(default=None),
    file: Optional[UploadFile] = File(default=None),
):
    """Multimodal chat — accepts text + optional image/file."""
    import base64

    history_parsed: list[ChatMessage] = []
    try:
        raw = json.loads(history)
        history_parsed = [ChatMessage(**m) for m in raw]
    except Exception:
        pass

    image_base64: Optional[str] = None
    if file:
        file_bytes = await file.read()
        image_base64 = base64.b64encode(file_bytes).decode("utf-8")

    context = await _fetch_context()
    result = await _call_gemini(
        query=query,
        history=history_parsed,
        context=context,
        image_base64=image_base64,
    )

    return ChatResponse(
        id=str(uuid.uuid4()),
        type=result.get("type", "text"),
        title=result.get("title"),
        content=result.get("content", {}),
        voice_reply=result.get("voice_reply", ""),
        created_at=datetime.utcnow().isoformat(),
    )


@router.post("/voice")
async def chat_voice(
    audio: UploadFile = File(...),
    history: str = Form(default="[]"),
    user_phone: Optional[str] = Form(default=None),
    language_hint: Optional[str] = Form(default="hi-IN"),
):
    """
    Voice chat endpoint:
    1. STT: transcribe audio
    2. Chat: send transcript to Gemini
    3. Returns: text response + voice_reply for TTS
    """
    from app.services.speech import stt_process

    try:
        audio_bytes = await audio.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Empty audio")

        transcript = await stt_process(audio_bytes, language_hint or "hi-IN")
        if not transcript or transcript.startswith("Sorry") or transcript.startswith("I couldn't"):
            raise HTTPException(status_code=422, detail="Could not transcribe audio")

        history_parsed: list[ChatMessage] = []
        try:
            raw = json.loads(history)
            history_parsed = [ChatMessage(**m) for m in raw]
        except Exception:
            pass

        context = await _fetch_context()
        result = await _call_gemini(
            query=transcript,
            history=history_parsed,
            context=context,
        )

        return {
            "transcript": transcript,
            "response": ChatResponse(
                id=str(uuid.uuid4()),
                type=result.get("type", "text"),
                title=result.get("title"),
                content=result.get("content", {}),
                voice_reply=result.get("voice_reply", ""),
                created_at=datetime.utcnow().isoformat(),
            ),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Voice chat failed: %s", e)
        raise HTTPException(status_code=500, detail="Voice chat processing failed")


@router.get("/suggestions")
async def get_suggestions():
    """Return contextual query suggestions for the chat UI."""
    context = await _fetch_context()
    low_count = context.get("inventory_summary", {}).get("low_stock_count", 0)
    critical_count = context.get("inventory_summary", {}).get("critical_count", 0)

    suggestions = [
        "📦 Show me low stock items",
        "📊 Revenue summary this month",
        "🛒 Show recent orders",
        "🔄 Restock suggestions",
        "📈 Demand forecast for top products",
    ]

    if critical_count > 0:
        suggestions.insert(0, f"🚨 {critical_count} critical stock alerts — show me")
    elif low_count > 0:
        suggestions.insert(0, f"⚠️ {low_count} items are low on stock")

    return {"suggestions": suggestions[:5]}

class CommitRequest(BaseModel):
    action: str
    items: list[dict]

@router.post("/commit", response_model=ChatResponse)
async def chat_commit(request: CommitRequest):
    """Executes an approved mutation and returns a success card."""
    if not request.items:
        return ChatResponse(
            id=str(uuid.uuid4()),
            type="text",
            title="Error",
            content={"markdown": "No items provided."},
            voice_reply="No items provided for the action.",
            created_at=datetime.utcnow().isoformat()
        )

    try:
        item = request.items[0]
        if request.action in ["add_inventory", "restock"]:
            prod_name = item.get("name", "Unknown Item")
            stock = item.get("qty", 0)
            unit = item.get("unit", "units")
            threshold = item.get("threshold", 10)
            
            # Check if updating existing or adding new
            # To be safe, we add a new document or rely on inventory service.
            firestore_service.db.collection("inventory").add({
                "product_name": prod_name,
                "current_stock": stock,
                "threshold": threshold,
                "unit": unit,
                "updated_at": datetime.utcnow().isoformat()
            })
            
            return ChatResponse(
                id=str(uuid.uuid4()),
                type="card",
                title="Inventory Updated",
                content={
                    "items": [
                        {"title": "Item Added/Restocked", "value": prod_name, "icon": "inventory", "trend": "Success"},
                        {"title": "Current Stock", "value": f"{stock} {unit}", "icon": "inventory", "trend": "Updated"}
                    ]
                },
                voice_reply=f"Successfully added {stock} {unit} of {prod_name} to your inventory.",
                created_at=datetime.utcnow().isoformat()
            )
            
        elif request.action == "create_order":
            from app.api.orders import create_order
            order_data = {
                "buyer_name": item.get("name", "Guest Buyer"),
                "product_name": item.get("name", "Product"), # Fallback if buyer name not distinct
                "quantity": item.get("qty", 1),
                "unit": item.get("unit", "units"),
                "total_amount": float(item.get("cost", 0)),
            }
            res = await create_order(order_data)
            return ChatResponse(
                id=str(uuid.uuid4()),
                type="card",
                title="Order Created",
                content={
                    "items": [
                        {"title": "Order Ref", "value": res.get("order_ref", ""), "icon": "orders", "trend": "Created"},
                        {"title": "Bill Ref", "value": res.get("bill_ref", ""), "icon": "revenue", "trend": "Auto-Generated"}
                    ]
                },
                voice_reply=f"Order {res.get('order_ref', '')} has been successfully created.",
                created_at=datetime.utcnow().isoformat()
            )

        elif request.action == "share_bill_telegram":
            from app.api.billing import share_bill_telegram
            bill_ref = item.get("id")
            if not bill_ref:
                return ChatResponse(
                    id=str(uuid.uuid4()),
                    type="text",
                    title="Error",
                    content={"markdown": "Missing bill reference ID."},
                    voice_reply="I am missing the bill reference ID.",
                    created_at=datetime.utcnow().isoformat()
                )
            
            res = await share_bill_telegram(bill_ref, {})
            return ChatResponse(
                id=str(uuid.uuid4()),
                type="card",
                title="Bill Shared via Telegram",
                content={
                    "items": [
                        {"title": "Status", "value": "Sent", "icon": "revenue", "trend": "Success"},
                        {"title": "Bill Ref", "value": bill_ref, "icon": "orders", "trend": "Telegram"}
                    ]
                },
                voice_reply=f"Bill {bill_ref} has been shared via Telegram.",
                created_at=datetime.utcnow().isoformat()
            )
            
        elif request.action == "start_barter":
            product_name = item.get("name", "Product")
            qty = item.get("qty", 0)
            return ChatResponse(
                id=str(uuid.uuid4()),
                type="text",
                title="Barter Session Initiated",
                content={"markdown": f"A barter negotiation for **{qty} of {product_name}** has been initiated. Please navigate to the Barter tab to continue your negotiation with StashBot."},
                voice_reply=f"Barter session for {product_name} initiated. Please visit the Barter page.",
                created_at=datetime.utcnow().isoformat()
            )

    except Exception as e:
        logger.error("Commit failed: %s", e)
        return ChatResponse(
            id=str(uuid.uuid4()),
            type="text",
            title="Error",
            content={"markdown": f"Action failed: {str(e)}"},
            voice_reply="Sorry, the requested action failed.",
            created_at=datetime.utcnow().isoformat()
        )
            
    return ChatResponse(
        id=str(uuid.uuid4()),
        type="text",
        title="Unknown Action",
        content={"markdown": "Unknown action type."},
        voice_reply="I don't know how to perform that action.",
        created_at=datetime.utcnow().isoformat()
    )
