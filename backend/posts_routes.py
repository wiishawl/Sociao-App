from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from auth import get_current_user
from database import get_db
from models import Comment, Like, Post, Save, User
from schemas import PostIn, PostOut

router = APIRouter(prefix="/posts", tags=["posts"])


def build_post_outs(db: Session, posts: list[Post], me_id: int) -> list[PostOut]:
    """Attach counts and my like/save state using a handful of queries, not several per post."""
    ids = [p.id for p in posts]

    like_counts = dict(
        db.execute(
            select(Like.post_id, func.count()).where(Like.post_id.in_(ids)).group_by(Like.post_id)
        ).all()
    )
    comment_counts = dict(
        db.execute(
            select(Comment.post_id, func.count()).where(Comment.post_id.in_(ids)).group_by(Comment.post_id)
        ).all()
    )
    liked = set(db.scalars(select(Like.post_id).where(Like.user_id == me_id, Like.post_id.in_(ids))))
    saved = set(db.scalars(select(Save.post_id).where(Save.user_id == me_id, Save.post_id.in_(ids))))

    return [
        PostOut(
            id=p.id,
            text=p.text,
            media_type=p.media_type,
            media_url=p.media_url,
            music=p.music,
            view_count=p.view_count,
            share_count=p.share_count,
            comment_count=comment_counts.get(p.id, 0),
            created_at=p.created_at,
            author=p.author,
            like_count=like_counts.get(p.id, 0),
            liked_by_me=p.id in liked,
            saved_by_me=p.id in saved,
        )
        for p in posts
    ]


@router.get("", response_model=list[PostOut])
def feed(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    posts = db.scalars(
        select(Post)
        .options(selectinload(Post.author))
        .order_by(Post.created_at.desc(), Post.id.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return build_post_outs(db, list(posts), me.id)

@router.post("", response_model=PostOut, status_code=201)
def create_post(data: PostIn, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    post = Post(
        author_id=me.id,
        text=data.text,
        media_type=data.media_type,
        media_url=data.media_url,
        music=data.music,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return build_post_outs(db, [post], me.id)[0]


def toggle(db: Session, model, user_id: int, post_id: int) -> bool:
    """Add the row if it's missing, remove it if present. Returns True if it's now on."""
    existing = db.scalar(select(model).where(model.user_id == user_id, model.post_id == post_id))
    if existing:
        db.delete(existing)
        db.commit()
        return False
    db.add(model(user_id=user_id, post_id=post_id))
    try:
        db.commit()
    except IntegrityError:
        # Two fast clicks raced: the unique constraint stopped the duplicate
        db.rollback()
    return True


def get_post_or_404(db: Session, post_id: int) -> Post:
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: int, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    post = get_post_or_404(db, post_id)
    return build_post_outs(db, [post], me.id)[0]


@router.post("/{post_id}/like")
def like_post(post_id: int, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    get_post_or_404(db, post_id)
    liked = toggle(db, Like, me.id, post_id)
    count = db.scalar(select(func.count()).select_from(Like).where(Like.post_id == post_id))
    return {"liked": liked, "like_count": count}


@router.post("/{post_id}/save")
def save_post(post_id: int, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    get_post_or_404(db, post_id)
    saved = toggle(db, Save, me.id, post_id)
    return {"saved": saved}


@router.post("/{post_id}/share")
def share_post(post_id: int, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    post = get_post_or_404(db, post_id)
    post.share_count += 1
    db.commit()
    return {"share_count": post.share_count}