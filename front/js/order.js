// js/order.js

// 1. URL에서 userCards 파싱
const params    = new URLSearchParams(window.location.search);
const userCards = JSON.parse(params.get('userCards') || '[]');

// 2. 하드코딩 AI 카드 5장 (order 단계에 필요시)
const aiCards = Array.from({ length: 5 }, (_, i) => ({
  id:   `ai${i+1}`,
  name: `AI 카드 ${i+1}`
}));

// 3. 클릭 순서를 저장할 배열
const order = [];

// 4. 렌더링 함수
function renderOrder() {
  // 4-1. AI 카드 렌더 (order.html에만 필요한 경우)
  const aiEl = document.getElementById('aiCards');
  aiCards.forEach(c => {
    const d = document.createElement('div');
    d.className   = 'card';
    d.textContent = c.name;
    aiEl.appendChild(d);
  });

  // 4-2. 내 카드 렌더
  const myEl = document.getElementById('myCards');
  userCards.forEach(c => {
    const d = document.createElement('div');
    d.className    = 'card';
    d.dataset.id   = c.id;
    d.dataset.name = c.name;  // 원래 이름 보관
    d.textContent  = c.name;
    myEl.appendChild(d);
  });
}

// 5. 순번 배지 업데이트 함수
function renderOrderBadges() {
  const cards = document.querySelectorAll('#myCards .card');
  cards.forEach(cardEl => {
    // 기존 badge 제거
    const old = cardEl.querySelector('.order-badge');
    if (old) old.remove();
  });
  // 새로 배지 붙이기
  order.forEach((id, idx) => {
    const cardEl = document.querySelector(`#myCards .card[data-id="${id}"]`);
    if (!cardEl) return;
    const badge = document.createElement('span');
    badge.className = 'order-badge';
    badge.textContent = idx + 1;
    cardEl.appendChild(badge);
  });
}

// 6. 준비 완료 체크 함수
const judgeInput = document.getElementById('judgeInput');
const toBattle   = document.getElementById('toBattle');

function checkReady() {
  toBattle.disabled = !(order.length === 5 && judgeInput.value.trim().length > 0);
}

// 7. 내 카드 클릭 이벤트: 순서 추가/제거 및 배지 업데이트
const myEl = document.getElementById('myCards');
myEl.addEventListener('click', e => {
  const card = e.target.closest('.card');
  if (!card) return;

  const id = card.dataset.id;
  const idx = order.indexOf(id);

  if (idx !== -1) {
    // 이미 선택된 카드면 순서 취소
    order.splice(idx, 1);
    card.classList.remove('selected');
  } else if (order.length < 5) {
    // 새로운 선택
    order.push(id);
    card.classList.add('selected');
  }

  // 선택된 카드가 순서에 맞춰 배지로 표시
  renderOrderBadges();
  checkReady();
});

// 8. 프롬프트 입력 체크
judgeInput.addEventListener('input', checkReady);

// 9. 전투장으로 가기 버튼 클릭 시
toBattle.addEventListener('click', () => {
  const q = new URLSearchParams();
  q.set('userCards',   JSON.stringify(userCards));
  q.set('aiCards',     JSON.stringify(aiCards));
  q.set('order',       JSON.stringify(order));
  q.set('judgePrompt', encodeURIComponent(judgeInput.value.trim()));

  window.location.href = `battle.html?${q.toString()}`;
});

// 10. 초기 렌더 호출
renderOrder();
