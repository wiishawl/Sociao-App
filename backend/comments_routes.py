from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from auth import get_current_user
from database import get_db
from models import Comment, CommentLike, User
from posts_routes import get_post_or_404
from schemas import CommentIn, CommentOut

router = APIRouter(tags=["comments"])


@router.get("/posts/{post_id}/comments", response_model=list[CommentOut])
def list_comments(post_id: int, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    get_post_or_404(db, post_id)
    rows = db.scalars(
        select(Comment)
        .options(selectinload(Comment.author))
        .where(Comment.post_id == post_id)
        .order_by(Comment.created_at, Comment.id)
    ).all()

    ids = [c.id for c in rows]
    like_counts = dict(
        db.execute(
            select(CommentLike.comment_id, func.count())
            .where(CommentLike.comment_id.in_(ids))
            .group_by(CommentLike.comment_id)
        ).all()
    )
    liked = set(
        db.scalars(
            select(CommentLike.comment_id).where(
                CommentLike.user_id == me.id, CommentLike.comment_id.in_(ids)
            )
        )
    )

    top_level: list[CommentOut] = []
    by_id: dict[int, CommentOut] = {}
    for c in rows:
        out = CommentOut(
            id=c.id,
            text=c.text,
            created_at=c.created_at,
            parent_id=c.parent_id,
            author=c.author,
            like_count=like_counts.get(c.id, 0),
            liked_by_me=c.id in liked,
            replies=[],
        )
        by_id[c.id] = out
        if c.parent_id is None:
            top_level.append(out)
        elif c.parent_id in by_id:
            by_id[c.parent_id].replies.append(out)

    top_level.reverse()  # newest top-level comments first; replies stay oldest first
    return top_level


@router.post("/posts/{post_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(
    post_id: int,
    data: CommentIn,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    get_post_or_404(db, post_id)

    parent_id = data.parent_id
    if parent_id is not None:
        parent = db.get(Comment, parent_id)
        if parent is None or parent.post_id != post_id:
            raise HTTPException(status_code=404, detail="Comment to reply to not found")
        if parent.parent_id is not None:
            parent_id = parent.parent_id  # one level only: a reply to a reply joins the same thread

    comment = Comment(post_id=post_id, user_id=me.id, parent_id=parent_id, text=data.text)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return CommentOut(
        id=comment.id,
        text=comment.text,
        created_at=comment.created_at,
        parent_id=comment.parent_id,
        author=me,
        like_count=0,
        liked_by_me=False,
        replies=[],
    )


@router.post("/comments/{comment_id}/like")
def like_comment(comment_id: int, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    if db.get(Comment, comment_id) is None:
        raise HTTPException(status_code=404, detail="Comment not found")

    existing = db.scalar(
        select(CommentLike).where(CommentLike.user_id == me.id, CommentLike.comment_id == comment_id)
    )
    if existing:
        db.delete(existing)
        db.commit()
        liked = False
    else:
        db.add(CommentLike(user_id=me.id, comment_id=comment_id))
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
        liked = True

    count = db.scalar(
        select(func.count()).select_from(CommentLike).where(CommentLike.comment_id == comment_id)
    )
    return {"liked": liked, "like_count": count}