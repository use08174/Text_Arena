# 기능 만들기
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from generate_cards import generate_cards_from_prompt

app = FastAPI()

# CORS 설정 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 요청 바디 정의
class PromptRequest(BaseModel):
    prompt: str

@app.post("/generate-cards")
async def generate_cards(req: PromptRequest):
    cards = generate_cards_from_prompt(req.prompt)
    return {"cards": cards}
