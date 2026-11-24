from datetime import datetime, timedelta

from database import Base, engine, SessionLocal
from models import Comment, CommentLike, Conversation, Follow, Like, Message, Post, Save, User
from security import hash_password

VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/"


def run():
    # Dev only: wipe everything so the script can be re-run safely
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # ---- Users (all share the demo password "Password123") ----
    people = [
        ("Aarav Sharma", "aarav", "aarav@example.com", "Building things. Coffee first."),
        ("Meera Iyer", "meera", "meera@example.com", "Designer. Dog person. Night owl."),
        ("Rohan Gupta", "rohan", "rohan@example.com", "Cricket, code and chai."),
        ("Sara Khan", "sara", "sara@example.com", "Photographer chasing golden hour."),
        ("Dev Patel", "dev", "dev@example.com", "AI tinkerer. Learning in public."),
    ]
    users = []
    for i, (name, username, email, bio) in enumerate(people, start=1):
        users.append(
            User(
                full_name=name,
                username=username,
                email=email,
                password_hash=hash_password("Password123"),
                bio=bio,
                avatar_url=f"https://i.pravatar.cc/150?img={i}",
            )
        )
    db.add_all(users)
    db.commit()

    # ---- Posts: (author index, text, media_type, media_url, music) ----
    posts_data = [
        (0, "Just shipped my first API. It only took 12 coffees.", "text", None, None),
        (1, "New logo concepts for a local bakery. Thoughts?", "image", "https://picsum.photos/seed/logo/600/400", None),
        (2, "Match day vibes. Nothing beats a Sunday game.", "image", "https://picsum.photos/seed/cricket/600/400", None),
        (3, "Golden hour never gets old.", "image", "https://picsum.photos/seed/sunset/600/400", None),
        (4, "Day 14 of learning FastAPI. Foreign keys finally make sense.", "text", None, None),
        (0, "Big Buck Bunny, but make it a weekend project.", "video", VIDEO + "BigBuckBunny.mp4", "Original sound - aarav"),
        (1, "Quick design timelapse. Sound on!", "video", VIDEO + "ElephantsDream.mp4", "Lo-fi beats - Chillhop"),
        (3, "Behind the scenes from today's shoot.", "video", VIDEO + "ForBiggerBlazes.mp4", "Sunrise - Sara K."),
        (2, "Hot take: tabs are better than spaces.", "text", None, None),
        (4, "Small wins add up. Keep shipping.", "text", None, None),
    ]
    posts = [
        Post(
            author_id=users[a].id,
            text=t,
            media_type=m,
            media_url=u,
            music=mu,
            view_count=(i + 1) * 137 if m == "video" else 0,
            share_count=(i * 7) % 23,
        )
        for i, (a, t, m, u, mu) in enumerate(posts_data)
    ]
    db.add_all(posts)
    db.commit()

    # ---- Likes, saves, follows ----
    for pi, post in enumerate(posts):
        for ui, user in enumerate(users):
            if (pi + ui) % 3 == 0:
                db.add(Like(user_id=user.id, post_id=post.id))
            if (pi + ui) % 5 == 0:
                db.add(Save(user_id=user.id, post_id=post.id))

    for i, user in enumerate(users):
        for step in (1, 2):
            other = users[(i + step) % len(users)]
            db.add(Follow(follower_id=user.id, following_id=other.id))

    db.commit()

    # ---- Comments on the video posts, with one level of replies ----
    video_posts = [p for p in posts if p.media_type == "video"]
    texts = ["Love this!", "Great work", "Where was this shot?", "Needs more cowbell", "Saving this one"]
    top_level = []
    for p in video_posts:
        for k in range(3):
            c = Comment(post_id=p.id, user_id=users[(p.id + k) % 5].id, text=texts[(p.id + k) % 5])
            db.add(c)
            top_level.append(c)
    db.commit()

    for c in top_level[::2]:  # every other comment gets a reply and a like
        replier = users[c.user_id % 5]  # a different user than the commenter
        db.add(Comment(post_id=c.post_id, user_id=replier.id, parent_id=c.id, text="Thanks, glad you liked it!"))
        db.add(CommentLike(user_id=replier.id, comment_id=c.id))
    db.commit()

        # ---- Conversations and messages ----
    def conversation(u1, u2, lines):
        a, b = sorted([u1.id, u2.id])
        conv = Conversation(user_a_id=a, user_b_id=b)
        db.add(conv)
        db.commit()
        start = datetime.utcnow() - timedelta(minutes=len(lines) * 7)
        for i, (sender, body, read) in enumerate(lines):
            sent = start + timedelta(minutes=i * 7)
            db.add(
                Message(
                    conversation_id=conv.id,
                    sender_id=sender.id,
                    text=body,
                    created_at=sent,
                    read_at=sent + timedelta(minutes=1) if read else None,
                )
            )
        db.commit()

    conversation(users[0], users[1], [
        (users[1], "Hey! Loved your API post.", True),
        (users[0], "Thanks! Took 12 coffees.", True),
        (users[1], "Want to pair on the design this weekend?", False),
    ])
    conversation(users[0], users[2], [
        (users[0], "Match tonight?", True),
        (users[2], "Always. Bringing the snacks.", True),
    ])
    conversation(users[0], users[3], [
        (users[3], "Check out my new sunset series", False),
    ])
    conversation(users[1], users[4], [
        (users[4], "Your timelapse is great", True),
    ])

    print(f"Seeded {len(users)} users and {len(posts)} posts.")
    db.close()


if __name__ == "__main__":
    run()