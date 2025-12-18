const home = document.getElementById("home");
const add = document.getElementById("add");
const year = document.getElementById("year");
const monthDetail = document.getElementById("monthDetail");

let currentType = "out";
let showAll = false;

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH = now.getMonth();

/* ---------- UI NAV ---------- */
function show(screen) {
  [home, add, year, monthDetail].forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

addBtn.onclick = () => show(add);
cancelBtn.onclick = () => show(home);
yearBtn.onclick = () => { show(year); renderYear(); };
backHome.onclick = () => show(home);
backToYear.onclick = () => show(year);

/* ---------- SEGMENTED CONTROL ---------- */
document.querySelectorAll(".segmented button").forEach(b => {
  b.onclick = () => {
    document.querySelectorAll(".segmented button")
      .forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    currentType = b.dataset.type;
  };
});

/* ---------- SAVE ENTRY ---------- */
saveBtn.onclick = async () => {
  await addEntry({
    type: currentType,
    amount: Number(amount.value),
    category: category.value || "Other",
    note: note.value,
    date: new Date().toISOString()
  });

  amount.value = category.value = note.value = "";
  show(home);
  renderHome(); // refresh home correctly
};

/* ---------- HOME (THIS MONTH) ---------- */
async function renderHome() {
  const entries = await getAllEntries();

  let income = 0;
  let expense = 0;
  const cats = {};

  entries.forEach(e => {
    const d = new Date(e.date);
    if (d.getFullYear() === CURRENT_YEAR && d.getMonth() === CURRENT_MONTH) {
      if (e.type === "in") {
        income += e.amount;
      } else {
        expense += e.amount;
        cats[e.category] = (cats[e.category] || 0) + e.amount;
      }
    }
  });

  balance.textContent = income - expense;
  income.textContent = income;
  expense.textContent = expense;

  renderCategories(cats, categories);
}

/* ---------- CATEGORY LIST (COLLAPSIBLE) ---------- */
function renderCategories(cats, el) {
  el.innerHTML = "";

  const sorted = Object.entries(cats)
    .sort((a, b) => b[1] - a[1]);

  const visible = showAll ? sorted : sorted.slice(0, 3);

  visible.forEach(([c, v]) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${c}</span><strong>${v}</strong>`;
    el.appendChild(li);
  });

  if (sorted.length > 3) {
    const btn = document.createElement("button");
    btn.className = "toggle";
    btn.textContent = showAll ? "Show less" : "View all categories";
    btn.onclick = () => {
      showAll = !showAll;
      renderHome();
    };
    el.appendChild(btn);
  }
}

/* ---------- YEAR VIEW ---------- */
async function renderYear() {
  const entries = await getAllEntries();
  const map = {};

  entries.forEach(e => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map[key] ??= { in: 0, out: 0 };
    map[key][e.type] += e.amount;
  });

  months.innerHTML = "";

  Object.entries(map).forEach(([k, v]) => {
    const [y, m] = k.split("-");
    const name = new Date(y, m).toLocaleString("default", { month: "long" });

    const li = document.createElement("li");
    li.innerHTML = `<span>${name}</span><strong>${v.in - v.out}</strong>`;
    li.onclick = () => openMonth(Number(y), Number(m), name);
    months.appendChild(li);
  });
}

/* ---------- MONTH DETAIL ---------- */
async function openMonth(year, month, name) {
  show(monthDetail);

  const entries = await getAllEntries();
  let income = 0;
  let expense = 0;
  const cats = {};

  entries.forEach(e => {
    const d = new Date(e.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      if (e.type === "in") {
        income += e.amount;
      } else {
        expense += e.amount;
        cats[e.category] = (cats[e.category] || 0) + e.amount;
      }
    }
  });

  monthTitle.textContent = name;
  monthBalance.textContent = income - expense;
  monthIn.textContent = income;
  monthOut.textContent = expense;

  monthCategories.innerHTML = "";
  Object.entries(cats).forEach(([c, v]) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${c}</span><strong>${v}</strong>`;
    monthCategories.appendChild(li);
  });
}

/* ---------- INIT ---------- */
openDB().then(renderHome);
