from langchain.chat_models import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
import json

# JSON 파일에서 캐릭터 정보 읽기
def load_characters(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

# 캐릭터 에이전트 생성 함수
def create_character_agent(character_info):
    system_message = (
        f"당신은 캐릭터 '{character_info['name']}'입니다.\n"
        f"한 문장 소개: {character_info['persona_main']}\n"
        f"성격 및 페르소나: {character_info['persona_detail']}\n"
        f"성별: {character_info['gender']}\n"
        f"나이: {character_info['age']}\n"
        f"약점: {character_info['weakness']}\n"
        f"공격력: {character_info['attack_power']}\n"
    )
    llm = ChatOpenAI(temperature=0.7, model="gpt-4")

    agent = initialize_agent(
        tools=[],  # 도구 없이 GPT만 사용
        llm=llm,
        agent=AgentType.OPENAI_FUNCTIONS,
        verbose=True,
        agent_kwargs={"system_message": system_message},
    )
    return agent

# 모든 캐릭터 에이전트 생성
def create_all_agents(characters):
    agents = {}
    for c in characters:
        agents[c['name']] = create_character_agent(c)
    return agents
