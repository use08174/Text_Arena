// front/js/fight.js
document.addEventListener('DOMContentLoaded', () => {
  const params       = new URLSearchParams(window.location.search);
  const userCards    = JSON.parse(params.get('userCards') || '[]');
  const aiCards      = JSON.parse(params.get('aiCards')   || '[]');
  const order        = JSON.parse(params.get('order')     || '[]');
  const judgePrompt  = decodeURIComponent(params.get('judgePrompt') || '');

  // 1) 내 카드 순서대로 정렬
  const orderedUser = order.map(id =>
    userCards.find(c => String(c.id) === String(id))
  );

  // 2) DOM 준비
  let userHP = 100, aiHP = 100;
  const aiHpEl    = document.getElementById('aiHpDisplay');
  const userHpEl  = document.getElementById('userHpDisplay');
  const enemyRow  = document.getElementById('enemyRow');
  const userRow   = document.getElementById('userRow');
  const backdrop  = document.getElementById('modalBackdrop');
  const modal     = document.getElementById('modal');
  const loading   = document.getElementById('loadingBackdrop'); // 로딩 오버레이

  // 3) 카드 렌더링 함수
  function createCardEl(card) {
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.attack = card.attack_power;
  el.innerHTML = `
    <div class="card-thumbnail"
         style="background-image: url('${card.image}')">
    </div>
    <div class="card-name-box">${card.name}</div>
    <div class="card-desc-box">${card.persona_main}</div>
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

  // 6) 모달 표시 함수
  function showModal(text) {
    modal.innerHTML        = text + `<br><button id="nextBtn">다음</button>`;
    backdrop.style.display = 'flex';
    return new Promise(resolve => {
      document.getElementById('nextBtn').addEventListener('click', () => {
        backdrop.style.display = 'none';
        resolve();
      }, { once: true });
    });
  }

  // 7) 열 단위 전투 (GPT API 연동)
  async function runBattle() {
    for (let i = 0; i < order.length; i++) {
      const userCard = orderedUser[i];
      const aiCard   = aiCards[i];
      const eEl      = enemyRow.children[i];
      const uEl      = userRow.children[i];

      // (1) 애니메이션
      eEl.classList.add('attack');
      uEl.classList.add('defend');
      await new Promise(r => setTimeout(r, 700));
      eEl.classList.remove('attack');
      uEl.classList.remove('defend');

      // (2) 로딩 오버레이 표시
      loading.style.display = 'flex';

      // (3) GPT 판단 요청
      let winnerText = '';
      try {
        const res = await fetch('/api/battle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characters: [userCard, aiCard],
            criteria: judgePrompt || "공정하고 객관적인 기준"
          })
        });
        const data = await res.json();
        winnerText = data.result;
      } catch (err) {
        console.error('GPT 판단 실패:', err);
        winnerText = `승자: 알 수 없음\n이유: 네트워크 오류`;
      }

      // (4) 로딩 오버레이 숨기기
      loading.style.display = 'none';

      // (5) 응답 파싱 및 HP 갱신
      const winMatch    = winnerText.match(/승자:\s*(.+)/);
      const reasonMatch = winnerText.match(/이유:\s*([\s\S]+)/);
      const winnerName  = winMatch    ? winMatch[1].trim()    : null;
      const reason      = reasonMatch ? reasonMatch[1].trim() : '';
      let damage = 0;

      if (winnerName === userCard.name) {
        damage  = userCard.attack_power;
        aiHP    = Math.max(0, aiHP - damage);
        aiHpEl.textContent = `HP: ${aiHP}`;
      } else if (winnerName === aiCard.name) {
        damage   = aiCard.attack_power;
        userHP   = Math.max(0, userHP - damage);
        userHpEl.textContent = `HP: ${userHP}`;
      }

      // (6) 팝업 표시
      const popupText = 
        `승자: ${winnerName || "없음"}<br>` +
        `이유: ${reason}<br>` +
        `– 데미지: ${damage} HP`;
      await showModal(popupText);
    }

    // 8) 최종 결과 & 랭킹 보기 버튼
    let finalText = userHP > aiHP
      ? '최종 승리!'
      : userHP < aiHP
        ? '최종 패배...'
        : '무승부';
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
