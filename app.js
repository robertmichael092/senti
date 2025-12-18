const home = document.getElementById("home");
const add = document.getElementById("add");
const year = document.getElementById("year");

let currentType = "out";

document.querySelectorAll(".segmented button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".segmented button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentType = btn.dataset.type;
  };
});

addBtn.onclick = () => {
  home.classList.add("hidden");
  add.classList.remove("hidden");
};

cancelBtn.onclick = () => {
  add.classList.add("hidden");
  home.classList.remove("hidden");
};

yearBtn.onclick = () => {
  home.classList.add("hidden");
  year.classList.remove("hidden");
  renderYear();
};

backHome.onclick = () => {
  year.classList.add("hidden");
  home.classList.remove("hidden");
};

saveBtn.onclick = () => {
  addEntry({
    type: currentType,
    amount: Number(amount.value),
    category: category.value || "Other",
    note: note.value,
    date: new Date().toISOString()
  });

  amount.value = "";
  category.value = "";
  note.value = "";

  add.classList.add("hidden");
  home.classList.remove("hidden");
  render();
};

async function render() {
  const entries = await getAllEntries();
  let income = 0, expense = 0;
  const cats = {};

  entries.forEach(e => {
    if (e.type === "in") income += e.amount;
    else {
      expense += e.amount;
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    }
  });

  balance.textContent = income - expense;
  income.textContent = income;
  expense.textContent = expense;

  categories.innerHTML = "";
  noData.style.display = Object.keys(cats).length ? "none" : "block";

  for (let c in cats) {
    const li = document.createElement("li");
    li.innerHTML = `<span>${c}</span><strong>${cats[c]}</strong>`;
    categories.appendChild(li);
  }
}

async function renderYear() {
  const entries = await getAllEntries();
  const months = {};

  entries.forEach(e => {
    const m = new Date(e.date).toLocaleString("default", { month: "long" });
    months[m] = (months[m] || 0) + (e.type === "in" ? e.amount : -e.amount);
  });

  monthsEl = document.getElementById("months");
  monthsEl.innerHTML = "";

  for (let m in months) {
    const li = document.createElement("li");
    li.innerHTML = `<span>${m}</span><strong>${months[m]}</strong>`;
    monthsEl.appendChild(li);
  }
}

openDB().then(render);
