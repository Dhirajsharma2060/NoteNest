from typing import List, Optional, Literal
from pydantic import BaseModel, EmailStr

class ChecklistItemSchema(BaseModel):
    id: Optional[int] = None
    text: str
    checked: bool = False

    model_config = {"from_attributes": True}

class NoteSchema(BaseModel):
    id: Optional[int] = None
    title: str
    content: str = ""
    owner_id: int
    folder: Optional[str] = None
    tags: List[str] = []
    is_checklist: bool = False
    checklist_items: List[ChecklistItemSchema] = []

    model_config = {"from_attributes": True}

class UserSignupSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["child", "parent"]
    family_code: Optional[str] = None  # For parent signup using child's code

class UserSchema(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: Literal["child", "parent"]
    family_code: Optional[str] = None  # Only for children

    model_config = {"from_attributes": True}

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class RefreshTokenSchema(BaseModel):
    refresh_token: str
