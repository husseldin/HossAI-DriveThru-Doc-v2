"""
Menu Validation Service
Implements MENU-005 requirement from Build Phase Plan
"""
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from src.database import models as db_models
from src.models import MenuValidationResult
from src.utils import logger


class MenuValidationService:
    """
    Menu Validation Service

    Validates menu structure, pricing, and data integrity
    """

    def validate_menu(
        self,
        db: Session,
        menu_id: int
    ) -> MenuValidationResult:
        """
        Validate complete menu structure

        Args:
            db: Database session
            menu_id: Menu ID to validate

        Returns:
            MenuValidationResult with validation status and issues
        """
        errors = []
        warnings = []
        stats = {
            "categories": 0,
            "items": 0,
            "variants": 0,
            "addons": 0
        }

        # Get menu
        menu = db.query(db_models.Menu).filter(db_models.Menu.id == menu_id).first()
        if not menu:
            return MenuValidationResult(
                valid=False,
                errors=[f"Menu with ID {menu_id} not found"],
                stats=stats
            )

        # Validate categories
        categories = db.query(db_models.Category).filter(
            db_models.Category.menu_id == menu_id
        ).all()

        if not categories:
            warnings.append("Menu has no categories")

        stats["categories"] = len(categories)

        for category in categories:
            # Validate category names
            if not category.name_ar or not category.name_en:
                errors.append(
                    f"Category {category.id} missing Arabic or English name"
                )

            # Validate items in category
            items = db.query(db_models.Item).filter(
                db_models.Item.category_id == category.id
            ).all()

            if not items:
                warnings.append(f"Category '{category.name_en}' has no items")

            stats["items"] += len(items)

            for item in items:
                # Validate item
                item_errors = self._validate_item(db, item)
                errors.extend(item_errors)

                # Count variants and add-ons
                variants = db.query(db_models.Variant).filter(
                    db_models.Variant.item_id == item.id
                ).count()
                addons = db.query(db_models.AddOn).filter(
                    db_models.AddOn.item_id == item.id
                ).count()

                stats["variants"] += variants
                stats["addons"] += addons

        # Check for published menu conflicts
        if menu.published:
            other_published = db.query(db_models.Menu).filter(
                db_models.Menu.branch_id == menu.branch_id,
                db_models.Menu.published == True,
                db_models.Menu.id != menu_id
            ).first()

            if other_published:
                warnings.append(
                    f"Another menu (ID: {other_published.id}) is already published for this branch"
                )

        valid = len(errors) == 0

        logger.info(
            "Menu validation completed",
            menu_id=menu_id,
            valid=valid,
            errors=len(errors),
            warnings=len(warnings)
        )

        return MenuValidationResult(
            valid=valid,
            errors=errors,
            warnings=warnings,
            stats=stats
        )

    def _validate_item(
        self,
        db: Session,
        item: db_models.Item
    ) -> List[str]:
        """
        Validate individual item

        Args:
            db: Database session
            item: Item to validate

        Returns:
            List of error messages
        """
        errors = []

        # Validate names
        if not item.name_ar or not item.name_en:
            errors.append(f"Item {item.id} missing Arabic or English name")

        # Validate price
        if item.base_price < 0:
            errors.append(f"Item '{item.name_en}' has negative price")

        if item.base_price == 0:
            errors.append(f"Item '{item.name_en}' has zero price (may be intentional)")

        # Validate variants
        variants = db.query(db_models.Variant).filter(
            db_models.Variant.item_id == item.id
        ).all()

        # Check for default variant per type
        variant_types = {}
        for variant in variants:
            if variant.variant_type not in variant_types:
                variant_types[variant.variant_type] = []
            variant_types[variant.variant_type].append(variant)

        for v_type, v_list in variant_types.items():
            default_count = sum(1 for v in v_list if v.is_default)
            if default_count == 0:
                errors.append(
                    f"Item '{item.name_en}' has no default {v_type} variant"
                )
            elif default_count > 1:
                errors.append(
                    f"Item '{item.name_en}' has multiple default {v_type} variants"
                )

        # Validate add-ons
        addons = db.query(db_models.AddOn).filter(
            db_models.AddOn.item_id == item.id
        ).all()

        for addon in addons:
            if addon.price < 0:
                errors.append(
                    f"Add-on '{addon.name_en}' for item '{item.name_en}' has negative price"
                )

            if addon.is_conditional:
                if not addon.condition_variant_type or not addon.condition_variant_value:
                    errors.append(
                        f"Conditional add-on '{addon.name_en}' missing condition details"
                    )

        return errors

    def validate_item_structure(
        self,
        item_data: Dict[str, Any]
    ) -> MenuValidationResult:
        """
        Validate item data structure before creation

        Args:
            item_data: Item data dictionary

        Returns:
            MenuValidationResult
        """
        errors = []
        warnings = []

        required_fields = ["name_ar", "name_en", "base_price", "category_id"]
        for field in required_fields:
            if field not in item_data or item_data[field] is None:
                errors.append(f"Missing required field: {field}")

        if "base_price" in item_data:
            price = item_data["base_price"]
            if not isinstance(price, (int, float)) or price < 0:
                errors.append("base_price must be a non-negative number")

        if "preparation_time" in item_data:
            prep_time = item_data["preparation_time"]
            if not isinstance(prep_time, int) or prep_time < 0:
                errors.append("preparation_time must be a non-negative integer")

        return MenuValidationResult(
            valid=len(errors) == 0,
            errors=errors,
            warnings=warnings
        )


# Global validator instance
menu_validator = MenuValidationService()
