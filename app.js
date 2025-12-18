const home = document.getElementById("home");
const add = document.getElementById("add");
const year = document.getElementById("year");
const monthDetail = document.getElementById("monthDetail");

let currentType = "out";
let showAll = false;

document.querySelectorAll(".segmented button").forEach(b => {
  b.onclick = () => {
    document.querySelectorAll(".segmented button").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    currentType = b.dataset.type;
  };
});

addBtn.onclick = () => show(add);
cancelBtn.onclick = () => show(home);
yearBtn.onclick = () => { show(year); renderYear(); };
backHome.onclick = () => show(home);
backToYear.onclick = () => show(year);

function show(screen) {
  [home, add, year, monthDetail].forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

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

  renderCategories(cats, categories);
}

function renderCategories(cats, el) {
  el.innerHTML = "";
  const sorted = Object.entries(cats).sort((a,b)=>b[1]-a[1]);
  const visible = showAll ? sorted : sorted.slice(0,3);

  visible.forEach(([c,v]) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${c}</span><strong>${v}</strong>`;
    el.appendChild(li);
  });

  if (sorted.length > 3) {
    const t = document.createElement("button");
    t.className = "toggle";
    t.textContent = showAll ? "Show less" : "View all categories";
    t.onclick = () => { showAll = !showAll; render(); };
    el.appendChild(t);
  }
}

async function renderYear() {
  const entries = await getAllEntries();
  const map = {};

  entries.forEach(e => {
    const d = new Date(e.date);
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    map[k] ??= { in:0, out:0 };
    map[k][e.type] += e.amount;
  });

  months.innerHTML = "";
  Object.entries(map).forEach(([k,v]) => {
    const [y,m] = k.split("-");
    const name = new Date(y,m).toLocaleString("default",{month:"long"});
    const li = document.createElement("li");
    li.innerHTML = `<span>${name}</span><strong>${v.in - v.out}</strong>`;
    li.onclick = () => openMonth(k, name);
    months.appendChild(li);
  });
}

async function openMonth(key, name) {
  show(monthDetail);
  const entries = await getAllEntries();
  let inc=0, out=0;
  const cats={};

  entries.forEach(e=>{
    const d=new Date(e.date);
    if(`${d.getFullYear()}-${d.getMonth()}`===key){
      if(e.type==="in") inc+=e.amount;
      else{
        out+=e.amount;
        cats[e.category]=(cats[e.category]||0)+e.amount;
      }
    }
  });

  monthTitle.textContent=name;
  monthBalance.textContent=inc-out;
  monthIn.textContent=inc;
  monthOut.textContent=out;

  monthCategories.innerHTML="";
  Object.entries(cats).forEach(([c,v])=>{
    const li=document.createElement("li");
    li.innerHTML=`<span>${c}</span><strong>${v}</strong>`;
    monthCategories.appendChild(li);
  });
}

openDB().then(render);
