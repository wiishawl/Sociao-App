from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import IntegrityError

from auth import get_current_user
from database import get_db
from models import Follow, Post, User
from posts_routes import build_post_outs
from schemas import AuthorOut, PostOut, ProfileOut, ProfileUpdate

router = APIRouter(prefix="/users", tags=["users"])


def count(db: Session, model, condition) -> int:
    return db.scalar(select(func.count()).select_from(model).where(condition)) or 0


@router.get("/me", response_model=ProfileOut)
def my_profile(db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    return ProfileOut(
        id=me.id,
        full_name=me.full_name,
        username=me.username,
        bio=me.bio,
        avatar_url=me.avatar_url,
        website=me.website,
        posts_count=count(db, Post, Post.author_id == me.id),
        followers_count=count(db, Follow, Follow.following_id == me.id),
        following_count=count(db, Follow, Follow.follower_id == me.id),
    )

@router.patch("/me", response_model=ProfileOut)
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    taken = db.scalar(select(User).where(User.username == data.username, User.id != me.id))
    if taken:
        raise HTTPException(status_code=409, detail="That username is already taken")

    # A new photo must come from our own upload endpoint, not an arbitrary link
    if data.avatar_url and data.avatar_url != me.avatar_url and "/uploads/" not in data.avatar_url:
        raise HTTPException(status_code=422, detail="Upload a photo from your device")

    me.full_name = data.full_name
    me.username = data.username
    me.bio = data.bio
    me.website = data.website
    if data.avatar_url:
        me.avatar_url = data.avatar_url

    try:
        db.commit()
    except IntegrityError:
        db.rollback()  # someone grabbed the username a moment ago
        raise HTTPException(status_code=409, detail="That username is already taken")

    return my_profile(db, me)


@router.get("/me/posts", response_model=list[PostOut])
def my_posts(db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    posts = db.scalars(
        select(Post)
        .options(selectinload(Post.author))
        .where(Post.author_id == me.id)
        .order_by(Post.created_at.desc(), Post.id.desc())
    ).all()
    return build_post_outs(db, list(posts), me.id)


def search_filter(query, q: str):
    term = q.strip()
    if term:
        query = query.where(
            or_(
                User.full_name.icontains(term, autoescape=True),
                User.username.icontains(term, autoescape=True),
            )
        )
    return query


@router.get("/me/followers", response_model=list[AuthorOut])
def my_followers(q: str = "", db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    """People who follow me."""
    query = select(User).join(Follow, Follow.follower_id == User.id).where(Follow.following_id == me.id)
    return db.scalars(search_filter(query, q).order_by(User.full_name)).all()


@router.get("/me/following", response_model=list[AuthorOut])
def my_following(q: str = "", db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    """People I follow."""
    query = select(User).join(Follow, Follow.following_id == User.id).where(Follow.follower_id == me.id)
    return db.scalars(search_filter(query, q).order_by(User.full_name)).all()


@router.delete("/me/followers/{user_id}")
def remove_follower(user_id: int, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    row = db.scalar(select(Follow).where(Follow.follower_id == user_id, Follow.following_id == me.id))
    if row is None:
        raise HTTPException(status_code=404, detail="That user isn't following you")
    db.delete(row)
    db.commit()
    return {"detail": "Follower removed"}