// front/js/order.js
document.addEventListener('DOMContentLoaded', async () => {
  // 1) URL에서 userCards 파싱
  const params    = new URLSearchParams(window.location.search);
  const userCards = JSON.parse(params.get('userCards') || '[]');  // [{id,name,persona_main,image,…},…]

  // 2) 전체 캐릭터 데이터 불러오기
  let allCards = [];
  try {
    const res = await fetch('characters_updated.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allCards = await res.json();
  } catch (err) {
    console.error('characters_updated.json 로딩 실패:', err);
    return;
  }

  // 3) AI 덱 구성: userCards 제외한 풀에서 무작위 5장
  const pickedIds = new Set(userCards.map(c => c.id));
  const pool = allCards.filter(c => !pickedIds.has(c.id));
  // Fisher–Yates 셔플
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const aiCards = pool.slice(0, 5);

  // 4) 클릭 순서를 저장할 배열
  const order = [];

  // 5) 렌더링 함수
  function renderDeck(containerId, cards) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // 초기화
    cards.forEach(c => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.dataset.id = c.id;
      cardEl.style.backgroundImage = `url('${c.image}')`;
      cardEl.innerHTML = `
        <div class="card-info">
          <h3 class="card-name">${c.name}</h3>
          <p class="card-main">${c.persona_main}</p>
        </div>
      `;
      container.appendChild(cardEl);
    });
  }

  // 6) 초기 렌더: AI / 내 카드
  renderDeck('aiCards', aiCards);
  renderDeck('myCards', userCards);

  // 7) 배지 렌더링
  function renderOrderBadges() {
    document.querySelectorAll('#myCards .card .order-badge').forEach(el => el.remove());
    order.forEach((id, idx) => {
      const cardEl = document.querySelector(`#myCards .card[data-id="${id}"]`);
      if (!cardEl) return;
      const badge = document.createElement('span');
      badge.className = 'order-badge';
      badge.textContent = idx + 1;
      cardEl.appendChild(badge);
    });
  }

  // 8) 준비 완료 체크
  const judgeInput = document.getElementById('judgeInput');
  const toBattle   = document.getElementById('toBattle');
  function checkReady() {
    toBattle.disabled = !(order.length === 5 && judgeInput.value.trim().length > 0);
  }
  judgeInput.addEventListener('input', checkReady);

  // 9) 내 카드 클릭: 순서 추가/제거
  const myEl = document.getElementById('myCards');
  myEl.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const id = card.dataset.id;
    const idx = order.indexOf(id);
    if (idx !== -1) {
      // 이미 선택된 카드 → 제거
      order.splice(idx, 1);
      card.classList.remove('selected');
    } else if (order.length < 5) {
      // 새 선택
      order.push(id);
      card.classList.add('selected');
    }
    renderOrderBadges();
    checkReady();
  });

  // 10) 전투장으로 가기
  toBattle.addEventListener('click', () => {
    const q = new URLSearchParams();
    q.set('userCards',   JSON.stringify(userCards));
    q.set('aiCards',     JSON.stringify(aiCards));
    q.set('order',       JSON.stringify(order));
    q.set('judgePrompt', encodeURIComponent(judgeInput.value.trim()));
    window.location.href = `battle.html?${q.toString()}`;
  });
});
