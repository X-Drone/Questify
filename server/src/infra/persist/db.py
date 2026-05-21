# app/db.py
import logging
import time
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, exc, text
from sqlalchemy.orm import sessionmaker

from core import settings

class DB:
    def __init__(self):
        if settings.debug:
            self.engine = create_engine(
                settings.database_url,
                connect_args={"check_same_thread": False}
            )
            print("Using SQLite for development")
        else:
            self.engine = create_engine(
                settings.database_url,
                pool_size=settings.database_pool_size,
                pool_timeout=settings.database_pool_timeout,
                pool_recycle=300
            )
            print("Using PostgreSQL for production")

        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        # IMPORTANT: tokenUrl — абсолютный путь который вы используете в роутере
        # добавляем ведущий слеш, чтобы OAuth2PasswordBearer строил правильный URL
        # self.oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

    def wait_for_db(self, max_retries=5, retry_interval=5):
        if settings.debug:
            try:
                db = self.SessionLocal()
                db.execute(text("SELECT 1"))
                db.close()
                logging.info("Successfully connected to SQLite")
                return
            except Exception as e:
                logging.error(f"SQLite connection failed: {e}")
                raise

        retries = 0
        while retries < max_retries:
            try:
                db = self.SessionLocal()
                db.execute(text("SELECT 1"))
                db.close()
                logging.info("Successfully connected to the database")
                return
            except exc.OperationalError as e:
                retries += 1
                logging.warning(f"Database connection attempt {retries} failed: {e}. Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)

        raise Exception("Could not connect to the database")
    
    def close(self):
        self.SessionLocal().close()

    # dependency для FastAPI
    def getSession(self):
        return self.SessionLocal()

# глобальный инстанс
db = DB()
