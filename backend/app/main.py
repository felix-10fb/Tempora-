from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.core.database import engine, Base
from backend.app.core.storage import UPLOAD_DIR
from backend.app.routers import (
    auth, users, listings, search, bookings, payments,
    reviews, ai, wishlists, chat, notifications, owner, admin, maps, upload
)

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Hyperlocal temporary-ownership marketplace backend. 'Own Less. Live More.'",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Structured Error Handlers (Rule 35)
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "code": f"HTTP_{exc.status_code}"
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_messages = []
    for err in exc.errors():
        loc = [str(l) for l in err.get("loc", []) if str(l) != "body"]
        field_name = ".".join(loc) if loc else "field"
        msg = err.get("msg", "Invalid value")
        error_messages.append(f"{field_name}: {msg}")
    
    summary = "; ".join(error_messages) if error_messages else "Validation error in request payload"
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": summary,
            "errors": exc.errors(),
            "code": "VALIDATION_ERROR"
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected server error occurred.",
            "detail": str(exc) if settings.ENVIRONMENT == "development" else None,
            "code": "INTERNAL_SERVER_ERROR"
        }
    )

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(listings.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(wishlists.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(owner.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(maps.router, prefix="/api")
app.include_router(upload.router, prefix="/api")

# Static files for uploaded images
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/api/health")
def health_check():
    from backend.app.core.database import check_db_health
    db_ok, db_status, db_type = check_db_health()
    return {
        "status": "healthy" if db_ok else "degraded",
        "database": {
            "status": db_status,
            "type": db_type,
            "healthy": db_ok
        },
        "service": "TEMPORA API",
        "version": "1.0.0",
        "philosophy": "Why buy something you only need temporarily? Own Less. Live More."
    }

