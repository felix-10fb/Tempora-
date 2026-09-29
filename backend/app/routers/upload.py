import os
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from app.core.storage import save_uploaded_file, save_base64_image, ALLOWED_EXTENSIONS
from app.routers.auth import get_current_user
from app.models.models import User

router = APIRouter(prefix="/upload", tags=["Uploads"])

class Base64UploadRequest(BaseModel):
    image: str

class UploadResponse(BaseModel):
    url: str
    filename: Optional[str] = None

class MultiUploadResponse(BaseModel):
    urls: List[str]

@router.post("", response_model=UploadResponse)
async def upload_single_file(file: UploadFile = File(...)):
    """Upload a single image file via multipart/form-data."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext and ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    url = await save_uploaded_file(file)
    filename = url.replace("/uploads/", "")
    return UploadResponse(url=url, filename=filename)

@router.post("/multiple", response_model=MultiUploadResponse)
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    """Upload multiple image files at once via multipart/form-data."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    urls = []
    for file in files:
        url = await save_uploaded_file(file)
        urls.append(url)

    return MultiUploadResponse(urls=urls)

@router.post("/base64", response_model=UploadResponse)
def upload_base64(req: Base64UploadRequest):
    """Save a base64 Data URL to a hosted static file."""
    if not req.image.startswith("data:image/"):
        raise HTTPException(status_code=400, detail="Invalid data URL format. Expected data:image/...")

    url = save_base64_image(req.image)
    filename = url.replace("/uploads/", "")
    return UploadResponse(url=url, filename=filename)
