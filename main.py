# main.py
import json
from character_agent import create_all_agents
from judge import decide_winner

def load_characters(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

if __name__ == "__main__":
    print("다중 페르소나 승자 결정 시뮬레이션")
    criteria = input("판정 기준을 입력하세요: ") or "공정하고 객관적인 기준"

    characters_json = load_characters("characters_updated.json")  # JSON 파일 경로 지정

    characters = create_all_agents(characters_json)

    result = decide_winner(characters, judge_criteria=criteria)

    print("\n--- 결과 ---")
    print(result)
