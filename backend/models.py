from datetime import datetime
from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(100))
    username: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))  # never the real password
    bio: Mapped[str] = mapped_column(Text, default="")
    avatar_url: Mapped[str] = mapped_column(String(500), default="")
    website: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    posts: Mapped[list["Post"]] = relationship(back_populates="author")


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    text: Mapped[str] = mapped_column(Text, default="")
    media_type: Mapped[str] = mapped_column(String(10), default="text")  # text | image | video
    media_url: Mapped[str | None] = mapped_column(String(500), default=None)
    music: Mapped[str | None] = mapped_column(String(200), default=None)
    view_count: Mapped[int] = mapped_column(default=0)
    share_count: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    author: Mapped["User"] = relationship(back_populates="posts")


class Like(Base):
    __tablename__ = "likes"
    __table_args__ = (UniqueConstraint("user_id", "post_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), index=True)


class Save(Base):
    __tablename__ = "saves"
    __table_args__ = (UniqueConstraint("user_id", "post_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"))


class Follow(Base):
    __tablename__ = "follows"
    __table_args__ = (UniqueConstraint("follower_id", "following_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    follower_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    following_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("comments.id"), default=None, index=True)
    text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    author: Mapped["User"] = relationship()

class CommentLike(Base):
    __tablename__ = "comment_likes"
    __table_args__ = (UniqueConstraint("user_id", "comment_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    comment_id: Mapped[int] = mapped_column(ForeignKey("comments.id"), index=True)

class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = (UniqueConstraint("user_a_id", "user_b_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_a_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)  # always the lower id
    user_b_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    conversation_id: Mapped[int] = mapped_column(ForeignKey("conversations.id"), index=True)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    text: Mapped[str] = mapped_column(Text)
    hearted: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    read_at: Mapped[datetime | None] = mapped_column(default=None)        