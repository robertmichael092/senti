const screens = {
  home,
  add,
  year,
  transactions
};

let currentType = "out";
let txFilter = null;

function show(name) {
  Object.values(screens).forEach(s => s.classList.add("hidden"));
  screens[name].classList.remove("hidden");
}

addBtn.onclick = () => show("add");
cancelBtn.onclick = () => show("home");
yearBtn.onclick = () => { show("year"); renderYear(); };
backHome.onclick = () => show("home");
txBack.onclick = () => show("home");

document.querySelectorAll(".segmented button").forEach(b => {
  b.onclick = () => {
    document.querySelectorAll(".segmented button").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    currentType = b.dataset.type;
  };
});

saveBtn.onclick = async () => {
  await addEntry({
    type: currentType,
    amount: Number(amount.value),
    category: category.value || "Other",
    note: note.value,
    date: new Date().toISOString()
  });

  amount.value = category.value = note.value = "";
  show("home");
  renderHome();
};

openIncome.onclick = () => openTransactions("in");
openExpense.onclick = () => openTransactions("out");

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

  balance.textContent = inc - out;
  income.textContent = inc;
  expense.textContent = out;

  categories.innerHTML = "";
  Object.entries(cats).forEach(([c, v]) => {
    categories.innerHTML += `<li><span>${c}</span><strong>${v}</strong></li>`;
  });
}

async function openTransactions(type) {
  show("transactions");
  txTitle.textContent = type === "in" ? "Money In" : "Money Out";
  txList.innerHTML = "";

  const entries = await getAllEntries();
  const now = new Date();

  entries
    .filter(e => e.type === type)
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .forEach(e => {
      txList.innerHTML += `
        <li>
          <span>${e.category || "—"}</span>
          <strong>${e.amount}</strong>
        </li>`;
    });
}

async function renderYear() {
  const entries = await getAllEntries();
  const map = {};

  entries.forEach(e => {
    const d = new Date(e.date);
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    map[k] ??= { in: 0, out: 0 };
    map[k][e.type] += e.amount;
  });

  months.innerHTML = "";
  Object.entries(map).forEach(([k, v]) => {
    const [y, m] = k.split("-");
    const name = new Date(y, m).toLocaleString("default", { month: "long" });
    months.innerHTML += `<li><span>${name}</span><strong>${v.in - v.out}</strong></li>`;
  });
}

openDB().then(renderHome);
