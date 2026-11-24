from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

engine = create_engine("sqlite:///./sociao.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)

class Base(DeclarativeBase):
    pass

# FastAPI will call this for every request to get a DB connection, then close it
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()