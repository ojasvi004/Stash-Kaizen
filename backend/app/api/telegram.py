"""Telegram webhook endpoint"""
from fastapi import APIRouter, Header, HTTPException, Request, status
from app.core.config import settings
from app.services.telegram_svc import delete_telegram_webhook, handle_telegram_webhook, register_telegram_webhook

router = APIRouter(prefix="/api/webhook", tags=["telegram"])


@router.post("/telegram")
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: str | None = Header(default=None, alias="X-Telegram-Bot-Api-Secret-Token"),
):
    """Handle incoming Telegram webhook updates"""
    if settings.TELEGRAM_WEBHOOK_SECRET and x_telegram_bot_api_secret_token != settings.TELEGRAM_WEBHOOK_SECRET:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid webhook secret")

    update = await request.json()
    await handle_telegram_webhook(update)
    return {"ok": True}


@router.post("/telegram/register")
async def register_telegram_webhook_route():
    """Create or update the Telegram webhook using the configured public URL."""
    result = await register_telegram_webhook()
    if not result.get("ok"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result)
    return result


@router.delete("/telegram")
async def delete_telegram_webhook_route():
    """Remove the Telegram webhook so the bot stops receiving push updates."""
    result = await delete_telegram_webhook()
    if not result.get("ok"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result)
    return result


@router.get("/telegram")
async def telegram_webhook_status():
    """Return the current Telegram webhook configuration."""
    if not settings.TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing Telegram bot token")

    import httpx

    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/getWebhookInfo")
    return response.json()
