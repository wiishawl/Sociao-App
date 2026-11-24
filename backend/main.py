from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import models  # noqa: F401
from auth_routes import router as auth_router
from comments_routes import router as comments_router
from database import Base, engine
from messages_routes import router as messages_router
from posts_routes import router as posts_router
from upload_routes import UPLOAD_DIR, router as upload_router
from users_routes import router as users_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sociao API")

# Lets the React dev server (a different port) call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(users_router)
app.include_router(comments_router)
app.include_router(messages_router)
app.include_router(upload_router)

# Serves saved files at /uploads/<name>
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok"}