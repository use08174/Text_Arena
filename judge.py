# judge.py
from langchain import LLMChain, PromptTemplate
from config import llm

judge_template = PromptTemplate(
    input_variables=["personas", "criteria"],
    template="""
System: 너는 텍스트 기반 카드 배틀의 중립적인 심판이다.
판정 기준: {criteria}

아래는 전투 로그 형식의 RPG 스타일 판정 예시다.

승자: 불의 마법사 엘리아  
이유: 엘리아는 "플레어 오브 둠!"으로 적진을 불태웠다. 이어진 "인페르노 스톰!"이 전장을 집어삼키며 적을 전멸시켰다!


승자: 그림자 암살자 네로  
이유: 네로는 "섀도우 스텝"으로 적의 뒤를 잡고 "사일런트 스트라이크!"로 연속 타격. 적장은 "섀도우 포인트!"에 당해 즉사했다!


승자: 성기사 아리아  
이유: 아리아는 "디바인 실드"로 아군을 보호하고, "라이트 저지먼트!"로 적 진형을 붕괴시켰다. 빛의 창으로 마무리 일격!

위 예시들을 참고하여, 다음 캐릭터 설명을 보고 판정 기준에 따라 가장 우수한 캐릭터(승자)를 선택하라.  
승자는 이름만 제시하고,  
이유는 RPG 전투 묘사 스타일로 한두문장 이내로 자세하고 생생하게 서술하라.

[출력 형식]
승자: OOO
이유: ...

{personas}

AI:
"""
)

judge_chain = LLMChain(llm=llm, prompt=judge_template)

def decide_winner(characters: list, judge_criteria: str = "공정하고 객관적인 기준") -> str:
    personas_str = "\n".join([f"{c['name']}: {c['desc']}" for c in characters])
    return judge_chain.run({
        "personas": personas_str,
        "criteria": judge_criteria
    })
