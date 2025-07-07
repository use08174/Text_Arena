# 기능 만들기
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from generate_cards import generate_cards_from_prompt,generate_ai_cards

app = FastAPI()

# CORS 설정 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 요청 바디 정의
class PromptRequest(BaseModel):
    prompt: str

# 주요 기능 1. 프롬프트 기반 카드 생성
@app.post("/generate-cards")
async def generate_cards(req: PromptRequest):
    cards = generate_cards_from_prompt(req.prompt)
    return {"cards": cards}

# 적 카드 랜덤 생성 
@app.get("/generate-ai-cards")
async def generate_ai():
    cards = generate_ai_cards()
    return {"cards": cards}