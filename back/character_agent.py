from langchain.chat_models import ChatOpenAI
from langchain.agents import initialize_agent, AgentType

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
    return {
        "name": character_info['name'],
        "agent": agent,
        "desc": system_message  # 판정용 설명으로 재사용
    }

def create_all_agents(characters):
    agents = []
    for c in characters:
        agents.append(create_character_agent(c))
    return agents
