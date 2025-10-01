from typing import Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
import secrets
import string
import warnings
from passlib.exc import PasslibHashWarning
from backend.model import Child, Parent
import jwt
import os
from fastapi import HTTPException, status

# Suppress bcrypt password length warnings
warnings.filterwarnings("ignore", category=PasslibHashWarning)

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password[:72])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password[:72], hashed_password)

def create_access_token(data: dict) -> str:
    """Create JWT access token (15 minutes)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token (7 days)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str, token_type: str = "access") -> dict:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != token_type:
            raise HTTPException(status_code=401, detail="Invalid token type")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:  # <-- Fix here
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_family_code() -> str:
    """Generate a random 6-character family code (letters + numbers)"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))

def get_child_by_family_code(db: Session, family_code: str) -> Optional[Child]:
    return db.query(Child).filter(Child.family_code == family_code).first()

def get_child_by_email(db: Session, email: str) -> Optional[Child]:
    return db.query(Child).filter(Child.email == email).first()

def get_parent_by_email(db: Session, email: str) -> Optional[Parent]:
    return db.query(Parent).filter(Parent.email == email).first()

def signup_child(db: Session, name: str, email: str, password: str) -> dict:
    """Atomic child signup with JWT tokens"""
    try:
        # Check if email exists
        if db.query(Child).filter(Child.email == email).first():
            raise ValueError("Email already registered")
        
        # Generate unique family code
        family_code = generate_family_code()
        while db.query(Child).filter(Child.family_code == family_code).first():
            family_code = generate_family_code()
        
        # Create child
        hashed = get_password_hash(password)
        child = Child(
            name=name,
            email=email,
            hashed_password=hashed,
            family_code=family_code
        )
        
        db.add(child)
        db.commit()
        db.refresh(child)
        
        # Generate JWT tokens
        token_data = {
            "user_id": child.id,
            "email": child.email,
            "role": "child"
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # Update child with refresh token
        child.refresh_token = refresh_token
        db.commit()
        
        return {
            "user": {
                "id": child.id,
                "name": child.name,
                "email": child.email,
                "role": "child",
                "family_code": child.family_code
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        db.rollback()
        raise e

def signup_parent(db: Session, name: str, email: str, password: str, family_code: str) -> dict:
    """Atomic parent signup with JWT tokens"""
    try:
        # Check if email exists
        if db.query(Parent).filter(Parent.email == email).first():
            raise ValueError("Email already registered")
        
        # Verify family code
        child = get_child_by_family_code(db, family_code)
        if not child:
            raise ValueError("Invalid family code")
        
        # Create parent
        hashed = get_password_hash(password)
        parent = Parent(
            name=name,
            email=email,
            hashed_password=hashed,
            child_id=child.id
        )
        
        db.add(parent)
        db.commit()
        db.refresh(parent)
        
        # Generate JWT tokens
        token_data = {
            "user_id": parent.id,
            "email": parent.email,
            "role": "parent"
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # Update parent with refresh token
        parent.refresh_token = refresh_token
        db.commit()
        
        return {
            "user": {
                "id": parent.id,
                "name": parent.name,
                "email": parent.email,
                "role": "parent",
                "child_id": child.id,
                "child_name": child.name,
                "child_email": child.email
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        db.rollback()
        raise e

def authenticate_user(db: Session, email: str, password: str) -> dict:
    """Authenticate user and return JWT tokens"""
    # Try child login first
    child = db.query(Child).filter(Child.email == email).first()
    if child and verify_password(password, child.hashed_password):
        token_data = {
            "user_id": child.id,
            "email": child.email,
            "role": "child"
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # Update refresh token in database
        child.refresh_token = refresh_token
        db.commit()
        
        return {
            "user": {
                "id": child.id,
                "name": child.name,
                "email": child.email,
                "role": "child",
                "family_code": child.family_code
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    
    # Try parent login
    parent = db.query(Parent).filter(Parent.email == email).first()
    if parent and verify_password(password, parent.hashed_password):
        child = db.query(Child).filter(Child.id == parent.child_id).first()
        
        token_data = {
            "user_id": parent.id,
            "email": parent.email,
            "role": "parent"
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # Update refresh token in database
        parent.refresh_token = refresh_token
        db.commit()
        
        return {
            "user": {
                "id": parent.id,
                "name": parent.name,
                "email": parent.email,
                "role": "parent",
                "child_id": child.id if child else None,
                "child_name": child.name if child else None,
                "child_email": child.email if child else None
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    
    return None

def refresh_access_token(db: Session, refresh_token: str) -> dict:
    """Generate new access token using refresh token"""
    # Verify refresh token
    payload = verify_token(refresh_token, "refresh")
    user_id = payload.get("user_id")
    role = payload.get("role")
    
    if not user_id or not role:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    # Get user from database and verify refresh token
    if role == "child":
        user = db.query(Child).filter(Child.id == user_id).first()
    elif role == "parent":
        user = db.query(Parent).filter(Parent.id == user_id).first()
    else:
        raise HTTPException(status_code=401, detail="Invalid role")
    
    if not user or user.refresh_token != refresh_token:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    # Generate new access token
    token_data = {
        "user_id": user.id,
        "email": user.email,
        "role": role
    }
    
    new_access_token = create_access_token(token_data)
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }

def logout_user(db: Session, user_id: int, role: str):
    """Logout user by clearing refresh token"""
    if role == "child":
        user = db.query(Child).filter(Child.id == user_id).first()
    elif role == "parent":
        user = db.query(Parent).filter(Parent.id == user_id).first()
    else:
        return False
    
    if user:
        user.refresh_token = None
        db.commit()
        return True
    
    return False