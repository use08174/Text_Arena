document.addEventListener('DOMContentLoaded', () => {
  const params    = new URLSearchParams(window.location.search);
  const userCards = JSON.parse(params.get('userCards') || '[]');
  const aiCards   = JSON.parse(params.get('aiCards')   || '[]');
  const order     = JSON.parse(params.get('order')     || '[]');

  // 1) 내 카드 순서대로 정렬
  const orderedUser = order.map(id => userCards.find(c => String(c.id) === String(id)));

  // 2) DOM 준비
  let userHP = 100, aiHP = 100;
  const aiHpEl   = document.getElementById('aiHpDisplay');
  const userHpEl = document.getElementById('userHpDisplay');
  const enemyRow = document.getElementById('enemyRow');
  const userRow  = document.getElementById('userRow');

  // 3) 카드 렌더링
  function createCardEl(card) {
    const el = document.createElement('div');
    el.className = 'card';
    el.style.backgroundImage = `url('${card.image}')`;
    el.dataset.attack = card.attack_power;
    el.innerHTML = `
      <div class="card-info">
        <h3>${card.name}</h3>
        <p>${card.persona_main}</p>
      </div>
    `;
    return el;
  }

  // 4) ROW 채우기
  enemyRow.innerHTML = '';
  userRow.innerHTML  = '';
  for (let i = 0; i < order.length; i++) {
    enemyRow.appendChild(createCardEl(aiCards[i]));
    userRow.appendChild(createCardEl(orderedUser[i]));
  }

  // 5) 초기 HP 표시
  aiHpEl.textContent   = `HP: ${aiHP}`;
  userHpEl.textContent = `HP: ${userHP}`;

  // 6) 모달 콤포넌트
  const backdrop = document.getElementById('modalBackdrop');
  const modal    = document.getElementById('modal');
  function showModal(text) {
    modal.innerHTML        = text + `<br><button id="nextBtn">다음</button>`;
    backdrop.style.display = 'flex';
    return new Promise(resolve => {
      document.getElementById('nextBtn')
        .addEventListener('click', () => {
          backdrop.style.display = 'none';
          resolve();
        }, { once: true });
    });
  }

  // 7) 열 단위 전투
  async function runBattle() {
    const eCards = Array.from(enemyRow.children);
    const uCards = Array.from(userRow.children);

    for (let i = 0; i < eCards.length; i++) {
      const eEl = eCards[i], uEl = uCards[i];

      // (1) 애니메이션
      eEl.classList.add('attack');
      uEl.classList.add('defend');
      await new Promise(r => setTimeout(r, 700));
      eEl.classList.remove('attack');
      uEl.classList.remove('defend');

      // (2) 데미지 계산
      const aiAtk = Number(eEl.dataset.attack);
      const usAtk = Number(uEl.dataset.attack);
      let resultText;
      if (usAtk >= aiAtk) {
        aiHP = Math.max(0, aiHP - usAtk);
        aiHpEl.textContent = `HP: ${aiHP}`;
        resultText = `라운드 ${i+1} 승리! (–${usAtk} HP)`;
      } else {
        userHP = Math.max(0, userHP - aiAtk);
        userHpEl.textContent = `HP: ${userHP}`;
        resultText = `라운드 ${i+1} 패배... (–${aiAtk} HP)`;
      }

      // (3) 팝업 & 다음 버튼 대기
      await showModal(resultText);
    }

    // 8) 최종 결과 & 랭킹 보기 버튼
    let finalText = userHP > aiHP
      ? '🎉 최종 승리!'
      : userHP < aiHP
        ? '😢 최종 패배...'
        : '🤝 최종 무승부';
    // 랭킹 보기 버튼
    backdrop.style.display = 'flex';
    modal.innerHTML = `
      ${finalText}<br>
      <button id="rankBtn">랭킹 보러 가기</button>
    `;
    document.getElementById('rankBtn').addEventListener('click', () => {
      window.location.href = 'ranking.html';
    });
  }

  // 9) 전투 자동 시작
  setTimeout(runBattle, 500);
});
