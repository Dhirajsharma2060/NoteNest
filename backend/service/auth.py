from typing import Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime
import secrets
import string
import warnings
from passlib.exc import PasslibHashWarning
from backend.model import Child, Parent

# Suppress bcrypt password length warnings
warnings.filterwarnings("ignore", category=PasslibHashWarning)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password[:72])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)



def authenticate_user(db: Session, email: str, password: str):
    child = get_child_by_email(db, email)
    if child and verify_password(password, child.hashed_password):
        return child
    parent = get_parent_by_email(db, email)
    if parent and verify_password(password, parent.hashed_password):
        return parent
    return None

def generate_family_code() -> str:
    """Generate a random 6-character family code (letters + numbers)"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))

def get_child_by_family_code(db: Session, family_code: str) -> Optional[Child]:
    return db.query(Child).filter(Child.family_code == family_code).first()

def get_child_by_email(db: Session, email: str) -> Optional[Child]:
    return db.query(Child).filter(Child.email == email).first()

def get_parent_by_email(db: Session, email: str) -> Optional[Parent]:
    return db.query(Parent).filter(Parent.email == email).first()

def signup_child(db: Session, name: str, email: str, password: str) -> Child:
    if db.query(Child).filter(Child.email == email).first():
        raise ValueError("Email already registered")
    hashed = get_password_hash(password)
    family_code = generate_family_code()
    # Ensure family code is unique
    while db.query(Child).filter(Child.family_code == family_code).first():
        family_code = generate_family_code()
    child = Child(
        name=name,
        email=email,
        hashed_password=hashed,
        family_code=family_code
    )
    db.add(child)
    db.commit()
    db.refresh(child)
    return child

def signup_parent(db: Session, name: str, email: str, password: str, family_code: str) -> Parent:
    if db.query(Parent).filter(Parent.email == email).first():
        raise ValueError("Email already registered")
    child = get_child_by_family_code(db, family_code)
    if not child:
        raise ValueError("Invalid family code")
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
    return parent