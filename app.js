const balanceEl = document.getElementById('balance');
const addBtn = document.getElementById('add-btn');
const addFundsBtn = document.getElementById('add-funds-btn');
const monthSelect = document.getElementById('month-select');

function updateBalance() {
  const funds = parseInt(localStorage.getItem('funds') || '0');
  balanceEl.textContent = funds;
}

function getMonth(dateStr) {
  return dateStr.slice(0,7);
}

function loadMonths() {
  const history = JSON.parse(localStorage.getItem('history') || '[]');
  const months = [...new Set(history.map(h => getMonth(h.date)))];
  monthSelect.innerHTML = '';
  months.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    monthSelect.appendChild(opt);
  });
  if (months.length) renderHistory(months[0]);
}

function renderHistory(selectedMonth) {
  const history = JSON.parse(localStorage.getItem('history') || '[]');
  const filtered = history.filter(h => h.date.startsWith(selectedMonth));
  const historyDiv = document.getElementById('history');
  historyDiv.innerHTML = '';

  const grouped = {};
  filtered.forEach(h => {
    if (!grouped[h.date]) grouped[h.date] = [];
    grouped[h.date].push(h);
  });

  for (const date in grouped) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    dayDiv.innerHTML = `<strong>${date}</strong>`;
    grouped[date].forEach((h, idx) => {
      const entryDiv = document.createElement('div');
      entryDiv.innerHTML = `
        ${h.name} - ${h.amount}元 (${h.note})
        <button data-date="${h.date}" data-index="${idx}">❌ 刪除</button>
      `;
      dayDiv.appendChild(entryDiv);
    });
    historyDiv.appendChild(dayDiv);
  }

  document.querySelectorAll('#history button').forEach(btn => {
    btn.addEventListener('click', () => {
      const date = btn.dataset.date;
      const idx = parseInt(btn.dataset.index);
      deleteEntry(date, idx, selectedMonth);
    });
  });
}

function deleteEntry(date, idx, selectedMonth) {
  const history = JSON.parse(localStorage.getItem('history') || '[]');
  const dayEntries = history.filter(h => h.date === date);
  const toDelete = dayEntries[idx];

  const indexInAll = history.findIndex(
    h => h.date === toDelete.date && h.name === toDelete.name && h.amount === toDelete.amount && h.note === toDelete.note
  );

  if (indexInAll >= 0) {
    history.splice(indexInAll, 1);
    localStorage.setItem('history', JSON.stringify(history));

    let funds = parseInt(localStorage.getItem('funds') || '0');
    funds += parseInt(toDelete.amount);
    localStorage.setItem('funds', funds);
    updateBalance();

    renderHistory(selectedMonth);
  }
}

addBtn.addEventListener('click', () => {
  const name = document.getElementById('name').value.trim();
  const amount = parseInt(document.getElementById('amount').value);
  const note = document.getElementById('note').value.trim();
  if (!name || isNaN(amount)) return alert('請輸入名稱和金額');

  const history = JSON.parse(localStorage.getItem('history') || '[]');
  const now = new Date();
  const dateStr = now.toISOString().slice(0,10);

  history.push({ name, amount, note, date: dateStr });
  localStorage.setItem('history', JSON.stringify(history));

  let funds = parseInt(localStorage.getItem('funds') || '0');
  funds -= amount;
  localStorage.setItem('funds', funds);
  updateBalance();

  document.getElementById('name').value = '';
  document.getElementById('amount').value = '';
  document.getElementById('note').value = '';

  loadMonths();
});

addFundsBtn.addEventListener('click', () => {
  const addAmount = parseInt(document.getElementById('initial-funds').value);
  if (isNaN(addAmount)) return alert('請輸入金額');
  let funds = parseInt(localStorage.getItem('funds') || '0');
  funds += addAmount;
  localStorage.setItem('funds', funds);
  updateBalance();
  document.getElementById('initial-funds').value = '';
});

monthSelect.addEventListener('change', () => {
  renderHistory(monthSelect.value);
});

updateBalance();
loadMonths();
