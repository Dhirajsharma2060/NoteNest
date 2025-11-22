from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.model import Note, ChecklistItem

def create_note(
    db: Session,
    title: str,
    content: str,
    owner_id: int,
    folder: Optional[str] = None,
    tags: Optional[List[str]] = None,
    is_checklist: bool = False,
) -> Note:
    note = Note(
        title=title,
        content=content,
        owner_id=owner_id,
        folder=folder,
        tags=",".join(tags or []),
        is_checklist=is_checklist,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

def get_note(db: Session, note_id: int) -> Optional[Note]:
    return db.query(Note).filter(Note.id == note_id).first()

def list_notes_by_owner(db: Session, owner_id: int, limit: int = 20, offset: int = 0) -> List[Note]:
    return db.query(Note).filter(Note.owner_id == owner_id).offset(offset).limit(limit).all()

def update_note(db: Session, note_id: int, fields: Dict[str, Any]) -> Optional[Note]:
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        return None
    for key, value in fields.items():
        if hasattr(note, key):
            setattr(note, key, value)
    note.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(note)
    return note

def delete_note(db: Session, note_id: int) -> bool:
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        return False
    db.delete(note)
    db.commit()
    return True

# Checklist helpers

def add_checklist_item(db: Session, note_id: int, text: str, checked: bool = False) -> ChecklistItem:
    item = ChecklistItem(note_id=note_id, text=text, checked=checked)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def list_checklist_items(db: Session, note_id: int) -> List[ChecklistItem]:
    return db.query(ChecklistItem).filter(ChecklistItem.note_id == note_id).all()

def update_checklist_item(db: Session, item_id: int, fields: Dict[str, Any]) -> Optional[ChecklistItem]:
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item:
        return None
    for key, value in fields.items():
        if hasattr(item, key):
            setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

def delete_checklist_item(db: Session, item_id: int) -> bool:
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True