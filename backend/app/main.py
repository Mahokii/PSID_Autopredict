from fastapi import FastAPI
import asyncpg
import os

app = FastAPI()

DATABASE_URL = os.getenv("DATABASE_URL")

@app.get("/")
async def root():
    return {"message": "Hello, World!"}

@app.get("/health")
async def health():
    return {"status": "ok"}
