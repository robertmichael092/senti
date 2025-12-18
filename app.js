// ---------- SCREEN REFERENCES ----------
const home = document.getElementById("home");
const add = document.getElementById("add");
const year = document.getElementById("year");
const month = document.getElementById("month");

// ---------- BUTTONS ----------
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");
const yearBtn = document.getElementById("yearBtn");
const backHomeBtn = document.getElementById("backHomeBtn");
const backYearBtn = document.getElementById("backYearBtn");

const outBtn = document.getElementById("outBtn");
const inBtn = document.getElementById("inBtn");
const saveBtn = document.getElementById("saveBtn");

// ---------- INPUTS ----------
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const note = document.getElementById("note");

// ---------- HOME DISPLAY ----------
const homeBalance = document.getElementById("homeBalance");
const homeIn = document.getElementById("homeIn");
const homeOut = document.getElementById("homeOut");
const homeCategories = document.getElementById("homeCategories");

// ---------- YEAR / MONTH ----------
const yearMonths = document.getElementById("yearMonths");
const monthTitle = document.getElementById("monthTitle");
const monthBalance = document.getElementById("monthBalance");
const monthIn = document.getElementById("monthIn");
const monthOut = document.getElementById("monthOut");
const monthCategories = document.getElementById("monthCategories");

// ---------- NAVIGATION ----------
function show(screen) {
  [home, add, year, month].forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

// ---------- ENTRY TYPE ----------
let entryType = "out";

outBtn.onclick = () => setType("out");
inBtn.onclick = () => setType("in");

function setType(type) {
  entryType = type;
  outBtn.classList.toggle("active", type === "out");
  inBtn.classList.toggle("active", type === "in");
}

// ---------- BUTTON HANDLERS ----------
addBtn.onclick = () => show(add);
cancelBtn.onclick = () => show(home);
yearBtn.onclick = () => {
  show(year);
  renderYear();
};
backHomeBtn.onclick = () => show(home);
backYearBtn.onclick = () => show(year);

// ---------- SAVE ENTRY ----------
saveBtn.onclick = async () => {
  if (!amount.value) return;

  await addEntry({
    type: entryType,
    amount: Number(amount.value),
    category: category.value || "Other",
    note: note.value || "",
    date: new Date().toISOString()
  });

  amount.value = "";
  category.value = "";
  note.value = "";

  show(home);
  renderHome();
};

// ---------- HOME ----------
async function renderHome() {
  const entries = await getAllEntries();
  const now = new Date();

  let income = 0;
  let expense = 0;
  const cats = {};

  entries.forEach(e => {
    const d = new Date(e.date);
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      if (e.type === "in") {
        income += e.amount;
      } else {
        expense += e.amount;
        cats[e.category] = (cats[e.category] || 0) + e.amount;
      }
    }
  });

  homeBalance.textContent = income - expense;
  homeIn.textContent = income;
  homeOut.textContent = expense;

  homeCategories.innerHTML = "";
  Object.entries(cats).forEach(([c, v]) => {
    homeCategories.innerHTML += `<li><span>${c}</span><strong>${v}</strong></li>`;
  });
}

// ---------- YEAR ----------
async function renderYear() {
  const entries = await getAllEntries();
  const months = {};

  entries.forEach(e => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!months[key]) months[key] = { in: 0, out: 0 };

    months[key][e.type] += e.amount;
  });

  yearMonths.innerHTML = "";
  Object.entries(months).forEach(([key, v]) => {
    const [y, m] = key.split("-");
    const label = new Date(y, m).toLocaleString("default", { month: "long" });

    const li = document.createElement("li");
    li.innerHTML = `<span>${label}</span><strong>${v.in - v.out}</strong>`;
    li.onclick = () => openMonth(Number(y), Number(m));

    yearMonths.appendChild(li);
  });
}

// ---------- MONTH ----------
async function openMonth(y, m) {
  show(month);

  const entries = await getAllEntries();
  let income = 0;
  let expense = 0;
  const cats = {};

  entries.forEach(e => {
    const d = new Date(e.date);
    if (d.getFullYear() === y && d.getMonth() === m) {
      if (e.type === "in") {
        income += e.amount;
      } else {
        expense += e.amount;
        cats[e.category] = (cats[e.category] || 0) + e.amount;
      }
    }
  });

  monthTitle.textContent = new Date(y, m).toLocaleString("default", { month: "long" });
  monthBalance.textContent = income - expense;
  monthIn.textContent = income;
  monthOut.textContent = expense;

  monthCategories.innerHTML = "";
  Object.entries(cats).forEach(([c, v]) => {
    monthCategories.innerHTML += `<li><span>${c}</span><strong>${v}</strong></li>`;
  });
}

// ---------- INIT ----------
openDB().then(renderHome);
