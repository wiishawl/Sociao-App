import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile

from auth import get_current_user
from models import User

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# content type -> (post media type, file extension, max size in MB)
ALLOWED = {
    "image/jpeg": ("image", ".jpg", 5),
    "image/png": ("image", ".png", 5),
    "image/webp": ("image", ".webp", 5),
    "image/gif": ("image", ".gif", 5),
    "video/mp4": ("video", ".mp4", 50),
    "video/webm": ("video", ".webm", 50),
    "video/quicktime": ("video", ".mov", 50),
}

router = APIRouter(prefix="/media", tags=["uploads"])


@router.post("")
async def upload(
    request: Request,
    file: UploadFile = File(...),
    me: User = Depends(get_current_user),
):
    rule = ALLOWED.get(file.content_type)
    if rule is None:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Use JPG, PNG, WEBP, GIF, MP4, WEBM or MOV.",
        )
    media_type, extension, max_mb = rule

    # Random name: never trust the uploaded filename (collisions, path tricks)
    name = f"{uuid.uuid4().hex}{extension}"
    path = UPLOAD_DIR / name

    size = 0
    too_big = False
    with path.open("wb") as out:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > max_mb * 1024 * 1024:
                too_big = True
                break
            out.write(chunk)

    if too_big:
        path.unlink(missing_ok=True)
        raise HTTPException(status_code=413, detail=f"File too large. Max {max_mb} MB for {media_type}s.")

    url = str(request.base_url).rstrip("/") + f"/uploads/{name}"
    return {"url": url, "media_type": media_type}