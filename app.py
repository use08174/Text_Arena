from langchain import LLMChain, PromptTemplate
from config import llm
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

# --------- judge.py ---------
judge_template = PromptTemplate(
    input_variables=["personas", "criteria"],
    template=""" 
System: 너는 텍스트 기반 카드 배틀의 중립적인 심판이다.
판정 기준: {criteria}

다음 캐릭터 설명을 보고 판정 기준에 따라 가장 우수한 캐릭터(승자)를 선택하라.  
승자는 이름만 제시하고,  
이유는 RPG 전투 묘사 스타일로 무조건 위의 이유 예시들의 형식을 사용해서 50자 이내로 자세하고 생생하게 서술하라.

{personas}

AI: 
기준에 맞춰 전투를 묘사하고, 승자를 선택하라. 
전투에서 성별이 중요한 판단 기준이라면, 성별에 따라 승패가 결정되도록 하여 전투를 묘사하라.
"""
)

judge_chain = LLMChain(llm=llm, prompt=judge_template)

def decide_winner(characters: list, judge_criteria: str = "공정하고 객관적인 기준") -> str:
    personas_str = "\n".join([f"{c['name']}: {c['desc']}" for c in characters])
    
    return judge_chain.run({
        "personas": personas_str,
        "criteria": judge_criteria
    })

# --------- FastAPI 설정 ---------
app = FastAPI(title="Multi-Persona Battle API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CharacterInfo(BaseModel):
    name: str
    persona_main: str
    persona_detail: str
    gender: str
    age: int
    weakness: str
    attack_power: int = Field(..., alias="attack_power")

class BattleRequest(BaseModel):
    characters: List[CharacterInfo]
    criteria: Optional[str] = "공정하고 객관적인 기준"

class BattleResponse(BaseModel):
    result: str

@app.post("/api/battle", response_model=BattleResponse)
async def battle(req: BattleRequest):
    try:
        characters = req.characters

        personas = [
            {"name": character.name, "desc": f"{character.persona_main}, 나이: {character.age}, 성별: {character.gender}, 공격력: {character.attack_power}, 약점: {character.weakness}"}
            for character in characters
        ]

        verdict = decide_winner(
            characters=personas,
            judge_criteria=req.criteria 
        )

        return BattleResponse(result=verdict)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"전투 처리 중 오류: {e}")
