import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY") 
)

# 사용자 프롬프트 기반으로 카드 5개를 생성하는 함수 
def generate_cards_from_prompt(prompt: str) -> list:

    system_prompt = (
    "너는 페르소나 카드 배틀 게임을 위한 AI 카드 생성기야. "
    "사용자가 자신의 성격, 전략, 스타일 등을 설명하는 문장을 입력하면, "
    "그에 맞는 전투 능력을 나타내는 키워드 5개를 만들어줘. "
    "각 키워드는 한국어로 된 간결한 명사 또는 짧은 구(2~4자)여야 하며, "
    "직관적이고 흥미로운 이름을 붙여줘. "
    "출력은 설명 없이 아래 예시와 같이 무조건 JSON 배열 형태로만 해줘:\n"
    "[\"논리적 설득\", \"빠른 말하기\", \"냉정한 판단\", \"해법 찾기\", \"위로 부족\"]"
)

    # GPT-4o-mini 호출
    response = client.chat.completions.create(
        model="gpt-4o-mini",  
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7
    )

    # 응답 텍스트에서 리스트 추출
    raw_output = response.choices[0].message.content.strip()

    # 문자열을 파이썬 리스트로 안전하게 변환
    try:
        cards = eval(raw_output)
        if isinstance(cards, list) and all(isinstance(c, str) for c in cards):
            return cards
    except:
        pass

    # fallback: 예시 카드
    return ["논리적 설득", "빠른 말하기", "냉정한 판단", "해법 찾기", "위로 부족"]

# AI 적 캐릭터용으로 무작위 카드 5개를 생성하는 함수 
def generate_ai_cards() -> list:
    system_prompt = (
        "너는 페르소나 카드 배틀 게임의 AI 적 생성기야. "
        "무작위이지만 전투 특성이 드러나는 키워드 5개를 생성해줘. "
        "각 키워드는 한국어로 된 명사형 단어여야 하고, 배열로 출력해줘. "
        "설명 없이 아래와 같은 형식으로 출력해줘:\n"
        "[\"기습 공격\", \"잠복\", \"관찰력\", \"사냥 본능\", \"집중력\"]"
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "AI 캐릭터를 생성해줘"}
        ],
        temperature=0.9
    )

    try:
        cards = eval(response.choices[0].message.content.strip())
        if isinstance(cards, list) and all(isinstance(c, str) for c in cards):
            return cards
    except:
        pass

    return ["공격성", "방어력", "속도", "지능", "카리스마"]
