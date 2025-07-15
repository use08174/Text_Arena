// URL 파라미터 파싱
const params      = new URLSearchParams(window.location.search);
const userCards   = JSON.parse(params.get('userCards')   || '[]');
const aiCards     = JSON.parse(params.get('aiCards')     || '[]');
const order       = JSON.parse(params.get('order')       || '[]');
const judgePrompt = decodeURIComponent(params.get('judgePrompt') || '');

// 초기 HP
let userHP = 100, aiHP = 100;
const resultsEl = document.getElementById('matchResults');

// 1:1 대결 시뮬레이션 (간단 예시)
order.forEach((id, idx) => {
  const user  = userCards.find(c=>c.id===id);
  const enemy = aiCards[idx];
  let winner;

  // 임시 로직: name 길이 비교
  if ((user.name||'').length >= (enemy.name||'').length) {
    aiHP -= 10; winner = '사용자';
  } else {
    userHP -= 10; winner = 'AI';
  }

  const li = document.createElement('li');
  li.textContent = `${idx+1}번 대결: ${user.name} vs ${enemy.name} → 승리: ${winner}`;
  resultsEl.appendChild(li);
});

// HP 표시
document.getElementById('userHP').textContent = `User HP: ${userHP}`;
document.getElementById('aiHP').textContent   = `AI HP: ${aiHP}`;

// 최종 승리
document.getElementById('finalResult').textContent =
  userHP > aiHP ? '최종 승리: 사용자' : '최종 승리: AI';
