"""
NLU API routes
Implements Phase 3 NLU endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.nlu import NLURequest, NLUResponse, KeywordMatch
from src.services.nlu import nlu_service, keyword_service
from src.utils import logger

router = APIRouter(prefix="/api/v1/nlu", tags=["nlu"])


@router.post("/process", response_model=NLUResponse)
async def process_text(request: NLURequest, db: Session = Depends(get_db)):
    """
    Process text for NLU (intent classification + slot extraction)

    Args:
        request: NLU request with text and context
        db: Database session

    Returns:
        NLU response with intent, slots, and entities
    """
    try:
        # Process with NLU service
        response = await nlu_service.process(request)

        # If branch_id provided, match keywords
        if request.branch_id:
            keyword_matches = keyword_service.match_keywords(
                text=request.text,
                language=request.language,
                branch_id=request.branch_id,
                db=db,
                limit=5
            )
            response.matched_keywords = [
                f"{match.item_name_en} ({match.confidence:.2f})"
                for match in keyword_matches
            ]

        logger.info(
            "NLU processed",
            intent=response.intent.intent_type.value,
            confidence=response.intent.confidence,
            slots_count=len(response.slots)
        )

        return response

    except Exception as e:
        logger.error("NLU processing failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/keywords/match", response_model=List[KeywordMatch])
async def match_keywords(
    text: str,
    language: str,
    branch_id: int,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """
    Match keywords in text to menu items

    Args:
        text: Text to search for keywords
        language: Language code (ar/en)
        branch_id: Branch ID
        limit: Maximum matches to return
        db: Database session

    Returns:
        List of keyword matches
    """
    try:
        matches = keyword_service.match_keywords(
            text=text,
            language=language,
            branch_id=branch_id,
            db=db,
            limit=limit
        )

        logger.info(
            "Keywords matched",
            text=text[:50],
            matches_found=len(matches)
        )

        return matches

    except Exception as e:
        logger.error("Keyword matching failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def nlu_health_check():
    """
    Check NLU service health

    Returns:
        Service status
    """
    return {
        "service": "nlu",
        "status": nlu_service.status.value,
        "model_loaded": nlu_service.model is not None,
        "fallback_available": True
    }
