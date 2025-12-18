// ELEMENTS
const home = document.getElementById("home");
const add = document.getElementById("add");
const year = document.getElementById("year");
const transactions = document.getElementById("transactions");

const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");
const yearBtn = document.getElementById("yearBtn");
const backHome = document.getElementById("backHome");

const openIncome = document.getElementById("openIncome");
const openExpense = document.getElementById("openExpense");
const txBack = document.getElementById("txBack");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const categoriesEl = document.getElementById("categories");
const monthsEl = document.getElementById("months");
const txList = document.getElementById("txList");
const txTitle = document.getElementById("txTitle");

const amount = document.getElementById("amount");
const category = document.getElementById("category");
const note = document.getElementById("note");

const typeOut = document.getElementById("typeOut");
const typeIn = document.getElementById("typeIn");

let currentType = "out";

// NAVIGATION
function show(screen) {
  [home, add, year, transactions].forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

// EVENTS
addBtn.onclick = () => show(add);
cancelBtn.onclick = () => show(home);
yearBtn.onclick = () => { show(year); renderYear(); };
backHome.onclick = () => show(home);
txBack.onclick = () => show(home);

typeOut.onclick = () => { currentType = "out"; typeOut.classList.add("active"); typeIn.classList.remove("active"); };
typeIn.onclick = () => { currentType = "in"; typeIn.classList.add("active"); typeOut.classList.remove("active"); };

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
  renderHome();
};

openIncome.onclick = () => openTransactions("in");
openExpense.onclick = () => openTransactions("out");

// RENDERING
async function renderHome() {
  const entries = await getAllEntries();
  const now = new Date();
  let inc = 0, out = 0;
  const cats = {};

  entries.forEach(e => {
    const d = new Date(e.date);
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      if (e.type === "in") inc += e.amount;
      else {
        out += e.amount;
        cats[e.category] = (cats[e.category] || 0) + e.amount;
      }
    }
  });

  balanceEl.textContent = inc - out;
  incomeEl.textContent = inc;
  expenseEl.textContent = out;

  categoriesEl.innerHTML = "";
  Object.entries(cats).forEach(([c, v]) => {
    categoriesEl.innerHTML += `<li><span>${c}</span><strong>${v}</strong></li>`;
  });
}

async function openTransactions(type) {
  show(transactions);
  txTitle.textContent = type === "in" ? "Money In" : "Money Out";
  txList.innerHTML = "";

  const entries = await getAllEntries();
  const now = new Date();

  entries.filter(e => e.type === type).forEach(e => {
    const d = new Date(e.date);
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      txList.innerHTML += `<li><span>${e.category}</span><strong>${e.amount}</strong></li>`;
    }
  });
}

async function renderYear() {
  const entries = await getAllEntries();
  const map = {};

  entries.forEach(e => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map[key] ??= { in: 0, out: 0 };
    map[key][e.type] += e.amount;
  });

  monthsEl.innerHTML = "";
  Object.entries(map).forEach(([k, v]) => {
    const [y, m] = k.split("-");
    const label = new Date(y, m).toLocaleString("default", { month: "long" });
    monthsEl.innerHTML += `<li><span>${label}</span><strong>${v.in - v.out}</strong></li>`;
  });
}

// INIT
openDB().then(renderHome);
