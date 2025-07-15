// 예시 카드 20개 데이터
const allCards = Array.from({length:20}, (_,i)=>({
  id: `card${i+1}`,
  name: `카드 ${i+1}`
}));

const selected = new Set();
const grid = document.getElementById('cardGrid');
const nextBtn = document.getElementById('nextBtn');

// 카드 렌더링
allCards.forEach(c => {
  const box = document.createElement('div');
  box.className = 'card';
  box.textContent = c.name;
  box.dataset.id = c.id;

  box.addEventListener('click', () => {
    if (selected.has(c.id)) {
      selected.delete(c.id);
      box.classList.remove('selected');
    } else if (selected.size < 5) {
      selected.add(c.id);
      box.classList.add('selected');
    }
    nextBtn.disabled = selected.size !== 5;
  });

  grid.appendChild(box);
});

// 다음 버튼 클릭 → order.html 로 이동
nextBtn.addEventListener('click', () => {
  const userCards = allCards.filter(c => selected.has(c.id));
  const q = new URLSearchParams();
  q.set('userCards', JSON.stringify(userCards));
  window.location.href = `order.html?${q.toString()}`;
});
