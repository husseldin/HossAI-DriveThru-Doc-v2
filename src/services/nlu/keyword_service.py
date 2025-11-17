"""
Keyword Matching Service
Implements keyword-based menu item matching with fuzzy matching
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from difflib import SequenceMatcher

from src.database import models as db_models
from src.models.nlu import KeywordMatch
from src.utils import logger


class KeywordMatchingService:
    """
    Keyword Matching Service

    Provides:
    - Exact keyword matching
    - Fuzzy matching for mispronunciations (> 85% target)
    - Synonym support
    - Bilingual matching (Arabic/English)
    """

    def __init__(self):
        self.fuzzy_threshold = 0.85  # 85% similarity threshold

    def match_keywords(
        self,
        text: str,
        language: str,
        branch_id: int,
        db: Session,
        limit: int = 5
    ) -> List[KeywordMatch]:
        """
        Match keywords in text to menu items

        Args:
            text: Text to search for keywords
            language: Language code (ar/en)
            branch_id: Branch ID for context
            db: Database session
            limit: Maximum number of matches

        Returns:
            List of keyword matches sorted by confidence
        """
        matches = []
        text_lower = text.lower()
        words = text_lower.split()

        # Get all keywords for branch
        keywords = db.query(db_models.Keyword).filter(
            db_models.Keyword.branch_id == branch_id
        ).all()

        for keyword_obj in keywords:
            # Get keyword based on language
            keyword = keyword_obj.keyword_ar if language == "ar" else keyword_obj.keyword_en

            if not keyword:
                continue

            keyword_lower = keyword.lower()

            # Exact match
            if keyword_lower in text_lower:
                # Get item details
                item = db.query(db_models.Item).filter(
                    db_models.Item.id == keyword_obj.item_id
                ).first()

                if item:
                    matches.append(KeywordMatch(
                        keyword=keyword,
                        matched_text=keyword,
                        item_id=item.id,
                        item_name_ar=item.name_ar,
                        item_name_en=item.name_en,
                        confidence=1.0 * keyword_obj.weight,
                        match_type="exact"
                    ))
                    continue

            # Fuzzy match check
            for word in words:
                similarity = self._calculate_similarity(keyword_lower, word)
                if similarity >= self.fuzzy_threshold:
                    item = db.query(db_models.Item).filter(
                        db_models.Item.id == keyword_obj.item_id
                    ).first()

                    if item:
                        matches.append(KeywordMatch(
                            keyword=keyword,
                            matched_text=word,
                            item_id=item.id,
                            item_name_ar=item.name_ar,
                            item_name_en=item.name_en,
                            confidence=similarity * keyword_obj.weight,
                            match_type="fuzzy"
                        ))

        # Sort by confidence and limit
        matches.sort(key=lambda x: x.confidence, reverse=True)
        unique_matches = self._deduplicate_matches(matches)

        logger.debug(
            "Keyword matching completed",
            text=text[:50],
            matches_found=len(unique_matches)
        )

        return unique_matches[:limit]

    def _calculate_similarity(self, str1: str, str2: str) -> float:
        """
        Calculate similarity between two strings using SequenceMatcher

        Args:
            str1: First string
            str2: Second string

        Returns:
            Similarity score (0.0 to 1.0)
        """
        return SequenceMatcher(None, str1, str2).ratio()

    def _deduplicate_matches(self, matches: List[KeywordMatch]) -> List[KeywordMatch]:
        """
        Remove duplicate matches for same item

        Args:
            matches: List of keyword matches

        Returns:
            Deduplicated list keeping highest confidence per item
        """
        seen_items = {}

        for match in matches:
            if match.item_id not in seen_items:
                seen_items[match.item_id] = match
            elif match.confidence > seen_items[match.item_id].confidence:
                seen_items[match.item_id] = match

        return list(seen_items.values())

    def add_keyword(
        self,
        db: Session,
        branch_id: int,
        item_id: int,
        keyword_ar: Optional[str] = None,
        keyword_en: Optional[str] = None,
        weight: float = 1.0
    ) -> db_models.Keyword:
        """
        Add keyword for item

        Args:
            db: Database session
            branch_id: Branch ID
            item_id: Item ID
            keyword_ar: Arabic keyword
            keyword_en: English keyword
            weight: Keyword weight

        Returns:
            Created keyword object
        """
        keyword = db_models.Keyword(
            branch_id=branch_id,
            item_id=item_id,
            keyword_ar=keyword_ar,
            keyword_en=keyword_en,
            weight=weight
        )

        db.add(keyword)
        db.commit()
        db.refresh(keyword)

        logger.info(
            "Keyword added",
            item_id=item_id,
            keyword_ar=keyword_ar,
            keyword_en=keyword_en
        )

        return keyword


# Global keyword matching service
keyword_service = KeywordMatchingService()
