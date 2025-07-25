// front/js/selection.js
document.addEventListener('DOMContentLoaded', async () => {
  const selected = new Set();
  const grid = document.getElementById('cardGrid');
  const nextBtn = document.getElementById('nextBtn');

  let allCards = [];
  try {
    const res = await fetch('characters_updated.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allCards = await res.json();
  } catch (err) {
    console.error('카드 데이터 로딩 실패:', err);
    grid.innerHTML = '<p class="error">카드를 불러오는 중 문제가 발생했습니다.</p>';
    return;
  }

  allCards.forEach(c => {
    const box = document.createElement('div');
    box.className = 'card';
    box.dataset.id = c.id;
    // ← 카드 전체를 배경 이미지로!
    box.style.backgroundImage = `url('${c.image}')`;

    // 텍스트는 오버레이 정보 영역에만
    // 기존 box.style.backgroundImage 지우고 innerHTML 만 아래처럼
    box.innerHTML = `
      <div class="card-thumbnail"
          style="background-image: url('${c.image}')">
      </div>
      <div class="card-name-box">${c.name}</div>
      <div class="card-desc-box">${c.persona_main}</div>
    `;


    box.addEventListener('click', () => {
      if (selected.has(c.id)) {
        selected.delete(c.id);
        box.classList.remove('selected');
      } else if (selected.size < 5) {
        selected.add(c.id);
        box.classList.add('selected');
      }
      nextBtn.disabled = (selected.size !== 5);
    });

    grid.appendChild(box);
  });

  nextBtn.addEventListener('click', () => {
    const userCards = allCards.filter(c => selected.has(c.id));
    const q = new URLSearchParams();
    q.set('userCards', JSON.stringify(userCards));
    window.location.href = `order.html?${q.toString()}`;
  });
});
