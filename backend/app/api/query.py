from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

from app.services.query_service import execute_query
from app.services.query_llm_service import extract_query_intent


router = APIRouter(
    prefix="/query",
    tags=["Queries"],
)


class QueryRequest(BaseModel):
    text: str


@router.post("")
def process_query(
    query: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    parsed_query = extract_query_intent(query.text)

    result = execute_query(
        db=db,
        user_id=current_user.id,
        intent=parsed_query["intent"],
        customer_name=parsed_query["customer_name"],
    )

    return {
        "question": query.text,
        "parsed_query": parsed_query,
        "result": result,
    }