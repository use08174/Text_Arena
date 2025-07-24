# app.py
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware


from judge import decide_winner

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
    personas = []
    for c in req.characters:
        personas.append({
            "name": c.name,
            "desc": f"{c.persona_main}. {c.persona_detail} "
                    f"({c.gender}, {c.age}세, 약점: {c.weakness}, 공격력: {c.attack_power})"
        })
    try:
        verdict = decide_winner(personas, judge_criteria=req.criteria)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"심판 실행 오류: {e}")
    return BattleResponse(result=verdict)
