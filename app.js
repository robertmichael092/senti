alert("NEW APP.JS LOADED");
const app = document.getElementById("app");

/* =========================
   NUMBER FORMAT (NEW)
========================= */
function fmt(n) {
  return Number(n).toLocaleString("en-US");
}

/* =========================
   LANGUAGE (UNCHANGED)
========================= */
const i18n = {
  en: {
    thisMonth: "This Month",
    thisYear: "This Year",
    moneyIn: "Money In",
    moneyOut: "Money Out",
    where: "Where your money went",
    add: "+ Add Entry",
    amount: "Amount",
    category: "Category",
    note: "Note (optional)",
    save: "Save",
    cancel: "Cancel",
    year: "Year",
    back: "Back"
  },
  sw: {
    thisMonth: "Mwezi Huu",
    thisYear: "Mwaka Huu",
    moneyIn: "Pato",
    moneyOut: "Matumizi",
    where: "Fedha zako zilitumika wapi",
    add: "+ Ongeza Muamala",
    amount: "Kiasi",
    category: "Kategoria",
    note: "Maelezo (si lazima)",
    save: "Hifadhi",
    cancel: "Ghairi",
    year: "Mwaka",
    back: "Rudi"
  }
};

let lang = localStorage.getItem("senti_lang") || "en";

function t(key) {
  return i18n[lang][key] || key;
}

/* =========================
   DATA (UNCHANGED)
========================= */
const STORAGE_KEY = "senti_entries";

function getEntries() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveEntry(entry) {
  const entries = getEntries();
  entries.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/* =========================
   HOME
========================= */
function renderHome() {
  const entries = getEntries();
  const now = new Date();

  let income = 0;
  let expense = 0;
  const categories = {};

  entries.forEach(e => {
    const d = new Date(e.date);
    if (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    ) {
      if (e.type === "in") {
        income += e.amount;
      } else {
        expense += e.amount;
        categories[e.category] = (categories[e.category] || 0) + e.amount;
      }
    }
  });

  app.innerHTML = `
    <div class="card">
      <div>${t("thisMonth")}</div>
      <div class="balance">${fmt(income - expense)}</div>

      <div class="row">
        <div class="in">${t("moneyIn")} ${fmt(income)}</div>
        <div class="out">${t("moneyOut")} ${fmt(expense)}</div>
      </div>
    </div>

    <div class="card">
      <h3>${t("where")}</h3>
      ${Object.entries(categories).map(
        ([c, a]) => `
          <div class="list-item">
            <span>${c}</span>
            <span>${fmt(a)}</span>
          </div>
        `
      ).join("")}
    </div>

    <button class="cta" onclick="renderAdd()">${t("add")}</button>
  `;
}

/* =========================
   ADD ENTRY
========================= */
function renderAdd() {
  app.innerHTML = `
    <div class="card">
      <input id="amount" placeholder="${t("amount")}" type="number"/>
      <input id="category" placeholder="${t("category")}"/>
      <input id="note" placeholder="${t("note")}"/>

      <button class="cta" onclick="save()">${t("save")}</button>
      <button class="cta secondary" onclick="renderHome()">${t("cancel")}</button>
    </div>
  `;
}

function save() {
  const amount = Number(document.getElementById("amount").value);
  const category = document.getElementById("category").value;

  if (!amount || !category) return;

  saveEntry({
    amount,
    category,
    type: "out",
    date: new Date().toISOString()
  });

  renderHome();
}

/* =========================
   YEAR (UNCHANGED)
========================= */
function renderYear() {
  app.innerHTML = `
    <div class="card">
      <h3>${t("thisYear")}</h3>
      <button class="cta secondary" onclick="renderHome()">${t("back")}</button>
    </div>
  `;
}

/* =========================
   EVENTS
========================= */
document.getElementById("yearBtn").onclick = renderYear;

document.getElementById("langToggle").onclick = () => {
  lang = lang === "en" ? "sw" : "en";
  localStorage.setItem("senti_lang", lang);
  document.getElementById("langToggle").textContent =
    lang === "en" ? "SW" : "EN";
  renderHome();
};

/* =========================
   INIT
========================= */
document.getElementById("langToggle").textContent =
  lang === "en" ? "SW" : "EN";

renderHome();
