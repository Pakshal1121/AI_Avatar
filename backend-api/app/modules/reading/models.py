from __future__ import annotations

from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


QuestionType = Literal[
    "multiple_choice",
    "true_false_not_given",
    "matching_headings",
    "short_answer",
]


class PassageIn(BaseModel):
    passageId: str = Field(..., description="1,2,3")
    text: str


class GenerateQuestionsRequest(BaseModel):
    userId: str
    passages: list[PassageIn]


class Question(BaseModel):
    id: str
    type: QuestionType
    prompt: str
    options: list[str] | None = None
    correctAnswer: Any
    rationale: str | None = None


class PassageQuestions(BaseModel):
    passageId: str
    questions: list[Question]


class GenerateQuestionsResponse(BaseModel):
    attemptId: str
    userId: str
    passages: list[PassageQuestions]


class SubmitAnswersRequest(BaseModel):
    userId: str
    attemptId: str
    answers: dict[str, Any] = Field(
        ..., description="Map questionId -> userAnswer (A/B/C/D, T/F/NG, text, etc.)"
    )
    meta: dict[str, Any] | None = None


class WrongAnswer(BaseModel):
    questionId: str
    passageId: str
    prompt: str
    correctAnswer: Any
    userAnswer: Any
    type: QuestionType


class ScoreLog(BaseModel):
    attemptId: str
    userId: str
    createdAt: str
    overall_score: float
    passage_1_score: float
    passage_2_score: float
    passage_3_score: float
    total_questions: int
    correct_questions: int
    wrong_answer: list[WrongAnswer]
    meta: dict[str, Any] | None = None


class FeedbackRequest(BaseModel):
    userId: str
    attemptId: str


class FeedbackResponse(BaseModel):
    attemptId: str
    userId: str
    feedback: dict[str, Any]
