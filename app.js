const home = document.getElementById("home");
const add = document.getElementById("add");
const year = document.getElementById("year");

document.getElementById("addBtn").onclick = () => {
  home.hidden = true;
  add.hidden = false;
};

document.getElementById("cancelBtn").onclick = () => {
  add.hidden = true;
  home.hidden = false;
};

document.getElementById("saveBtn").onclick = async () => {
  const entry = {
    type: type.value,
    amount: Number(amount.value),
    category: category.value,
    note: note.value,
    date: new Date().toISOString()
  };

  addEntry(entry);
  add.hidden = true;
  home.hidden = false;
  render();
};

async function render() {
  const entries = await getAllEntries();
  let income = 0, expense = 0;

  entries.forEach(e => {
    if (e.type === "in") income += e.amount;
    else expense += e.amount;
  });

  document.getElementById("income").textContent = income;
  document.getElementById("expense").textContent = expense;
  document.getElementById("balance").textContent = income - expense;
}

openDB().then(render);
