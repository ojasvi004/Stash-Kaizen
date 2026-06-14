"""Stash Backend — FastAPI Application Entry Point"""
import asyncio
from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Import API routers
from app.api.voice import router as voice_router
from app.api.inventory import router as inventory_router
from app.api.orders import router as orders_router
from app.api.suppliers import router as suppliers_router
from app.api.billing import router as billing_router
from app.api.analytics import router as analytics_router
from app.api.analytics_export import router as analytics_export_router
from app.api.delivery import router as delivery_router
from app.api.telegram import router as telegram_router
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.barter import router as barter_router
from app.api.forecasting import router as forecasting_router
from app.api.chat import router as chat_router
from app.api.ws import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown events"""
    telegram_polling_stop = None
    telegram_polling_task = None

    # Startup
    runtime = "Cloud Run" if os.environ.get("K_SERVICE") else "container"
    print(f"Starting Stash Backend on {runtime}...")
    print("Database initialized")

    # Warm up ML models (optional in production to keep startup fast)
    if settings.ENABLE_ML_WARMUP:
        try:
            from app.services.ml_pipeline import get_model_status
            status = get_model_status()
            if status["models_loaded"]:
                print("ML models loaded and ready")
            else:
                print(f"ML models using heuristic fallback: {status['error']}")
        except Exception as e:
            print(f"ML model warm-up failed: {e}")
    else:
        print("ML warm-up skipped (ENABLE_ML_WARMUP=False)")

    # Register Telegram webhook (non-blocking)
    if settings.ENABLE_TELEGRAM_WEBHOOK and settings.TELEGRAM_BOT_TOKEN:
        try:
            is_render_runtime = os.environ.get("RENDER", "").lower() == "true"
            is_cloud_run_runtime = bool(os.environ.get("K_SERVICE"))
            use_ngrok = os.environ.get("USE_NGROK", "False").lower() == "true"
            if use_ngrok and not is_render_runtime and not is_cloud_run_runtime and not settings.effective_backend_url:
                try:
                    from pyngrok import ngrok

                    # Default backend port where uvicorn will run
                    ngrok_port = int(os.environ.get("PORT", 8000))
                    tunnel = ngrok.connect(ngrok_port)
                    public_url = tunnel.public_url
                    # Prefer explicit webhook path; register_telegram_webhook will append path if needed
                    settings.TELEGRAM_WEBHOOK_URL = public_url
                    print(f"Ngrok tunnel started at {public_url}; will register Telegram webhook against this URL")
                except Exception as _e:
                    print(f"Ngrok auto-start skipped: {_e}")

            from app.services.telegram_svc import register_telegram_webhook

            result = await register_telegram_webhook()
            if result.get("ok"):
                print(f"Telegram webhook registered: {result}")
            else:
                reason = result.get("description", "unknown reason")
                print(f"Telegram webhook skipped: {reason}")

                if "public https endpoint" in reason.lower() or "missing public webhook url" in reason.lower():
                    try:
                        from app.services.telegram_svc import delete_telegram_webhook, poll_telegram_updates

                        await delete_telegram_webhook()
                        telegram_polling_stop = asyncio.Event()
                        telegram_polling_task = asyncio.create_task(poll_telegram_updates(telegram_polling_stop))
                        app.state.telegram_polling_stop = telegram_polling_stop
                        app.state.telegram_polling_task = telegram_polling_task
                        print("Telegram long polling started as local fallback")
                    except Exception as e:
                        print(f"Telegram polling fallback failed: {e}")
        except Exception as e:
            print(f" Telegram webhook registration failed: {e}")

    # Start background scheduler (optional; keep disabled for backend-only API deploy)
    if settings.ENABLE_SCHEDULER:
        try:
            from app.workers.scheduler import setup_scheduler

            setup_scheduler()
        except Exception as e:
            print(f"Scheduler startup failed: {e}")
    else:
        print("Scheduler skipped (ENABLE_SCHEDULER=False)")

    yield

    # Shutdown
    try:
        if telegram_polling_stop:
            telegram_polling_stop.set()
        if telegram_polling_task:
            telegram_polling_task.cancel()
            await asyncio.gather(telegram_polling_task, return_exceptions=True)

        from app.workers.scheduler import scheduler

        if scheduler.running:
            scheduler.shutdown(wait=False)
    except Exception as e:
        print(f"Scheduler shutdown failed: {e}")

    print("Shutting down Stash Backend...")


app = FastAPI(
    title="Stash: Voice-Native AI Supply Chain Platform",
    description="Backend API for India's godown management platform. "
    "Manages inventory, orders, suppliers, billing, and voice interactions.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.effective_cors_origins,
    allow_origin_regex=r"https://.*\.(?:vercel\.app|hosted\.app|run\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(voice_router)
app.include_router(inventory_router)
app.include_router(orders_router)
app.include_router(suppliers_router)
app.include_router(billing_router)
app.include_router(analytics_router)
app.include_router(analytics_export_router)
app.include_router(delivery_router)
app.include_router(telegram_router)
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(barter_router)
app.include_router(forecasting_router)
app.include_router(chat_router)
app.include_router(ws_router)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "app": "Stash",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """Health check for load balancers"""
    return {
        "status": "healthy",
        "runtime": "cloud_run" if os.environ.get("K_SERVICE") else "container",
    }
