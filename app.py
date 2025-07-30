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
1. 먼저 판정 기준(criteria)이 의미하는 바를 자연어적으로 해석하라. 예를 들어, "더 웃긴 사람"이라면 "유머 감각, 농담, 말장난, 예상치 못한 행동" 등을 의미할 수 있다.
2. 캐릭터 설명(personas) 속 문장들과 표현들을 분석하여 위 기준에 부합하는 특징을 찾아내고, 비교하라.
3. 평가할 때 기준에 관련된 단어가 직접 등장하지 않더라도, 관련된 맥락이나 표현을 반드시 추론하라. 
4. 성별과 나이는 고려하지 않고, 그 외 특성으로만 판단하라.

승자는 이름만 제시하고,  
이유는 RPG 전투 묘사 스타일로 자세하고 생생하게 정확히 두 개의 완전한 문장으로 작성하라. 
각 문장은 마침표(.)로 끝나야 하며, 중간에 끊기지 않도록 연결하라.  

출력 형식은 반드시 아래와 같이 단 한 번만 출력하라:

승자: [캐릭터 이름]  
이유: [전투 상황을 묘사한 문장]. [판정 기준에 따라 어떤 특성 때문에 이겼는지 정확히 서술한 문장].

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
