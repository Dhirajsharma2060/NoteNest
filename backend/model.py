from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, default="")
    owner_id = Column(Integer, ForeignKey("children.id"), nullable=False)  # FK to Child
    folder = Column(String(128), nullable=True)
    tags = Column(String(1024), default="")  # comma-separated tags
    is_checklist = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    checklist_items = relationship("ChecklistItem", back_populates="note", cascade="all, delete-orphan")


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=False)
    text = Column(String(1024), nullable=False)
    checked = Column(Boolean, default=False)

    note = relationship("Note", back_populates="checklist_items")


class Child(Base):
    __tablename__ = "children"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    family_code = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Relationship to parents
    parents = relationship("Parent", back_populates="child")
    # Relationship to notes
    notes = relationship("Note", backref="child", cascade="all, delete-orphan")


class Parent(Base):
    __tablename__ = "parents"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    child_id = Column(Integer, ForeignKey("children.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Relationship to child
    child = relationship("Child", back_populates="parents")