const app = document.getElementById("app");
const yearBtn = document.getElementById("yearBtn");

const today = new Date();
const currentMonthKey = monthKey(today);

function loadEntries() {
  return JSON.parse(localStorage.getItem("entries") || "[]");
}

function saveEntries(entries) {
  localStorage.setItem("entries", JSON.stringify(entries));
}

function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-");
  return new Date(y, m).toLocaleString("default", { month: "long" });
}

/* ---------------- HOME ---------------- */

function renderHome() {
  const entries = loadEntries().filter(e => monthKey(e.date) === currentMonthKey);

  let moneyIn = 0, moneyOut = 0;
  const categories = {};

  entries.forEach(e => {
    if (e.type === "in") moneyIn += e.amount;
    else {
      moneyOut += e.amount;
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    }
  });

  const balance = moneyIn - moneyOut;

  app.innerHTML = `
    <div class="card">
      <div>This Month</div>
      <h2>${balance}</h2>
      <div class="row">
        <span class="green">Money In ${moneyIn}</span>
        <span class="red">Money Out ${moneyOut}</span>
      </div>
    </div>

    <div class="card">
      <h3>Where your money went</h3>
      ${Object.entries(categories).map(
        ([c, a]) => `<div class="list-item"><span>${c}</span><strong>${a}</strong></div>`
      ).join("")}
    </div>

    <button class="primary" onclick="renderAdd()">+ Add Entry</button>
  `;
}

/* ---------------- ADD ENTRY ---------------- */

function renderAdd() {
  app.innerHTML = `
    <div class="card">
      <h3>Add Entry</h3>
      <select id="type">
        <option value="out">Out</option>
        <option value="in">In</option>
      </select>
      <input id="amount" placeholder="Amount" type="number"/>
      <input id="category" placeholder="Category"/>
      <input id="note" placeholder="Note (optional)"/>
      <button class="primary" onclick="saveEntry()">Save</button>
      <button onclick="renderHome()">Cancel</button>
    </div>
  `;
}

function saveEntry() {
  const entries = loadEntries();
  entries.push({
    type: type.value,
    amount: Number(amount.value),
    category: category.value || "Other",
    note: note.value || "",
    date: new Date().toISOString()
  });
  saveEntries(entries);
  renderHome();
}

/* ---------------- YEAR ---------------- */

function renderYear() {
  const entries = loadEntries();
  const months = {};

  entries.forEach(e => {
    const key = monthKey(e.date);
    months[key] = months[key] || [];
    months[key].push(e);
  });

  app.innerHTML = `
    <div class="card">
      <h3>This Year</h3>
      ${Object.keys(months).sort().reverse().map(k => {
        const sum = months[k].reduce(
          (t, e) => t + (e.type === "in" ? e.amount : -e.amount), 0
        );
        return `<div class="list-item" onclick="renderMonth('${k}')">
          <span>${monthLabel(k)}</span>
          <strong>${sum}</strong>
        </div>`;
      }).join("")}
      <button onclick="renderHome()">Back</button>
    </div>
  `;
}

/* ---------------- MONTH ---------------- */

function renderMonth(key) {
  const entries = loadEntries().filter(e => monthKey(e.date) === key);
  let moneyIn = 0, moneyOut = 0;

  entries.forEach(e => e.type === "in" ? moneyIn += e.amount : moneyOut += e.amount);

  app.innerHTML = `
    <div class="card">
      <h3>${monthLabel(key)}</h3>
      <h2>${moneyIn - moneyOut}</h2>
      <div class="row">
        <span class="green">Money In ${moneyIn}</span>
        <span class="red">Money Out ${moneyOut}</span>
      </div>
      <button onclick="renderYear()">Back to Year</button>
    </div>
  `;
}

/* ---------------- INIT ---------------- */

yearBtn.onclick = renderYear;
renderHome();
