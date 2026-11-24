import re
from datetime import datetime
from typing import Annotated
from pydantic import StringConstraints
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Annotated, Literal
from pydantic import BaseModel, EmailStr, Field, StringConstraints, field_validator, model_validator


class SignupIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_rules(cls, v: str) -> str:
        if len(v) < 8 or not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must be 8+ characters with a letter and a number")
        return v


class LoginIn(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    username: str
    email: str
    bio: str
    avatar_url: str
    website: str

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class AuthorOut(BaseModel):
    id: int
    full_name: str
    username: str
    avatar_url: str

    model_config = {"from_attributes": True}


class PostOut(BaseModel):
    id: int
    text: str
    media_type: str
    media_url: str | None
    music: str | None
    view_count: int
    created_at: datetime
    author: AuthorOut
    like_count: int
    liked_by_me: bool
    saved_by_me: bool
    share_count: int
    comment_count: int

class ProfileOut(BaseModel):
    id: int
    full_name: str
    username: str
    bio: str
    avatar_url: str
    website: str
    posts_count: int
    followers_count: int
    following_count: int

class CommentIn(BaseModel):
    text: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)]
    parent_id: int | None = None


class CommentOut(BaseModel):
    id: int
    text: str
    created_at: datetime
    parent_id: int | None
    author: AuthorOut
    like_count: int
    liked_by_me: bool
    replies: list["CommentOut"] = []

class MessageOut(BaseModel):
    id: int
    sender_id: int
    text: str
    hearted: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationOut(BaseModel):
    id: int
    user: AuthorOut
    last_message: str | None
    last_message_at: datetime | None
    unread_count: int


class ThreadOut(BaseModel):
    user: AuthorOut
    messages: list[MessageOut]


class MessageIn(BaseModel):
    text: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=1000)]


class StartConversationIn(BaseModel):
    user_id: int

class PostIn(BaseModel):
    text: Annotated[str, StringConstraints(strip_whitespace=True, max_length=2000)] = ""
    media_type: Literal["text", "image", "video"] = "text"
    media_url: Annotated[str, StringConstraints(strip_whitespace=True, max_length=500)] | None = None
    music: Annotated[str, StringConstraints(strip_whitespace=True, max_length=200)] | None = None

    @model_validator(mode="after")
    def check_combination(self):
        if self.media_type == "text":
            if not self.text:
                raise ValueError("Write something to post")
            self.media_url = None
            self.music = None
        else:
            if not self.media_url or "/uploads/" not in self.media_url:
                raise ValueError("Upload a file from your device")
            if self.media_type == "image":
                self.music = None
        return self  

class ProfileUpdate(BaseModel):
    full_name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]
    username: Annotated[
        str,
        StringConstraints(
            strip_whitespace=True, to_lower=True, min_length=3, max_length=30, pattern=r"^[A-Za-z0-9_.]+$"
        ),
    ]
    bio: Annotated[str, StringConstraints(strip_whitespace=True, max_length=160)] = ""
    website: Annotated[str, StringConstraints(strip_whitespace=True, max_length=255)] = ""
    avatar_url: Annotated[str, StringConstraints(strip_whitespace=True, max_length=500)] | None = None

    @field_validator("website")
    @classmethod
    def website_ok(cls, v: str) -> str:
        if v and not v.lower().startswith(("http://", "https://")):
            raise ValueError("Website must start with http:// or https://")
        return v      