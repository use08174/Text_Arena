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
판정 시 반드시 판정 기준(criteria)과 캐릭터 설명(personas)을 모두 참고하라.  
캐릭터의 모든 특징을 판단에 연결하며, 기준이 애매할 경우 언어적 암시를 활용해 적절히 해석하고 자연스럽게 이유에 반영하라.  
성별과 나이는 판단에 포함하지 않고, 그 외 모든 특징을 중심으로 평가한다.

출력 형식:  
- 승자는 이름만 정확히 제시한다.  
- 이유는 RPG 전투 묘사 스타일로 작성하며, 반드시 주어와 서술어를 갖춘 **두 개의 완전한 문장**으로 구성하라.  
- 첫 문장은 전투 상황을 묘사하며, 두 번째 문장은 판정 기준에 따른 승리 이유를 명확히 설명한다.  
- 문장은 마침표(.)로 끝나야 하며, 절대 중간에 끊기거나 세 문장 이상 작성하지 말라.

[예시 출력]  
승자: 토토로  
이유: 토토로는 거대한 몸집으로 땅을 울리며 상대를 압박하고, 회오리 바람으로 전장을 휘몰아쳤다.  
판정 기준인 자연 친화력과 위압감 측면에서, 상대보다 훨씬 더 환경을 활용한 전략을 보여주었기 때문이다.

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
