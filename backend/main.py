from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional

from .db import SessionLocal, engine
from .model import Base, Note
from .service.notes import (
    create_note, get_note, list_notes_by_owner, update_note, delete_note,
    add_checklist_item, list_checklist_items, update_checklist_item, delete_checklist_item,
)
from .sceheme import NoteSchema, ChecklistItemSchema, UserSignupSchema, UserLoginSchema, RefreshTokenSchema
from .service.auth import (
    signup_child, signup_parent, authenticate_user, verify_token,
    refresh_access_token, logout_user , get_child_by_family_code
)
from .middleware import add_cors  # Remove add_jwt_middleware import

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NoteNest API")
add_cors(app)  # Only add CORS middleware
# Remove this line: add_jwt_middleware(app)  # Remove global JWT middleware

security = HTTPBearer()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current user from JWT token"""
    token = credentials.credentials
    payload = verify_token(token, "access")
    
    user_id = payload.get("user_id")
    role = payload.get("role")
    
    if not user_id or not role:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    # Get user from database
    from .model import Child, Parent
    if role == "child":
        user = db.query(Child).filter(Child.id == user_id).first()
    elif role == "parent":
        user = db.query(Parent).filter(Parent.id == user_id).first()
    else:
        raise HTTPException(status_code=401, detail="Invalid role")
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {"user": user, "role": role}

def require_child(current_user = Depends(get_current_user)):
    """Require child role"""
    if current_user["role"] != "child":
        raise HTTPException(status_code=403, detail="Child access required")
    return current_user

def require_parent(current_user = Depends(get_current_user)):
    """Require parent role"""
    if current_user["role"] != "parent":
        raise HTTPException(status_code=403, detail="Parent access required")
    return current_user

def require_child_or_parent(current_user = Depends(get_current_user)):
    """Allow both child and parent roles"""
    if current_user["role"] not in ["child", "parent"]:
        raise HTTPException(status_code=403, detail="Child or parent access required")
    return current_user

@app.get("/")
def read_root():
    return {"message": "Welcome to NoteNest"}

# Authentication endpoints (these remain unprotected)
@app.post("/signup")
def api_signup(payload: UserSignupSchema, db: Session = Depends(get_db)):
    try:
        if payload.role == "child":
            return signup_child(db=db, name=payload.name, email=payload.email, password=payload.password)
        else:  # parent
            if not payload.family_code:
                raise ValueError("Family code required for parent signup")
            return signup_parent(
                db=db, name=payload.name, email=payload.email, 
                password=payload.password, family_code=payload.family_code
            )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/login")
def api_login(payload: UserLoginSchema, db: Session = Depends(get_db)):
    result = authenticate_user(db, payload.email, payload.password)
    if not result:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return result

@app.post("/refresh")
def api_refresh_token(payload: RefreshTokenSchema, db: Session = Depends(get_db)):
    return refresh_access_token(db, payload.refresh_token)

@app.post("/logout")
def api_logout(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    success = logout_user(db, current_user["user"].id, current_user["role"])
    if success:
        return {"message": "Logged out successfully"}
    else:
        raise HTTPException(status_code=400, detail="Logout failed")

# Protected Note endpoints (JWT protection via dependencies)
@app.post("/notes/", response_model=NoteSchema)
def api_create_note(note: NoteSchema, db: Session = Depends(get_db), current_user = Depends(require_child)):
    if note.owner_id != current_user["user"].id:
        raise HTTPException(status_code=403, detail="Can only create notes for yourself")
    
    db_note = create_note(
        db=db, title=note.title, content=note.content, owner_id=current_user["user"].id,
        folder=note.folder, tags=note.tags, is_checklist=note.is_checklist,
    )
    return NoteSchema(
        id=db_note.id, title=db_note.title, content=db_note.content, owner_id=db_note.owner_id,
        folder=db_note.folder, tags=db_note.tags.split(",") if db_note.tags else [],
        is_checklist=db_note.is_checklist,
        checklist_items=[ChecklistItemSchema.model_validate(item) for item in db_note.checklist_items],
    )

@app.get("/notes/", response_model=List[NoteSchema])
def api_list_notes(owner_id: int, db: Session = Depends(get_db), current_user = Depends(require_child_or_parent)):
    if current_user["role"] == "child":
        if owner_id != current_user["user"].id:
            raise HTTPException(status_code=403, detail="Can only view your own notes")
    elif current_user["role"] == "parent":
        if owner_id != current_user["user"].child_id:
            raise HTTPException(status_code=403, detail="Can only view your child's notes")
    
    notes = list_notes_by_owner(db, owner_id)
    return [
        NoteSchema(
            id=n.id, title=n.title, content=n.content, owner_id=n.owner_id,
            folder=n.folder, tags=n.tags.split(",") if n.tags else [],
            is_checklist=n.is_checklist,
            checklist_items=[ChecklistItemSchema.model_validate(item) for item in n.checklist_items],
        )
        for n in notes
    ]

@app.get("/notes/all", response_model=List[NoteSchema])
def api_get_all_notes(db: Session = Depends(get_db)):
    notes = db.query(Note).order_by(Note.created_at.desc()).all()
    return [
        NoteSchema(
            id=n.id,
            title=n.title,
            content=n.content,
            owner_id=n.owner_id,
            folder=n.folder,
            tags=n.tags.split(",") if n.tags else [],
            is_checklist=n.is_checklist,
            checklist_items=[
                ChecklistItemSchema.model_validate(item) for item in n.checklist_items
            ],
        )
        for n in notes
    ]

@app.get("/notes/{note_id}", response_model=NoteSchema)
def api_get_note(note_id: int, db: Session = Depends(get_db)):
    n = get_note(db, note_id)
    if not n:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteSchema(
        id=n.id,
        title=n.title,
        content=n.content,
        owner_id=n.owner_id,
        folder=n.folder,
        tags=n.tags.split(",") if n.tags else [],
        is_checklist=n.is_checklist,
        checklist_items=[
            ChecklistItemSchema.model_validate(item) for item in n.checklist_items
        ],
    )

# Only children can update their own notes
@app.put("/notes/{note_id}", response_model=NoteSchema)
def api_update_note(note_id: int, note: NoteSchema, db: Session = Depends(get_db), current_user = Depends(require_child)):
    # Check if note belongs to the authenticated child
    existing_note = get_note(db, note_id)
    if not existing_note or existing_note.owner_id != current_user["user"].id:
        raise HTTPException(status_code=404, detail="Note not found")
    
    updated = update_note(db, note_id, {
        "title": note.title,
        "content": note.content,
        "folder": note.folder,
        "tags": ",".join(note.tags) if isinstance(note.tags, list) else note.tags,
        "is_checklist": note.is_checklist,
    })
    if not updated:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteSchema(
        id=updated.id,
        title=updated.title,
        content=updated.content,
        owner_id=updated.owner_id,
        folder=updated.folder,
        tags=updated.tags.split(",") if updated.tags else [],
        is_checklist=updated.is_checklist,
        checklist_items=[
            ChecklistItemSchema.model_validate(item) for item in updated.checklist_items
        ],
    )

# Only children can delete their own notes
@app.delete("/notes/{note_id}", status_code=204)
def api_delete_note(note_id: int, db: Session = Depends(get_db), current_user = Depends(require_child)):
    # Check if note belongs to the authenticated child
    existing_note = get_note(db, note_id)
    if not existing_note or existing_note.owner_id != current_user["user"].id:
        raise HTTPException(status_code=404, detail="Note not found")
    
    ok = delete_note(db, note_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Note not found")
    return None

@app.post("/notes/{note_id}/checklist/", response_model=ChecklistItemSchema)
def api_add_checklist_item(note_id: int, item: ChecklistItemSchema, db: Session = Depends(get_db)):
    db_item = add_checklist_item(db, note_id=note_id, text=item.text, checked=item.checked)
    return ChecklistItemSchema.model_validate(db_item)

@app.get("/notes/{note_id}/checklist/", response_model=List[ChecklistItemSchema])
def api_list_checklist_items(note_id: int, db: Session = Depends(get_db)):
    items = list_checklist_items(db, note_id)
    return [ChecklistItemSchema.model_validate(i) for i in items]

@app.put("/checklist/{item_id}", response_model=ChecklistItemSchema)
def api_update_checklist_item(item_id: int, item: ChecklistItemSchema, db: Session = Depends(get_db)):
    updated = update_checklist_item(db, item_id, {"text": item.text, "checked": item.checked})
    if not updated:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    return ChecklistItemSchema.model_validate(updated)

@app.delete("/checklist/{item_id}", status_code=204)
def api_delete_checklist_item(item_id: int, db: Session = Depends(get_db)):
    ok = delete_checklist_item(db, item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    return None

@app.get("/child/by-family-code")
def get_child_by_family_code_endpoint(family_code: str, db: Session = Depends(get_db)):
    child = get_child_by_family_code(db, family_code)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return {
        "id": child.id,
        "name": child.name,
        "email": child.email,
        "family_code": child.family_code,
    }

