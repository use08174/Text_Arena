# personas.py

def create_persona(name: str, desc: str) -> dict:
    return {"name": name, "desc": desc}

# 예시 캐릭터 목록
characters = [
    create_persona("전사", "힘이 강하고 근접 전투에 능숙함."),
    create_persona("마법사", "지혜롭고 강력한 마법을 사용함."),
    create_persona("궁수", "민첩하며 원거리 공격을 선호함.")
]
