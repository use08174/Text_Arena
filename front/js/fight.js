// 1) URL 파라미터 파싱
const params    = new URLSearchParams(window.location.search);
let userCards   = JSON.parse(params.get('userCards') || '[]');
let aiCards     = JSON.parse(params.get('aiCards')   || '[]');
const order     = JSON.parse(params.get('order')     || '[]');

// 2) 공격력 옵션 & 랜덤 할당 (10,15,20,25,30)
const ATTACK_OPTIONS = [10, 15, 20, 25, 30];
function ensureAttack(arr) {
  return arr.map(c => ({
    id:     c.id,
    name:   c.name,
    attack: typeof c.attack === 'number'
              ? c.attack
              : ATTACK_OPTIONS[Math.floor(Math.random() * ATTACK_OPTIONS.length)]
  }));
}
userCards = ensureAttack(userCards);
aiCards   = ensureAttack(aiCards);

// 3) 카드 렌더링
const enemyRow = document.getElementById('enemyRow');
const userRow  = document.getElementById('userRow');
order.forEach((id, i) => {
  // AI 카드
  const aiObj = aiCards[i];
  const aiDiv = document.createElement('div');
  aiDiv.className        = 'card';
  aiDiv.textContent      = `${aiObj.name}`;
  aiDiv.dataset.attack   = aiObj.attack;
  enemyRow.appendChild(aiDiv);

  // 내 카드
  const userObj = userCards.find(c => c.id === id);
  const userDiv = document.createElement('div');
  userDiv.className        = 'card';
  userDiv.textContent      = `${userObj.name}`;
  userDiv.dataset.attack   = userObj.attack;
  userRow.appendChild(userDiv);
});

// 4) HP 초기화 및 디스플레이
let userHP = 100, aiHP = 100;
const aiHpDisplay   = document.getElementById('aiHpDisplay');
const userHpDisplay = document.getElementById('userHpDisplay');
// 로드 직후에도 100 표시
aiHpDisplay.textContent   = `HP: ${aiHP}`;
userHpDisplay.textContent = `HP: ${userHP}`;

// 5) 모달 함수
const backdrop = document.getElementById('modalBackdrop');
const modal    = document.getElementById('modal');
function showModal(text, duration = 1000, cb) {
  modal.textContent      = text;
  backdrop.style.display = 'flex';
  setTimeout(() => {
    backdrop.style.display = 'none';
    if (cb) cb();
  }, duration);
}

// 6) 전투 로직
let idx = 0;
function battleRound() {
  if (idx >= order.length) {
    // 최종 결과 모달
    const finalText = userHP > aiHP
      ? '🏆 당신의 최종 승리!'
      : '💀 당신의 최종 패배...';
    showModal(finalText, 2000);
    return;
  }

  const enemyCard = enemyRow.children[idx];
  const userCard  = userRow.children[idx];

  // 애니메이션
  enemyCard.classList.add('attack');
  userCard.classList.add('defend');

  setTimeout(() => {
    enemyCard.classList.remove('attack');
    userCard.classList.remove('defend');

    // 숫자로 파싱
    const aiAtk   = Number(enemyCard.dataset.attack);
    const userAtk = Number(userCard.dataset.attack);

    let popupText;
    if (userAtk >= aiAtk) {
      // 승리: AI HP 감소
      aiHP -= userAtk;
      aiHpDisplay.textContent = `HP: ${aiHP}`;
      popupText = `승리!`;
    } else {
      // 패배: 사용자 HP 감소
      userHP -= aiAtk;
      userHpDisplay.textContent = `HP: ${userHP}`;
      popupText = `패배, -${aiAtk}HP`;
    }

    showModal(popupText, 1500, () => {
      idx++;
      battleRound();
    });
  }, 700);
}

// 7) 자동 시작
window.onload = () => setTimeout(battleRound, 500);
