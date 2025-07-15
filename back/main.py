# main.py
from personas import characters
from judge import decide_winner

if __name__ == "__main__":
    print("다중 페르소나 승자 결정 시뮬레이션")
    criteria = input("판정 기준을 입력하세요: ") or "공정하고 객관적인 기준"
    result = decide_winner(characters, judge_criteria=criteria)
    print("\n--- 결과 ---")
    print(result)
