"""
SQLAlchemy database models for menu system

Hierarchy:
  Branch → Menu → Category → Item → Variant/AddOn
"""
from datetime import datetime
from typing import List
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime,
    ForeignKey, Text, JSON, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship

from .connection import Base


class Branch(Base):
    """
    Branch model - Represents a restaurant branch

    Attributes:
        id: Unique branch identifier
        name: Branch name
        code: Unique branch code (e.g., "RYD-001")
        location: Branch location/address
        settings: Branch-specific settings (JSON)
        active: Whether branch is active
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    location = Column(String(500))
    settings = Column(JSON, default={})
    active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    menus = relationship("Menu", back_populates="branch", cascade="all, delete-orphan")
    keywords = relationship("Keyword", back_populates="branch", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Branch(id={self.id}, code='{self.code}', name='{self.name}')>"


class Menu(Base):
    """
    Menu model - Represents a menu version for a branch

    Attributes:
        id: Unique menu identifier
        branch_id: Associated branch
        name: Menu name (e.g., "Main Menu", "Breakfast Menu")
        version: Menu version number
        published: Whether menu is published/active
        valid_from: Menu validity start date
        valid_until: Menu validity end date
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """
    __tablename__ = "menus"

    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    name = Column(String(200), nullable=False)
    version = Column(Integer, default=1)
    published = Column(Boolean, default=False, index=True)
    valid_from = Column(DateTime, nullable=True)
    valid_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    branch = relationship("Branch", back_populates="menus")
    categories = relationship("Category", back_populates="menu", cascade="all, delete-orphan")

    # Unique constraint: one published menu per branch
    __table_args__ = (
        Index("idx_branch_published", "branch_id", "published"),
    )

    def __repr__(self):
        return f"<Menu(id={self.id}, name='{self.name}', version={self.version})>"


class Category(Base):
    """
    Category model - Menu category (e.g., "Burgers", "Drinks")

    Attributes:
        id: Unique category identifier
        menu_id: Associated menu
        name_ar: Category name in Arabic
        name_en: Category name in English
        description_ar: Category description in Arabic
        description_en: Category description in English
        display_order: Order for display
        active: Whether category is active
        image_url: Category image URL
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    menu_id = Column(Integer, ForeignKey("menus.id"), nullable=False)
    name_ar = Column(String(200), nullable=False)
    name_en = Column(String(200), nullable=False)
    description_ar = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)
    display_order = Column(Integer, default=0, index=True)
    active = Column(Boolean, default=True, index=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    menu = relationship("Menu", back_populates="categories")
    items = relationship("Item", back_populates="category", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Category(id={self.id}, name_en='{self.name_en}', name_ar='{self.name_ar}')>"


class Item(Base):
    """
    Item model - Menu item (e.g., "Cheeseburger", "Coke")

    Attributes:
        id: Unique item identifier
        category_id: Associated category
        name_ar: Item name in Arabic
        name_en: Item name in English
        description_ar: Item description in Arabic
        description_en: Item description in English
        base_price: Base price
        available: Whether item is available
        display_order: Order for display
        image_url: Item image URL
        calories: Calorie count
        preparation_time: Preparation time in minutes
        tags: Item tags (JSON array)
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name_ar = Column(String(200), nullable=False)
    name_en = Column(String(200), nullable=False)
    description_ar = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)
    base_price = Column(Float, nullable=False)
    available = Column(Boolean, default=True, index=True)
    display_order = Column(Integer, default=0, index=True)
    image_url = Column(String(500), nullable=True)
    calories = Column(Integer, nullable=True)
    preparation_time = Column(Integer, default=5)  # minutes
    tags = Column(JSON, default=[])  # e.g., ["spicy", "vegetarian"]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    category = relationship("Category", back_populates="items")
    variants = relationship("Variant", back_populates="item", cascade="all, delete-orphan")
    addons = relationship("AddOn", back_populates="item", cascade="all, delete-orphan")
    keywords = relationship("Keyword", back_populates="item", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Item(id={self.id}, name_en='{self.name_en}', price={self.base_price})>"


class Variant(Base):
    """
    Variant model - Item variant (e.g., size: Small/Medium/Large)

    Attributes:
        id: Unique variant identifier
        item_id: Associated item
        name_ar: Variant name in Arabic (e.g., "صغير")
        name_en: Variant name in English (e.g., "Small")
        variant_type: Type of variant (e.g., "size", "temperature")
        price_modifier: Price adjustment (+ or -)
        is_default: Whether this is the default variant
        available: Whether variant is available
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """
    __tablename__ = "variants"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    name_ar = Column(String(100), nullable=False)
    name_en = Column(String(100), nullable=False)
    variant_type = Column(String(50), nullable=False)  # size, temperature, etc.
    price_modifier = Column(Float, default=0.0)
    is_default = Column(Boolean, default=False)
    available = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    item = relationship("Item", back_populates="variants")

    # Indexes
    __table_args__ = (
        Index("idx_item_variant_type", "item_id", "variant_type"),
    )

    def __repr__(self):
        return f"<Variant(id={self.id}, type='{self.variant_type}', name_en='{self.name_en}')>"


class AddOn(Base):
    """
    AddOn model - Item add-on (e.g., "Extra Cheese", "Bacon")

    Attributes:
        id: Unique add-on identifier
        item_id: Associated item (nullable - can be global)
        name_ar: Add-on name in Arabic
        name_en: Add-on name in English
        price: Add-on price
        available: Whether add-on is available
        max_quantity: Maximum quantity allowed
        is_conditional: Whether add-on is conditional on variant
        condition_variant_type: Variant type condition
        condition_variant_value: Variant value condition
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """
    __tablename__ = "addons"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=True)  # Nullable for global add-ons
    name_ar = Column(String(200), nullable=False)
    name_en = Column(String(200), nullable=False)
    price = Column(Float, nullable=False)
    available = Column(Boolean, default=True, index=True)
    max_quantity = Column(Integer, default=5)
    is_conditional = Column(Boolean, default=False)
    condition_variant_type = Column(String(50), nullable=True)
    condition_variant_value = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    item = relationship("Item", back_populates="addons")

    def __repr__(self):
        return f"<AddOn(id={self.id}, name_en='{self.name_en}', price={self.price})>"


class Keyword(Base):
    """
    Keyword model - Keywords for NLU matching

    Attributes:
        id: Unique keyword identifier
        branch_id: Associated branch
        item_id: Associated item
        keyword_ar: Arabic keyword
        keyword_en: English keyword
        weight: Keyword weight (for matching priority)
        created_at: Creation timestamp
    """
    __tablename__ = "keywords"

    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    keyword_ar = Column(String(200), nullable=True, index=True)
    keyword_en = Column(String(200), nullable=True, index=True)
    weight = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    branch = relationship("Branch", back_populates="keywords")
    item = relationship("Item", back_populates="keywords")

    # Indexes for fast keyword lookup
    __table_args__ = (
        Index("idx_keyword_ar", "keyword_ar"),
        Index("idx_keyword_en", "keyword_en"),
        Index("idx_branch_item", "branch_id", "item_id"),
    )

    def __repr__(self):
        return f"<Keyword(id={self.id}, ar='{self.keyword_ar}', en='{self.keyword_en}')>"
