import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY") 
)

def generate_cards_from_prompt(prompt: str) -> list:

    system_prompt = (
    "너는 페르소나 카드 배틀 게임을 위한 AI 카드 생성기야. "
    "사용자가 자신의 성격, 전략, 스타일 등을 설명하는 문장을 입력하면(100자 이내), "
    "그에 맞는 전투 능력을 요약한 5개의 키워드를 뽑아줘. "
    "각 키워드는 전투 스타일이나 심리적 특성을 나타내는 명사형 단어여야 하고, 한국어여야 해. "
    "출력은 설명 없이 아래 예시와 같이 JSON 배열 형태로만 해줘:\n"
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
