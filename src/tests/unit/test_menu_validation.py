"""
Unit tests for Menu Validation Service
"""
import pytest
from src.services.menu import MenuValidationService


class TestMenuValidation:
    """Test cases for MenuValidationService"""

    @pytest.fixture
    def validator(self):
        """Create validator instance"""
        return MenuValidationService()

    def test_validate_item_structure_valid(self, validator):
        """Test validation of valid item data"""
        item_data = {
            "name_ar": "برجر",
            "name_en": "Burger",
            "base_price": 25.50,
            "category_id": 1
        }

        result = validator.validate_item_structure(item_data)
        assert result.valid is True
        assert len(result.errors) == 0

    def test_validate_item_structure_missing_fields(self, validator):
        """Test validation with missing required fields"""
        item_data = {
            "name_ar": "برجر"
            # Missing name_en, base_price, category_id
        }

        result = validator.validate_item_structure(item_data)
        assert result.valid is False
        assert len(result.errors) > 0

    def test_validate_item_structure_negative_price(self, validator):
        """Test validation with negative price"""
        item_data = {
            "name_ar": "برجر",
            "name_en": "Burger",
            "base_price": -10.0,
            "category_id": 1
        }

        result = validator.validate_item_structure(item_data)
        assert result.valid is False
        assert any("negative" in error.lower() for error in result.errors)

    def test_validate_item_structure_invalid_prep_time(self, validator):
        """Test validation with invalid preparation time"""
        item_data = {
            "name_ar": "برجر",
            "name_en": "Burger",
            "base_price": 25.50,
            "category_id": 1,
            "preparation_time": -5
        }

        result = validator.validate_item_structure(item_data)
        assert result.valid is False
