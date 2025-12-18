// Screens
const home = home = document.getElementById("home");
const add = document.getElementById("add");
const year = document.getElementById("year");
const month = document.getElementById("month");

// Buttons
addBtn.onclick = () => show(add);
cancelBtn.onclick = () => show(home);
yearBtn.onclick = () => { show(year); renderYear(); };
backHomeBtn.onclick = () => show(home);
backYearBtn.onclick = () => show(year);

// Entry type
let entryType = "out";
outBtn.onclick = () => setType("out");
inBtn.onclick = () => setType("in");

function setType(t) {
  entryType = t;
  outBtn.classList.toggle("active", t === "out");
  inBtn.classList.toggle("active", t === "in");
}

function show(screen) {
  [home, add, year, month].forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

// Save
saveBtn.onclick = async () => {
  await addEntry({
    type: entryType,
    amount: Number(amount.value),
    category: category.value || "Other",
    note: note.value,
    date: new Date().toISOString()
  });
  amount.value = category.value = note.value = "";
  show(home);
  renderHome();
};

// HOME
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

  homeBalance.textContent = inc - out;
  homeIn.textContent = inc;
  homeOut.textContent = out;

  homeCategories.innerHTML = "";
  Object.entries(cats).forEach(([c, v]) => {
    homeCategories.innerHTML += `<li><span>${c}</span><strong>${v}</strong></li>`;
  });
}

// YEAR
async function renderYear() {
  const entries = await getAllEntries();
  const map = {};

  entries.forEach(e => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map[key] ??= { in: 0, out: 0 };
    map[key][e.type] += e.amount;
  });

  yearMonths.innerHTML = "";
  Object.entries(map).forEach(([k, v]) => {
    const [y, m] = k.split("-");
    const label = new Date(y, m).toLocaleString("default", { month: "long" });
    yearMonths.innerHTML += `
      <li onclick="openMonth(${y}, ${m})">
        <span>${label}</span>
        <strong>${v.in - v.out}</strong>
      </li>`;
  });
}

// MONTH
async function openMonth(y, m) {
  show(month);
  const entries = await getAllEntries();

  let inc = 0, out = 0;
  const cats = {};

  entries.forEach(e => {
    const d = new Date(e.date);
    if (d.getFullYear() === y && d.getMonth() === m) {
      if (e.type === "in") inc += e.amount;
      else {
        out += e.amount;
        cats[e.category] = (cats[e.category] || 0) + e.amount;
      }
    }
  });

  monthTitle.textContent = new Date(y, m).toLocaleString("default", { month: "long" });
  monthBalance.textContent = inc - out;
  monthIn.textContent = inc;
  monthOut.textContent = out;

  monthCategories.innerHTML = "";
  Object.entries(cats).forEach(([c, v]) => {
    monthCategories.innerHTML += `<li><span>${c}</span><strong>${v}</strong></li>`;
  });
}

// INIT
openDB().then(renderHome);
