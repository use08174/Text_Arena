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
System:
너는 텍스트 기반 카드 배틀의 심판이다.  
주어진 판정 기준에 따라 두 캐릭터 중 더 우수한 캐릭터를 판정하라.

판정 기준: {criteria}

캐릭터 설명: {personas}

AI:
위의 판정 기준(criteria)와 캐릭터 설명(personas)을 반드시 참고하여 두 캐릭터 중 승자를 결정하라.
사용자가 제시한 판정 기준과 캐릭터 설명에 등장하는 모든 특징들을 반드시 연결하여 판단하라.
판정 기준이 애매하거나 캐릭터 설명과 직접 연결되지 않을 경우, AI가 언어적 암시를 활용해 적절히 해석하고 그 결과를 이유 문장에 자연스럽게 녹여내야 한다.
단, 성별과 나이는 판단에 반영하지 말고, 그 외 특징들을 중심으로 평가하라.

[출력 형식]
승자: [캐릭터 이름]  
이유: [전투 상황을 묘사한 문장]. [판정 기준에 따른 승리 이유를 설명하는 문장].

출력 형식은 반드시 위와 같아야 하며,
승자는 이름만 제시하고, 이유는 RPG 전투 묘사 스타일로 자세하고 생생하게 정확히 두 개의 완전한 문장으로 작성하라. 
첫 문장은 전투현장을 설명하고 다음 문장은 판정기준에 따라서 승패 이유를 명확하게 설명하라.
각 문장은 마침표(.)로 끝나야 하며, 중간에 끊기지 않도록 연결하라.  



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
            {"name": character.name, "desc": f"{character.persona_main}, {character.persona_detail}, 나이: {character.age}, 성별: {character.gender}, 공격력: {character.attack_power}, 약점: {character.weakness}"}
            for character in characters
        ]

        verdict = decide_winner(
            characters=personas,
            judge_criteria=req.criteria 
        )

        return BattleResponse(result=verdict)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"전투 처리 중 오류: {e}")
