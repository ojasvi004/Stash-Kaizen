FROM python:3.12-bookworm

WORKDIR /app

# Install system dependencies for WeasyPrint
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libharfbuzz0b \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency metadata first to maximize Docker cache reuse
COPY pyproject.toml uv.lock* ./

# Install dependencies
RUN uv sync --no-dev

# Copy application code
COPY app/ app/
COPY models/ models/

# Firestore credentials should be provided at runtime via GOOGLE_APPLICATION_CREDENTIALS_JSON
# or a mounted service-account file. Do not bake secrets into the image.

# Cloud Run injects PORT at runtime; default to 8080 for local container runs.
ENV PORT=8080
EXPOSE 8080

# Run the application
ENTRYPOINT ["sh", "-c", "uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
