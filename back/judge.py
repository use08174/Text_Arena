# judge.py
from langchain import LLMChain, PromptTemplate
from config import llm

judge_template = PromptTemplate(
    input_variables=["personas", "criteria"],
    template="""
System: 당신은 공정한 심판입니다.
판정 기준: {criteria}
다음 캐릭터 설명을 보고, 위 기준에 따라 가장 우수한 캐릭터(승자)를 선정하고 그 이유를 설명하세요.
{personas}
AI:"""
)

judge_chain = LLMChain(llm=llm, prompt=judge_template)

def decide_winner(characters: list, judge_criteria: str = "공정하고 객관적인 기준") -> str:
    personas_str = "\n".join([f"{c['name']}: {c['desc']}" for c in characters])
    return judge_chain.run({
        "personas": personas_str,
        "criteria": judge_criteria
    })
