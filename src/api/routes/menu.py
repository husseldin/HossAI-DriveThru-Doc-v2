"""
Menu API routes
Implements Phase 2 menu system API endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.models import menu as menu_models
from src.services.menu import menu_service, menu_validator
from src.utils import logger

router = APIRouter(prefix="/api/v1/menu", tags=["menu"])


# ============== BRANCH ENDPOINTS ==============

@router.post("/branches", response_model=menu_models.BranchResponse, status_code=status.HTTP_201_CREATED)
async def create_branch(branch: menu_models.BranchCreate, db: Session = Depends(get_db)):
    """Create new branch"""
    try:
        db_branch = menu_service.create_branch(db, branch)
        return db_branch
    except Exception as e:
        logger.error("Branch creation failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/branches", response_model=List[menu_models.BranchResponse])
async def list_branches(active_only: bool = True, db: Session = Depends(get_db)):
    """List all branches"""
    return menu_service.get_branches(db, active_only=active_only)


@router.get("/branches/{branch_id}", response_model=menu_models.BranchResponse)
async def get_branch(branch_id: int, db: Session = Depends(get_db)):
    """Get branch by ID"""
    branch = menu_service.get_branch(db, branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch


# ============== MENU ENDPOINTS ==============

@router.post("/menus", response_model=menu_models.MenuResponse, status_code=status.HTTP_201_CREATED)
async def create_menu(menu: menu_models.MenuCreate, db: Session = Depends(get_db)):
    """Create new menu"""
    try:
        db_menu = menu_service.create_menu(db, menu)
        return db_menu
    except Exception as e:
        logger.error("Menu creation failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/menus/{menu_id}", response_model=menu_models.MenuResponse)
async def get_menu(menu_id: int, db: Session = Depends(get_db)):
    """Get menu by ID"""
    menu = menu_service.get_menu(db, menu_id)
    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")
    return menu


@router.post("/menus/{menu_id}/publish", response_model=menu_models.MenuResponse)
async def publish_menu(menu_id: int, db: Session = Depends(get_db)):
    """Publish menu"""
    try:
        menu = menu_service.publish_menu(db, menu_id)
        return menu
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Menu publishing failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/menus/{menu_id}/validate", response_model=menu_models.MenuValidationResult)
async def validate_menu(menu_id: int, db: Session = Depends(get_db)):
    """Validate menu structure"""
    return menu_validator.validate_menu(db, menu_id)


# ============== CATEGORY ENDPOINTS ==============

@router.post("/categories", response_model=menu_models.CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(category: menu_models.CategoryCreate, db: Session = Depends(get_db)):
    """Create category"""
    try:
        db_category = menu_service.create_category(db, category)
        return db_category
    except Exception as e:
        logger.error("Category creation failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/menus/{menu_id}/categories", response_model=List[menu_models.CategoryResponse])
async def list_categories(menu_id: int, db: Session = Depends(get_db)):
    """List categories for menu"""
    return menu_service.get_categories(db, menu_id)


# ============== ITEM ENDPOINTS ==============

@router.post("/items", response_model=menu_models.ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(item: menu_models.ItemCreate, db: Session = Depends(get_db)):
    """Create item"""
    try:
        # Validate item structure
        validation = menu_validator.validate_item_structure(item.dict())
        if not validation.valid:
            raise HTTPException(status_code=400, detail=validation.errors)

        db_item = menu_service.create_item(db, item)
        return db_item
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Item creation failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/items/{item_id}", response_model=menu_models.ItemResponse)
async def get_item(item_id: int, db: Session = Depends(get_db)):
    """Get item by ID"""
    item = menu_service.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.put("/items/{item_id}", response_model=menu_models.ItemResponse)
async def update_item(item_id: int, item_update: menu_models.ItemUpdate, db: Session = Depends(get_db)):
    """Update item"""
    try:
        db_item = menu_service.update_item(db, item_id, item_update)
        return db_item
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error("Item update failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories/{category_id}/items", response_model=List[menu_models.ItemResponse])
async def list_items(category_id: int, db: Session = Depends(get_db)):
    """List items for category"""
    return menu_service.get_items(db, category_id)


# ============== VARIANT ENDPOINTS ==============

@router.post("/variants", response_model=menu_models.VariantResponse, status_code=status.HTTP_201_CREATED)
async def create_variant(variant: menu_models.VariantCreate, db: Session = Depends(get_db)):
    """Create variant"""
    try:
        db_variant = menu_service.create_variant(db, variant)
        return db_variant
    except Exception as e:
        logger.error("Variant creation failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/items/{item_id}/variants", response_model=List[menu_models.VariantResponse])
async def list_variants(item_id: int, db: Session = Depends(get_db)):
    """List variants for item"""
    return menu_service.get_variants(db, item_id)


# ============== ADDON ENDPOINTS ==============

@router.post("/addons", response_model=menu_models.AddOnResponse, status_code=status.HTTP_201_CREATED)
async def create_addon(addon: menu_models.AddOnCreate, db: Session = Depends(get_db)):
    """Create add-on"""
    try:
        db_addon = menu_service.create_addon(db, addon)
        return db_addon
    except Exception as e:
        logger.error("Add-on creation failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/items/{item_id}/addons", response_model=List[menu_models.AddOnResponse])
async def list_addons(item_id: int, db: Session = Depends(get_db)):
    """List add-ons for item"""
    return menu_service.get_addons(db, item_id)
