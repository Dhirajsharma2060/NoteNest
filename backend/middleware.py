from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import jwt
import os
from typing import List
from dotenv import load_dotenv

app = FastAPI(title="NoteNest API")
security = HTTPBearer()

load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

# Routes that don't require authentication
UNPROTECTED_ROUTES = [
    "/",
    "/signup",
    "/login", 
    "/refresh",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/child/by-family-code"
]

def add_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:8080",
            "http://127.0.0.1:8080",
            "https://notenest-b1zz.onrender.com",
            "https://notenest-backend-epgq.onrender.com",
            "https://notenest-frontend-v1.onrender.com",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# def add_jwt_middleware(app):
#     @app.middleware("http")
#     async def jwt_middleware(request: Request, call_next):
#         # Skip JWT validation for unprotected routes
#         if request.url.path in UNPROTECTED_ROUTES:
#             response = await call_next(request)
#             return response
        
#         # Check for Authorization header
#         authorization = request.headers.get("Authorization")
#         if not authorization or not authorization.startswith("Bearer "):
#             raise HTTPException(status_code=401, detail="Authorization header required")
        
#         try:
#             # Extract and verify token
#             token = authorization.split(" ")[1]
#             payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
#             # Add user info to request state for use in endpoints
#             request.state.user_id = payload.get("user_id")
#             request.state.user_role = payload.get("role")
            
#         except jwt.ExpiredSignatureError:
#             raise HTTPException(status_code=401, detail="Token expired")
#         except jwt.JWTError:
#             raise HTTPException(status_code=401, detail="Invalid token")
        
#         response = await call_next(request)
#         return response

