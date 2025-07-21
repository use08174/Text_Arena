// front/js/fight.js
document.addEventListener('DOMContentLoaded', async () => {
  // 파라미터 파싱
  const params    = new URLSearchParams(window.location.search);
  const userCards = JSON.parse(params.get('userCards') || '[]');  // [{id,name,persona_main,attack_power,image},…]
  const aiCards   = JSON.parse(params.get('aiCards')   || '[]');  // [{…},…]
  const order     = JSON.parse(params.get('order')     || '[]');  // ['3','1','7',…]
  
  // 초기 HP
  let userHP = 100, aiHP = 100;
  const userHPEl = document.getElementById('userHP');
  const aiHPEl   = document.getElementById('aiHP');
  
  const battleField = document.getElementById('battleField');

  // 카드 DOM 생성 함수
  function createFightCard(card, cls) {
    const el = document.createElement('div');
    el.className = `fight-card ${cls}`;
    el.style.backgroundImage = `url('${card.image}')`;
    el.innerHTML = `
      <div class="card-info">
        <strong>${card.name}</strong><br/>
        <small>${card.persona_main}</small>
      </div>`;
    return el;
  }

  // 한 스텝씩 처리
  async function battleStep(userCard, aiCard) {
    return new Promise(resolve => {
      // 1) 카드 등장
      const userEl = createFightCard(userCard, 'user');
      const aiEl   = createFightCard(aiCard,   'ai');

      battleField.innerHTML = '';
      battleField.appendChild(aiEl);
      battleField.appendChild(userEl);

      // 잠시 대기 후 등장 애니메이션 클래스 부여
      setTimeout(() => {
        aiEl.classList.add('show');
        userEl.classList.add('show');
      }, 100);

      // 다시 잠시 대기 후 승패 계산
      setTimeout(() => {
        let damage;
        if (userCard.attack_power > aiCard.attack_power) {
          damage = userCard.attack_power;
          aiHP = Math.max(0, aiHP - damage);
          aiHPEl.textContent = `HP: ${aiHP}`;
        } else if (userCard.attack_power < aiCard.attack_power) {
          damage = aiCard.attack_power;
          userHP = Math.max(0, userHP - damage);
          userHPEl.textContent = `HP: ${userHP}`;
        }
        // 잠깐 피해 표시(여기선 생략)
        
        // 다음 스텝으로
        setTimeout(resolve, 800);
      }, 1000);
    });
  }

  // 전체 전투 실행
  for (let i = 0; i < order.length; i++) {
    const userId = order[i];
    const userCard = userCards.find(c => c.id === userId);
    const aiCard   = aiCards[i];
    await battleStep(userCard, aiCard);
  }

  // 최종 승패 토스트
  const final = userHP > aiHP
    ? '🎉 최종 승리: 사용자'
    : userHP < aiHP
      ? '😢 최종 승리: AI'
      : '🤝 최종 무승부';
  alert(final);
});
