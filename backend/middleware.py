from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="NoteNest API")

def add_cors(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:8080",
            "http://127.0.0.1:8080",
            "https://notenest-b1zz.onrender.com",  # <-- No trailing slash!
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

add_cors(app)