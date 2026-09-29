import os
import uuid
import base64
import re
from fastapi import UploadFile

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB hard limit
MIME_TO_EXT = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg"
}

def save_base64_image(data_url: str) -> str:
    """
    If data_url is a base64 Data URL, decode it, save to disk, and return '/uploads/<filename>'.
    Otherwise return data_url untouched.
    """
    if not isinstance(data_url, str) or not data_url.startswith("data:image/"):
        return data_url

    try:
        # Match pattern: data:image/png;base64,iVBORw0KGgo...
        match = re.match(r"^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,(.*)$", data_url, re.DOTALL)
        if not match:
            return data_url

        mime_type = match.group(1).lower()
        base64_data = match.group(2)

        # Guard: base64 string length ~ 4/3 * raw bytes
        if len(base64_data) > MAX_UPLOAD_BYTES * 4 // 3:
            print(f"[!] Rejected oversized base64 image ({len(base64_data)} chars)")
            return data_url

        ext = MIME_TO_EXT.get(mime_type, ".jpg")
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        file_bytes = base64.b64decode(base64_data)
        with open(filepath, "wb") as f:
            f.write(file_bytes)

        return f"/uploads/{filename}"
    except Exception as e:
        print(f"[!] Error saving base64 image: {e}")
        return data_url

async def save_uploaded_file(file: UploadFile) -> str:
    """
    Save an UploadFile to the uploads directory and return '/uploads/<filename>'.
    Rejects files exceeding MAX_UPLOAD_BYTES.
    """
    original_ext = os.path.splitext(file.filename or "")[1].lower()
    ext = original_ext if original_ext in ALLOWED_EXTENSIONS else MIME_TO_EXT.get(file.content_type or "", ".jpg")
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise ValueError(f"File too large: {len(content)} bytes (max {MAX_UPLOAD_BYTES})")

    with open(filepath, "wb") as f:
        f.write(content)

    return f"/uploads/{filename}"
