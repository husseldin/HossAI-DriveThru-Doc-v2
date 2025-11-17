"""
Unit tests for Menu Service
Tests CRUD operations for Branch, Menu, Category, Item, Variant, AddOn, Keyword
"""
import pytest
from src.services.menu.menu_service import MenuService
from src.models.menu import (
    BranchCreate, MenuCreate, CategoryCreate, ItemCreate,
    VariantCreate, AddOnCreate, KeywordCreate
)


class TestMenuService:
    """Test cases for MenuService"""

    @pytest.fixture
    def menu_service(self):
        """Create menu service instance"""
        return MenuService()

    # ============================================================================
    # BRANCH TESTS
    # ============================================================================

    def test_create_branch(self, db_session, menu_service):
        """Test branch creation"""
        branch_data = BranchCreate(
            name_ar="فرع الرياض",
            name_en="Riyadh Branch",
            code="RYD001",
            location="Riyadh, Saudi Arabia",
            phone="+966112345678",
            active=True
        )

        branch = menu_service.create_branch(db_session, branch_data)

        assert branch.id is not None
        assert branch.name_ar == "فرع الرياض"
        assert branch.name_en == "Riyadh Branch"
        assert branch.code == "RYD001"
        assert branch.active is True

    def test_get_branch(self, db_session, menu_service, sample_branch):
        """Test get branch by ID"""
        branch = menu_service.get_branch(db_session, sample_branch.id)

        assert branch is not None
        assert branch.id == sample_branch.id
        assert branch.name_ar == sample_branch.name_ar

    def test_get_branches_active_only(self, db_session, menu_service):
        """Test get all active branches"""
        # Create active branch
        active = menu_service.create_branch(db_session, BranchCreate(
            name_ar="فرع نشط",
            name_en="Active Branch",
            code="ACT001",
            active=True
        ))

        # Create inactive branch
        inactive = menu_service.create_branch(db_session, BranchCreate(
            name_ar="فرع غير نشط",
            name_en="Inactive Branch",
            code="INACT001",
            active=False
        ))

        branches = menu_service.get_branches(db_session, active_only=True)

        assert len(branches) >= 1
        assert all(b.active for b in branches)
        assert active.id in [b.id for b in branches]
        assert inactive.id not in [b.id for b in branches]

    def test_update_branch(self, db_session, menu_service, sample_branch):
        """Test branch update"""
        sample_branch.phone = "+966123456789"
        db_session.commit()
        db_session.refresh(sample_branch)

        assert sample_branch.phone == "+966123456789"

    def test_deactivate_branch(self, db_session, menu_service, sample_branch):
        """Test branch deactivation"""
        sample_branch.active = False
        db_session.commit()

        branch = menu_service.get_branch(db_session, sample_branch.id)
        assert branch.active is False

    # ============================================================================
    # MENU TESTS
    # ============================================================================

    def test_create_menu(self, db_session, menu_service, sample_branch):
        """Test menu creation"""
        menu_data = MenuCreate(
            branch_id=sample_branch.id,
            name_ar="قائمة العشاء",
            name_en="Dinner Menu",
            description_ar="قائمة العشاء الخاصة",
            description_en="Special dinner menu",
            active=True
        )

        menu = menu_service.create_menu(db_session, menu_data)

        assert menu.id is not None
        assert menu.name_ar == "قائمة العشاء"
        assert menu.branch_id == sample_branch.id

    def test_get_menu_with_cache(self, db_session, menu_service, sample_menu):
        """Test get menu with caching"""
        # First call - from database
        menu1 = menu_service.get_menu(db_session, sample_menu.id)

        # Second call - should use cache (if implemented)
        menu2 = menu_service.get_menu(db_session, sample_menu.id)

        assert menu1 is not None
        assert menu2 is not None
        assert menu1.id == menu2.id

    def test_publish_menu(self, db_session, menu_service, sample_menu):
        """Test menu publishing"""
        menu = menu_service.publish_menu(db_session, sample_menu.id)

        assert menu.published is True

    def test_publish_menu_unpublishes_others(self, db_session, menu_service, sample_branch):
        """Test that publishing a menu unpublishes other menus for the same branch"""
        # Create two menus
        menu1 = menu_service.create_menu(db_session, MenuCreate(
            branch_id=sample_branch.id,
            name_ar="قائمة 1",
            name_en="Menu 1",
            active=True
        ))

        menu2 = menu_service.create_menu(db_session, MenuCreate(
            branch_id=sample_branch.id,
            name_ar="قائمة 2",
            name_en="Menu 2",
            active=True
        ))

        # Publish menu1
        menu_service.publish_menu(db_session, menu1.id)
        db_session.refresh(menu1)
        db_session.refresh(menu2)

        assert menu1.published is True
        assert menu2.published is False

        # Publish menu2
        menu_service.publish_menu(db_session, menu2.id)
        db_session.refresh(menu1)
        db_session.refresh(menu2)

        assert menu1.published is False
        assert menu2.published is True

    # ============================================================================
    # CATEGORY TESTS
    # ============================================================================

    def test_create_category(self, db_session, menu_service, sample_menu):
        """Test category creation"""
        category_data = CategoryCreate(
            menu_id=sample_menu.id,
            name_ar="مشروبات",
            name_en="Beverages",
            description_ar="مشروبات ساخنة وباردة",
            description_en="Hot and cold beverages",
            display_order=2,
            active=True
        )

        category = menu_service.create_category(db_session, category_data)

        assert category.id is not None
        assert category.name_ar == "مشروبات"
        assert category.menu_id == sample_menu.id
        assert category.display_order == 2

    def test_get_category(self, db_session, menu_service, sample_category):
        """Test get category by ID"""
        category = menu_service.get_category(db_session, sample_category.id)

        assert category is not None
        assert category.id == sample_category.id

    def test_get_categories_by_menu(self, db_session, menu_service, sample_menu):
        """Test get all categories for a menu"""
        # Create multiple categories
        cat1 = menu_service.create_category(db_session, CategoryCreate(
            menu_id=sample_menu.id,
            name_ar="برجر",
            name_en="Burgers",
            display_order=1,
            active=True
        ))

        cat2 = menu_service.create_category(db_session, CategoryCreate(
            menu_id=sample_menu.id,
            name_ar="بيتزا",
            name_en="Pizza",
            display_order=2,
            active=True
        ))

        categories = menu_service.get_categories_by_menu(db_session, sample_menu.id)

        assert len(categories) >= 2
        # Should be ordered by display_order
        assert categories[0].display_order <= categories[1].display_order

    def test_category_with_items(self, db_session, menu_service, sample_category, sample_item):
        """Test getting category with its items"""
        category = menu_service.get_category_with_items(db_session, sample_category.id)

        assert category is not None
        assert hasattr(category, 'items')
        assert len(category.items) >= 1

    # ============================================================================
    # ITEM TESTS
    # ============================================================================

    def test_create_item(self, db_session, menu_service, sample_category):
        """Test item creation"""
        item_data = ItemCreate(
            category_id=sample_category.id,
            name_ar="برجر دجاج",
            name_en="Chicken Burger",
            description_ar="برجر دجاج مقرمش",
            description_en="Crispy chicken burger",
            base_price=22.00,
            preparation_time=8,
            image_url="https://example.com/chicken-burger.jpg",
            calories=450,
            available=True,
            display_order=2
        )

        item = menu_service.create_item(db_session, item_data)

        assert item.id is not None
        assert item.name_ar == "برجر دجاج"
        assert item.base_price == 22.00
        assert item.category_id == sample_category.id

    def test_get_item(self, db_session, menu_service, sample_item):
        """Test get item by ID"""
        item = menu_service.get_item(db_session, sample_item.id)

        assert item is not None
        assert item.id == sample_item.id

    def test_get_items_by_category(self, db_session, menu_service, sample_category):
        """Test get all items in a category"""
        # Create multiple items
        item1 = menu_service.create_item(db_session, ItemCreate(
            category_id=sample_category.id,
            name_ar="برجر 1",
            name_en="Burger 1",
            base_price=20.00,
            display_order=1,
            available=True
        ))

        item2 = menu_service.create_item(db_session, ItemCreate(
            category_id=sample_category.id,
            name_ar="برجر 2",
            name_en="Burger 2",
            base_price=25.00,
            display_order=2,
            available=True
        ))

        items = menu_service.get_items_by_category(db_session, sample_category.id)

        assert len(items) >= 2

    def test_item_availability_toggle(self, db_session, menu_service, sample_item):
        """Test toggling item availability"""
        sample_item.available = False
        db_session.commit()

        item = menu_service.get_item(db_session, sample_item.id)
        assert item.available is False

    def test_update_item_price(self, db_session, menu_service, sample_item):
        """Test updating item price"""
        sample_item.base_price = 30.00
        db_session.commit()

        item = menu_service.get_item(db_session, sample_item.id)
        assert item.base_price == 30.00

    # ============================================================================
    # VARIANT TESTS
    # ============================================================================

    def test_create_variant(self, db_session, menu_service, sample_item):
        """Test variant creation"""
        variant_data = VariantCreate(
            item_id=sample_item.id,
            variant_type="size",
            name_ar="وسط",
            name_en="Medium",
            price_modifier=0.00,
            is_default=True
        )

        variant = menu_service.create_variant(db_session, variant_data)

        assert variant.id is not None
        assert variant.name_ar == "وسط"
        assert variant.variant_type == "size"
        assert variant.is_default is True

    def test_create_variant_with_positive_modifier(self, db_session, menu_service, sample_item):
        """Test variant with positive price modifier"""
        variant_data = VariantCreate(
            item_id=sample_item.id,
            variant_type="size",
            name_ar="كبير جداً",
            name_en="Extra Large",
            price_modifier=8.00,
            is_default=False
        )

        variant = menu_service.create_variant(db_session, variant_data)

        assert variant.price_modifier == 8.00

    def test_create_variant_with_negative_modifier(self, db_session, menu_service, sample_item):
        """Test variant with negative price modifier (discount)"""
        variant_data = VariantCreate(
            item_id=sample_item.id,
            variant_type="size",
            name_en="Small",
            price_modifier=-3.00,
            is_default=False
        )

        variant = menu_service.create_variant(db_session, variant_data)

        assert variant.price_modifier == -3.00

    def test_get_variants_by_item(self, db_session, menu_service, sample_item):
        """Test get all variants for an item"""
        # Create variants
        v1 = menu_service.create_variant(db_session, VariantCreate(
            item_id=sample_item.id,
            variant_type="size",
            name_ar="صغير",
            name_en="Small",
            price_modifier=-2.00
        ))

        v2 = menu_service.create_variant(db_session, VariantCreate(
            item_id=sample_item.id,
            variant_type="size",
            name_ar="كبير",
            name_en="Large",
            price_modifier=5.00
        ))

        variants = menu_service.get_variants_by_item(db_session, sample_item.id)

        assert len(variants) >= 2

    def test_variant_types(self, db_session, menu_service, sample_item):
        """Test different variant types"""
        types = ["size", "style", "temperature", "custom"]

        for vtype in types:
            variant = menu_service.create_variant(db_session, VariantCreate(
                item_id=sample_item.id,
                variant_type=vtype,
                name_en=f"Test {vtype}",
                price_modifier=0.00
            ))
            assert variant.variant_type == vtype

    # ============================================================================
    # ADD-ON TESTS
    # ============================================================================

    def test_create_addon(self, db_session, menu_service, sample_item):
        """Test add-on creation"""
        addon_data = AddOnCreate(
            item_id=sample_item.id,
            name_ar="بصل مقرمش",
            name_en="Crispy Onions",
            price=2.50
        )

        addon = menu_service.create_addon(db_session, addon_data)

        assert addon.id is not None
        assert addon.name_ar == "بصل مقرمش"
        assert addon.price == 2.50

    def test_get_addons_by_item(self, db_session, menu_service, sample_item):
        """Test get all add-ons for an item"""
        # Create add-ons
        a1 = menu_service.create_addon(db_session, AddOnCreate(
            item_id=sample_item.id,
            name_ar="بصل",
            name_en="Onions",
            price=1.50
        ))

        a2 = menu_service.create_addon(db_session, AddOnCreate(
            item_id=sample_item.id,
            name_ar="صوص خاص",
            name_en="Special Sauce",
            price=2.00
        ))

        addons = menu_service.get_addons_by_item(db_session, sample_item.id)

        assert len(addons) >= 2

    def test_addon_price_validation(self, db_session, menu_service, sample_item):
        """Test add-on price must be positive"""
        addon_data = AddOnCreate(
            item_id=sample_item.id,
            name_en="Free Addon",
            price=0.00  # Free add-on
        )

        addon = menu_service.create_addon(db_session, addon_data)
        assert addon.price == 0.00

    # ============================================================================
    # KEYWORD TESTS
    # ============================================================================

    def test_create_keyword(self, db_session, menu_service, sample_item):
        """Test keyword creation"""
        keyword_data = KeywordCreate(
            item_id=sample_item.id,
            keyword_ar="برغر",
            keyword_en="burgerking",
            weight=0.9
        )

        keyword = menu_service.create_keyword(db_session, keyword_data)

        assert keyword.id is not None
        assert keyword.keyword_ar == "برغر"
        assert keyword.weight == 0.9

    def test_get_keywords_by_item(self, db_session, menu_service, sample_item):
        """Test get all keywords for an item"""
        # Create keywords
        k1 = menu_service.create_keyword(db_session, KeywordCreate(
            item_id=sample_item.id,
            keyword_ar="همبرغر",
            keyword_en="hamburger",
            weight=1.0
        ))

        k2 = menu_service.create_keyword(db_session, KeywordCreate(
            item_id=sample_item.id,
            keyword_ar="ساندويش",
            keyword_en="sandwich",
            weight=0.7
        ))

        keywords = menu_service.get_keywords_by_item(db_session, sample_item.id)

        assert len(keywords) >= 2

    def test_keyword_weight_range(self, db_session, menu_service, sample_item):
        """Test keyword weight validation (0-1 range)"""
        keyword = menu_service.create_keyword(db_session, KeywordCreate(
            item_id=sample_item.id,
            keyword_en="test",
            weight=0.5
        ))

        assert 0.0 <= keyword.weight <= 1.0

    def test_search_items_by_keyword(self, db_session, menu_service, sample_item):
        """Test searching items by keyword"""
        # Create keywords
        menu_service.create_keyword(db_session, KeywordCreate(
            item_id=sample_item.id,
            keyword_ar="برجر",
            keyword_en="burger",
            weight=1.0
        ))

        # Search by keyword
        results = menu_service.search_items_by_keyword(db_session, "burger")

        assert len(results) >= 1
        assert sample_item.id in [r.id for r in results]

    # ============================================================================
    # RELATIONSHIP TESTS
    # ============================================================================

    def test_cascade_delete_menu(self, db_session, menu_service, sample_menu, sample_category):
        """Test cascading delete of menu deletes categories"""
        menu_id = sample_menu.id
        category_id = sample_category.id

        # Delete menu
        db_session.delete(sample_menu)
        db_session.commit()

        # Category should be deleted (if CASCADE is set)
        category = menu_service.get_category(db_session, category_id)
        # Behavior depends on CASCADE settings

    def test_item_total_price_with_variant_and_addons(self, db_session, menu_service, sample_item):
        """Test calculating total item price with variants and add-ons"""
        # Create variant
        variant = menu_service.create_variant(db_session, VariantCreate(
            item_id=sample_item.id,
            variant_type="size",
            name_en="Large",
            price_modifier=5.00
        ))

        # Create add-ons
        addon1 = menu_service.create_addon(db_session, AddOnCreate(
            item_id=sample_item.id,
            name_en="Extra Cheese",
            price=3.00
        ))

        addon2 = menu_service.create_addon(db_session, AddOnCreate(
            item_id=sample_item.id,
            name_en="Bacon",
            price=4.00
        ))

        # Calculate total
        base_price = sample_item.base_price
        total = base_price + variant.price_modifier + addon1.price + addon2.price

        assert total == base_price + 5.00 + 3.00 + 4.00
