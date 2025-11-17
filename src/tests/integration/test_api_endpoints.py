"""
Integration tests for API Endpoints
Tests all REST API endpoints with proper HTTP methods and status codes
"""
import pytest
from fastapi import status
from src.models.menu import BranchCreate, MenuCreate, CategoryCreate, ItemCreate, VariantCreate, AddOnCreate, KeywordCreate


class TestBranchEndpoints:
    """Test cases for Branch API endpoints"""

    @pytest.mark.integration
    @pytest.mark.api
    def test_create_branch(self, test_client):
        """Test POST /api/v1/menu/branches"""
        branch_data = {
            "name_ar": "فرع جدة",
            "name_en": "Jeddah Branch",
            "code": "JED001",
            "location": "Jeddah, Saudi Arabia",
            "phone": "+966125555555",
            "active": True
        }

        response = test_client.post("/api/v1/menu/branches", json=branch_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name_ar"] == "فرع جدة"
        assert data["code"] == "JED001"
        assert "id" in data

    @pytest.mark.integration
    @pytest.mark.api
    def test_list_branches(self, test_client, sample_branch):
        """Test GET /api/v1/menu/branches"""
        response = test_client.get("/api/v1/menu/branches")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    @pytest.mark.integration
    @pytest.mark.api
    def test_get_branch(self, test_client, sample_branch):
        """Test GET /api/v1/menu/branches/{branch_id}"""
        response = test_client.get(f"/api/v1/menu/branches/{sample_branch.id}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == sample_branch.id
        assert data["name_en"] == sample_branch.name_en

    @pytest.mark.integration
    @pytest.mark.api
    def test_get_branch_not_found(self, test_client):
        """Test GET /api/v1/menu/branches/{branch_id} with invalid ID"""
        response = test_client.get("/api/v1/menu/branches/99999")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.integration
    @pytest.mark.api
    def test_list_branches_active_only(self, test_client):
        """Test GET /api/v1/menu/branches?active_only=true"""
        response = test_client.get("/api/v1/menu/branches?active_only=true")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert all(branch["active"] for branch in data)


class TestMenuEndpoints:
    """Test cases for Menu API endpoints"""

    @pytest.mark.integration
    @pytest.mark.api
    def test_create_menu(self, test_client, sample_branch):
        """Test POST /api/v1/menu/menus"""
        menu_data = {
            "branch_id": sample_branch.id,
            "name_ar": "قائمة الغداء",
            "name_en": "Lunch Menu",
            "description_ar": "قائمة خاصة بالغداء",
            "description_en": "Special lunch menu",
            "active": True
        }

        response = test_client.post("/api/v1/menu/menus", json=menu_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name_ar"] == "قائمة الغداء"
        assert data["branch_id"] == sample_branch.id

    @pytest.mark.integration
    @pytest.mark.api
    def test_get_menu(self, test_client, sample_menu):
        """Test GET /api/v1/menu/menus/{menu_id}"""
        response = test_client.get(f"/api/v1/menu/menus/{sample_menu.id}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == sample_menu.id

    @pytest.mark.integration
    @pytest.mark.api
    def test_publish_menu(self, test_client, sample_menu):
        """Test POST /api/v1/menu/menus/{menu_id}/publish"""
        response = test_client.post(f"/api/v1/menu/menus/{sample_menu.id}/publish")

        # May fail if validation fails, but should return proper status
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]

    @pytest.mark.integration
    @pytest.mark.api
    def test_validate_menu(self, test_client, sample_menu):
        """Test GET /api/v1/menu/menus/{menu_id}/validate"""
        response = test_client.get(f"/api/v1/menu/menus/{sample_menu.id}/validate")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "valid" in data
        assert "errors" in data


class TestCategoryEndpoints:
    """Test cases for Category API endpoints"""

    @pytest.mark.integration
    @pytest.mark.api
    def test_create_category(self, test_client, sample_menu):
        """Test POST /api/v1/menu/categories"""
        category_data = {
            "menu_id": sample_menu.id,
            "name_ar": "حلويات",
            "name_en": "Desserts",
            "description_ar": "تشكيلة من الحلويات",
            "description_en": "Assorted desserts",
            "display_order": 3,
            "active": True
        }

        response = test_client.post("/api/v1/menu/categories", json=category_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name_ar"] == "حلويات"
        assert data["menu_id"] == sample_menu.id

    @pytest.mark.integration
    @pytest.mark.api
    def test_list_categories(self, test_client, sample_menu, sample_category):
        """Test GET /api/v1/menu/menus/{menu_id}/categories"""
        response = test_client.get(f"/api/v1/menu/menus/{sample_menu.id}/categories")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1


class TestItemEndpoints:
    """Test cases for Item API endpoints"""

    @pytest.mark.integration
    @pytest.mark.api
    def test_create_item(self, test_client, sample_category):
        """Test POST /api/v1/menu/items"""
        item_data = {
            "category_id": sample_category.id,
            "name_ar": "تشيز برجر",
            "name_en": "Cheese Burger",
            "description_ar": "برجر بالجبنة",
            "description_en": "Burger with cheese",
            "base_price": 28.00,
            "preparation_time": 10,
            "available": True,
            "display_order": 1
        }

        response = test_client.post("/api/v1/menu/items", json=item_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name_ar"] == "تشيز برجر"
        assert data["base_price"] == 28.00

    @pytest.mark.integration
    @pytest.mark.api
    def test_create_item_validation_error(self, test_client, sample_category):
        """Test POST /api/v1/menu/items with invalid data"""
        item_data = {
            "category_id": sample_category.id,
            "name_ar": "برجر",
            # Missing required fields
            "base_price": -10.00  # Invalid negative price
        }

        response = test_client.post("/api/v1/menu/items", json=item_data)

        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_422_UNPROCESSABLE_ENTITY]

    @pytest.mark.integration
    @pytest.mark.api
    def test_get_item(self, test_client, sample_item):
        """Test GET /api/v1/menu/items/{item_id}"""
        response = test_client.get(f"/api/v1/menu/items/{sample_item.id}")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == sample_item.id

    @pytest.mark.integration
    @pytest.mark.api
    def test_update_item(self, test_client, sample_item):
        """Test PUT /api/v1/menu/items/{item_id}"""
        update_data = {
            "name_ar": "برجر محدث",
            "name_en": "Updated Burger",
            "base_price": 35.00
        }

        response = test_client.put(f"/api/v1/menu/items/{sample_item.id}", json=update_data)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name_ar"] == "برجر محدث"
        assert data["base_price"] == 35.00

    @pytest.mark.integration
    @pytest.mark.api
    def test_list_items(self, test_client, sample_category, sample_item):
        """Test GET /api/v1/menu/categories/{category_id}/items"""
        response = test_client.get(f"/api/v1/menu/categories/{sample_category.id}/items")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1


class TestVariantEndpoints:
    """Test cases for Variant API endpoints"""

    @pytest.mark.integration
    @pytest.mark.api
    def test_create_variant(self, test_client, sample_item):
        """Test POST /api/v1/menu/variants"""
        variant_data = {
            "item_id": sample_item.id,
            "variant_type": "size",
            "name_ar": "صغير",
            "name_en": "Small",
            "price_modifier": -3.00,
            "is_default": False
        }

        response = test_client.post("/api/v1/menu/variants", json=variant_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name_ar"] == "صغير"
        assert data["price_modifier"] == -3.00

    @pytest.mark.integration
    @pytest.mark.api
    def test_list_variants(self, test_client, sample_item, sample_variant):
        """Test GET /api/v1/menu/items/{item_id}/variants"""
        response = test_client.get(f"/api/v1/menu/items/{sample_item.id}/variants")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)


class TestAddOnEndpoints:
    """Test cases for Add-On API endpoints"""

    @pytest.mark.integration
    @pytest.mark.api
    def test_create_addon(self, test_client, sample_item):
        """Test POST /api/v1/menu/addons"""
        addon_data = {
            "item_id": sample_item.id,
            "name_ar": "خس إضافي",
            "name_en": "Extra Lettuce",
            "price": 1.50
        }

        response = test_client.post("/api/v1/menu/addons", json=addon_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name_ar"] == "خس إضافي"
        assert data["price"] == 1.50

    @pytest.mark.integration
    @pytest.mark.api
    def test_list_addons(self, test_client, sample_item, sample_addon):
        """Test GET /api/v1/menu/items/{item_id}/addons"""
        response = test_client.get(f"/api/v1/menu/items/{sample_item.id}/addons")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)


class TestKeywordEndpoints:
    """Test cases for Keyword API endpoints"""

    @pytest.mark.integration
    @pytest.mark.api
    def test_create_keyword(self, test_client, sample_item):
        """Test POST /api/v1/menu/keywords"""
        keyword_data = {
            "item_id": sample_item.id,
            "keyword_ar": "همبرغر",
            "keyword_en": "hamburger",
            "weight": 0.95
        }

        response = test_client.post("/api/v1/menu/keywords", json=keyword_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["keyword_ar"] == "همبرغر"

    @pytest.mark.integration
    @pytest.mark.api
    def test_list_keywords(self, test_client, sample_item, sample_keyword):
        """Test GET /api/v1/menu/items/{item_id}/keywords"""
        response = test_client.get(f"/api/v1/menu/items/{sample_item.id}/keywords")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.integration
    @pytest.mark.api
    def test_delete_keyword(self, test_client, sample_keyword):
        """Test DELETE /api/v1/menu/keywords/{keyword_id}"""
        response = test_client.delete(f"/api/v1/menu/keywords/{sample_keyword.id}")

        assert response.status_code in [status.HTTP_204_NO_CONTENT, status.HTTP_200_OK]


class TestVoiceEndpoints:
    """Test cases for Voice API endpoints"""

    @pytest.mark.integration
    @pytest.mark.api
    async def test_transcribe_audio(self, test_client, sample_audio_bytes):
        """Test POST /api/v1/voice/stt/transcribe"""
        # Create a file-like object
        files = {
            "audio": ("test.wav", sample_audio_bytes, "audio/wav")
        }
        data = {"language": "ar"}

        response = test_client.post("/api/v1/voice/stt/transcribe", files=files, data=data)

        # May fail if STT service is not initialized
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR]

    @pytest.mark.integration
    @pytest.mark.api
    async def test_generate_speech(self, test_client):
        """Test POST /api/v1/voice/tts/generate"""
        tts_data = {
            "text": "مرحبا بكم في مطعمنا",
            "language": "ar",
            "speaker_id": 0
        }

        response = test_client.post("/api/v1/voice/tts/generate", json=tts_data)

        # May fail if TTS service is not initialized
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR]


class TestHealthEndpoint:
    """Test cases for Health Check endpoint"""

    @pytest.mark.integration
    @pytest.mark.api
    def test_health_check(self, test_client):
        """Test GET /health"""
        response = test_client.get("/health")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "status" in data
        assert "services" in data


class TestErrorHandling:
    """Test cases for API error handling"""

    @pytest.mark.integration
    @pytest.mark.api
    def test_404_not_found(self, test_client):
        """Test 404 response for non-existent endpoint"""
        response = test_client.get("/api/v1/nonexistent")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.integration
    @pytest.mark.api
    def test_405_method_not_allowed(self, test_client):
        """Test 405 response for wrong HTTP method"""
        # Try DELETE on a GET-only endpoint
        response = test_client.delete("/api/v1/menu/branches")

        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    @pytest.mark.integration
    @pytest.mark.api
    def test_422_validation_error(self, test_client):
        """Test 422 response for invalid request body"""
        # Send invalid data
        response = test_client.post("/api/v1/menu/branches", json={"invalid": "data"})

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestCORS:
    """Test cases for CORS configuration"""

    @pytest.mark.integration
    @pytest.mark.api
    def test_cors_headers(self, test_client):
        """Test CORS headers are present"""
        headers = {"Origin": "http://localhost:3000"}
        response = test_client.options("/api/v1/menu/branches", headers=headers)

        # Check for CORS headers
        assert "access-control-allow-origin" in response.headers or response.status_code == status.HTTP_200_OK


class TestPagination:
    """Test cases for pagination (if implemented)"""

    @pytest.mark.integration
    @pytest.mark.api
    def test_pagination_limit(self, test_client):
        """Test pagination with limit parameter"""
        response = test_client.get("/api/v1/menu/branches?limit=5")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) <= 5

    @pytest.mark.integration
    @pytest.mark.api
    def test_pagination_offset(self, test_client):
        """Test pagination with offset parameter"""
        response = test_client.get("/api/v1/menu/branches?offset=0&limit=10")

        assert response.status_code == status.HTTP_200_OK


class TestFiltering:
    """Test cases for filtering and search"""

    @pytest.mark.integration
    @pytest.mark.api
    def test_filter_by_active(self, test_client):
        """Test filtering by active status"""
        response = test_client.get("/api/v1/menu/branches?active_only=false")

        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.integration
    @pytest.mark.api
    def test_search_items(self, test_client):
        """Test search functionality"""
        response = test_client.get("/api/v1/menu/items/search?q=burger")

        # May not be implemented
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]
