"""
Menu Service - CRUD operations for menu system
Implements Phase 2 deliverables
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from src.database import models as db_models
from src.models import menu as menu_models
from src.utils import logger, log_service_event
from .cache_service import menu_cache
from .validation_service import menu_validator


class MenuService:
    """Menu Service with CRUD operations and caching"""

    # ============== BRANCH OPERATIONS ==============

    def create_branch(self, db: Session, branch: menu_models.BranchCreate) -> db_models.Branch:
        """Create new branch"""
        db_branch = db_models.Branch(**branch.dict())
        db.add(db_branch)
        db.commit()
        db.refresh(db_branch)
        log_service_event("menu", "branch_created", f"Branch created: {db_branch.code}")
        return db_branch

    def get_branch(self, db: Session, branch_id: int) -> Optional[db_models.Branch]:
        """Get branch by ID"""
        return db.query(db_models.Branch).filter(db_models.Branch.id == branch_id).first()

    def get_branches(self, db: Session, active_only: bool = True) -> List[db_models.Branch]:
        """Get all branches"""
        query = db.query(db_models.Branch)
        if active_only:
            query = query.filter(db_models.Branch.active == True)
        return query.all()

    # ============== MENU OPERATIONS ==============

    def create_menu(self, db: Session, menu: menu_models.MenuCreate) -> db_models.Menu:
        """Create new menu"""
        db_menu = db_models.Menu(**menu.dict())
        db.add(db_menu)
        db.commit()
        db.refresh(db_menu)
        log_service_event("menu", "menu_created", f"Menu created: {db_menu.name}")
        return db_menu

    def get_menu(self, db: Session, menu_id: int) -> Optional[db_models.Menu]:
        """Get menu by ID with caching"""
        # Check cache
        cached = menu_cache.get("full", menu_id)
        if cached:
            return cached

        menu = db.query(db_models.Menu).filter(db_models.Menu.id == menu_id).first()
        if menu:
            # Cache result
            menu_cache.set("full", menu_id, menu.__dict__)
        return menu

    def publish_menu(self, db: Session, menu_id: int) -> db_models.Menu:
        """Publish menu (unpublishes other menus for branch)"""
        menu = self.get_menu(db, menu_id)
        if not menu:
            raise ValueError(f"Menu {menu_id} not found")

        # Validate before publishing
        validation = menu_validator.validate_menu(db, menu_id)
        if not validation.valid:
            raise ValueError(f"Menu validation failed: {validation.errors}")

        # Unpublish other menus for this branch
        db.query(db_models.Menu).filter(
            and_(
                db_models.Menu.branch_id == menu.branch_id,
                db_models.Menu.id != menu_id
            )
        ).update({"published": False})

        # Publish this menu
        menu.published = True
        db.commit()
        db.refresh(menu)

        # Clear cache
        menu_cache.clear_pattern(f"branch_{menu.branch_id}")

        log_service_event("menu", "menu_published", f"Menu {menu_id} published")
        return menu

    # ============== CATEGORY OPERATIONS ==============

    def create_category(self, db: Session, category: menu_models.CategoryCreate) -> db_models.Category:
        """Create category"""
        db_category = db_models.Category(**category.dict())
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        menu_cache.delete("full", category.menu_id)
        return db_category

    def get_categories(self, db: Session, menu_id: int) -> List[db_models.Category]:
        """Get categories for menu"""
        return db.query(db_models.Category).filter(
            db_models.Category.menu_id == menu_id
        ).order_by(db_models.Category.display_order).all()

    # ============== ITEM OPERATIONS ==============

    def create_item(self, db: Session, item: menu_models.ItemCreate) -> db_models.Item:
        """Create item"""
        db_item = db_models.Item(**item.dict())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    def get_item(self, db: Session, item_id: int) -> Optional[db_models.Item]:
        """Get item by ID"""
        return db.query(db_models.Item).filter(db_models.Item.id == item_id).first()

    def get_items(self, db: Session, category_id: int) -> List[db_models.Item]:
        """Get items for category"""
        return db.query(db_models.Item).filter(
            db_models.Item.category_id == category_id
        ).order_by(db_models.Item.display_order).all()

    def update_item(self, db: Session, item_id: int, item_update: menu_models.ItemUpdate) -> db_models.Item:
        """Update item"""
        db_item = self.get_item(db, item_id)
        if not db_item:
            raise ValueError(f"Item {item_id} not found")

        update_data = item_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)

        db.commit()
        db.refresh(db_item)
        return db_item

    # ============== VARIANT OPERATIONS ==============

    def create_variant(self, db: Session, variant: menu_models.VariantCreate) -> db_models.Variant:
        """Create variant"""
        db_variant = db_models.Variant(**variant.dict())
        db.add(db_variant)
        db.commit()
        db.refresh(db_variant)
        return db_variant

    def get_variants(self, db: Session, item_id: int) -> List[db_models.Variant]:
        """Get variants for item"""
        return db.query(db_models.Variant).filter(db_models.Variant.item_id == item_id).all()

    # ============== ADDON OPERATIONS ==============

    def create_addon(self, db: Session, addon: menu_models.AddOnCreate) -> db_models.AddOn:
        """Create add-on"""
        db_addon = db_models.AddOn(**addon.dict())
        db.add(db_addon)
        db.commit()
        db.refresh(db_addon)
        return db_addon

    def get_addons(self, db: Session, item_id: int) -> List[db_models.AddOn]:
        """Get add-ons for item"""
        return db.query(db_models.AddOn).filter(db_models.AddOn.item_id == item_id).all()


# Global service instance
menu_service = MenuService()
