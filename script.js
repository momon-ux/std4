/* Dashboard Rasmi SK@S - SK Luasong
   Tema: emas lembut (#d4af37) + navy (#003366)
   Fitur tambahan untuk pautan Drive: tetapkan link per guru (disimpan ke localStorage)
*/

/* ---------- Konstanta ---------- */
const ASPEK_KEYS = ["4.1.1","4.2.1","4.2.2","4.3.1","4.4.1","4.4.2","4.5.1","4.6.1"];
const STORAGE_KEY = "sks_luasong_official_v2";
const DRIVE_KEY = "sks_luasong_drive_links_v1";
const LOGO_KEY = "sks_luasong_logo_v1";

/* ---------- Senarai guru Standard 4 (2025) - daripada cikgu */
const GURU_LIST = [
  "Riduan Lahero","Sherly Lazurus","Mohamad Fikrey Abdul Gapar","Ramlah Lasupu",
  "Ahmat bin Lahawing","Nur Rafika Mohammad","Ustazah Izzati Hazirah binti Mohd",
  "Samseri Hamzah","Puan Linda Arellano","Marwi Chongo","Sanggetar Kaur A/P Jasbeer Singh",
  "Bibie Novyna binti Mohamad Tony Paton","Mohd Fikri Tamjehi","Saleha Sumunir","Nur Zahiah Binti Mabirin"
];

/* ---------- Util ---------- */
function genId(){ return Math.random().toString(36).slice(2,9); }
function byId(id){ return document.getElementById(id); }
function save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
function load(key, fallback){ try{ const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch(e){ return fallback; } }

/* ---------- State ---------- */
let state = load(STORAGE_KEY, [
  // contoh rekod demo (boleh padam)
  { id: genId(), tahun:2025, guru:"Riduan Lahero", pencerapan:1, mp:"Matematik", kelas:"4 Bestari", jenis:"Pemerhatian", tarikh:"2025-03-12",
    aspek: {"4.1.1":85,"4.2.1":88,"4.2.2":80,"4.3.1":82,"4.4.1":87,"4.4.2":79,"4.5.1":91,"4.6.1":84} }
]);

let driveLinks = load(DRIVE_KEY, {}); // { "Riduan Lahero": "https://..." }
let selectedRecordId = null;
let editingId = null;

/* ---------- DOM refs ---------- */
const sections = {
  utama: byId("section-utama"),
  analisis: byId("section-analisis"),
  pautan: byId("section-pautan"),
  pengurusan: byId("section-pengurusan")
};

const navBtns = document.querySelectorAll(".nav-btn");
navBtns.forEach(b=> b.addEventListener("click", ()=> switchSection(b.dataset.section)));

// filters
const selTahun = byId("filter-tahun");
const selPencerapan = byId("filter-pencerapan");
const selGuru = byId("filter-guru");
const selMP = byId("filter-mp");
const selKelas = byId("filter-kelas");
const selJenis = byId("filter-jenis");

// table & charts
const tableBody = byId("data-table").querySelector("tbody");
let barChart, radarChart;

// form
const form = byId("entry-form");
const inpTahun = byId("inp-tahun");
const inpGuru = byId("inp-guru");
const inpPencerapan = byId("inp-pencerapan");
const inpMP = byId("inp-mp");
const inpKelas = byId("inp-kelas");
const inpJenis = byId("inp-jenis");
const inpTarikh = byId("inp-tarikh");
const aspectInputs = ASPEK_KEYS.map(k=> byId("a_"+k.replace(/\./g,'_')));
const addBtn = byId("add-row");
const updateBtn = byId("update-row");
const clearFormBtn = byId("clear-form");

const downloadCsvBtn = byId("download-csv");
const clearDataBtn = byId("clear-data");
const summaryContent = byId("summary-content");

const driveLinksContainer = byId("drive-links");
const logoInput = byId("logo-input");
const schoolLogo = byId("school-logo");

/* ---------- Init ---------- */
init();

function init(){
  // populate guru filter & drive links UI
  populateGuruOptions();
  renderDriveLinks();

  // charts
  initCharts();

  // events
  attachListeners();

  // load logo if ada
  const logoData = load(LOGO_KEY, null);
  if(logoData) setLogo(logoData);

  refreshAll();
}

/* ---------- Section switch ---------- */
function switchSection(name){
  Object.keys(sections).forEach(k=> sections[k].classList.remove("active"));
  if(sections[name]) sections[name].classList.add("active");
}

/* ---------- Populate guru/options for filters & select */ 
function populateGuruOptions(){
  // filters
  selGuru.innerHTML = `<option value="all">Semua Guru</option>`;
  GURU_LIST.forEach(g => {
    const opt = document.createElement("option"); opt.value = g; opt.textContent = g;
    selGuru.appendChild(opt);
  });

  // also populate form default suggestions (datalist behaviour simplified)
  // NB: inpGuru is free-text but we assist with placeholder
  inpGuru.placeholder = "Contoh: " + GURU_LIST.slice(0,3).join(", ");
}

/* ---------- Drive links UI ---------- */
function renderDriveLinks(){
  driveLinksContainer.innerHTML = "";
  GURU_LIST.forEach(g=>{
    const div = document.createElement("div"); div.className = "drive-card";
    const name = document.createElement("div"); name.className = "name"; name.textContent = g;
    const p = document.createElement("div"); p.className = "link-show";
    const link = driveLinks[g] || "";
    p.innerHTML = link ? `<a href="${link}" target="_blank" title="Buka pautan">${truncate(link,60)}</a>` : `<em>Belum ditetapkan</em>`;
    const actions = document.createElement("div"); actions.className = "actions";
    const openBtn = document.createElement("button"); openBtn.className="drive-btn"; openBtn.textContent="Buka";
    openBtn.disabled = !link;
    openBtn.onclick = ()=> { if(link) window.open(link, "_blank"); };
    const setBtn = document.createElement("button"); setBtn.className="drive-edit"; setBtn.textContent="Tetapkan Pautan";
    setBtn.onclick = ()=> {
      const v = prompt(`Masukkan pautan Google Drive untuk ${g}:`, driveLinks[g] || "");
      if(v !== null){
        if(v.trim() === "") { delete driveLinks[g]; } else { driveLinks[g] = v.trim(); }
        save(DRIVE_KEY, driveLinks);
        renderDriveLinks();
      }
    };
    actions.appendChild(openBtn); actions.appendChild(setBtn);
    div.appendChild(name); div.appendChild(p); div.appendChild(actions);
    driveLinksContainer.appendChild(div);
  });
}
function truncate(s, n){ if(!s) return ""; return s.length>n ? s.slice(0,n-3)+"..." : s; }

/* ---------- Listeners ---------- */
function attachListeners(){
  [selTahun, selPencerapan, selGuru, selMP, selKelas, selJenis].forEach(s=> s.addEventListener('change', refreshAll));

  form.addEventListener('submit', e=> { e.preventDefault(); if(editingId) commitUpdate(); else addRecord(); });

  updateBtn.addEventListener('click', commitUpdate);
  clearFormBtn.addEventListener('click', ()=> { form.reset(); editingId=null; selectedRecordId=null; addBtn.disabled=false; updateBtn.disabled=true; });

  downloadCsvBtn.addEventListener('click', exportCsv);
  clearDataBtn.addEventListener('click', ()=> {
    if(confirm("Padam semua data? Tindakan ini tidak boleh diundur.")) { state=[]; saveState(); refreshAll(); }
  });

  logoInput.addEventListener('change', e=>{
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader(); r.onload = ev => { setLogo(ev.target.result); save(LOGO_KEY, ev.target.result); };
    r.readAsDataURL(f);
  });

  schoolLogo.addEventListener('click', ()=> logoInput.click());
}

/* ---------- Table rendering ---------- */
function getFilteredData(){
  return state.filter(r=>{
    if(selTahun.value !== "all" && String(r.tahun) !== selTahun.value) return false;
    if(selPencerapan.value !== "all" && String(r.pencerapan) !== selPencerapan.value) return false;
    if(selGuru.value !== "all" && r.guru !== selGuru.value) return false;
    if(selMP.value !== "all" && (r.mp||"") !== selMP.value) return false;
    if(selKelas.value !== "all" && (r.kelas||"") !== selKelas.value) return false;
    if(selJenis.value !== "all" && (r.jenis||"") !== selJenis.value) return false;
    return true;
  });
}

function renderTable(){
  tableBody.innerHTML = "";
  const data = getFilteredData();
  data.forEach(r=>{
    const tr = document.createElement('tr');
    const avg = computeAverage(Object.values(r.aspek || {}));
    tr.innerHTML = `
      <td>${r.tahun}</td><td>${r.guru}</td><td>${r.pencerapan}</td><td>${r.mp||""}</td><td>${r.kelas||""}</td><td>${r.jenis||""}</td><td>${r.tarikh||""}</td>
      ${ASPEK_KEYS.map(k=>`<td>${r.aspek[k] ?? ""}</td>`).join('')}
      <td>${avg}</td>
      <td>
        <button class="view-btn" data-id="${r.id}">View</button>
        <button class="edit-btn" data-id="${r.id}">Edit</button>
        <button class="del-btn" data-id="${r.id}">Padam</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  tableBody.querySelectorAll('.view-btn').forEach(b=> b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id; selectedRecordId = id; renderSummary(); updateRadar();
  }));
  tableBody.querySelectorAll('.edit-btn').forEach(b=> b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id; startEdit(id);
  }));
  tableBody.querySelectorAll('.del-btn').forEach(b=> b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id;
    if(confirm("Padam rekod ini?")) { state = state.filter(x=>x.id!==id); saveState(); refreshAll(); }
  }));
}

/* ---------- Add / Edit ---------- */
function collectForm(){
  const aspek = {};
  ASPEK_KEYS.forEach((k, i)=> {
    let v = Number(aspectInputs[i].value); if(isNaN(v)) v = 0; v = Math.max(0,Math.min(100,v)); aspek[k]=v;
  });
  return {
    id: genId(),
    tahun: Number(inpTahun.value) || new Date().getFullYear(),
    guru: inpGuru.value.trim() || "Tanpa Nama",
    pencerapan: Number(inpPencerapan.value) || 1,
    mp: inpMP.value.trim(),
    kelas: inpKelas.value.trim(),
    jenis: inpJenis.value.trim(),
    tarikh: inpTarikh.value || "",
    aspek
  };
}

function addRecord(){
  const rec = collectForm();
  state.push(rec);
  saveState();
  form.reset();
  selectedRecordId = rec.id;
  refreshAll();
}

function startEdit(id){
  const rec = state.find(r=>r.id===id); if(!rec) return;
  editingId = id;
  inpTahun.value = rec.tahun;
  inpGuru.value = rec.guru;
  inpPencerapan.value = rec.pencerapan;
  inpMP.value = rec.mp || "";
  inpKelas.value = rec.kelas || "";
  inpJenis.value = rec.jenis || "";
  inpTarikh.value = rec.tarikh || "";
  ASPEK_KEYS.forEach((k,i)=> aspectInputs[i].value = rec.aspek[k] ?? 0 );
  addBtn.disabled = true; updateBtn.disabled = false;
}

function commitUpdate(){
  if(!editingId) return;
  const idx = state.findIndex(r=>r.id===editingId); if(idx === -1) return;
  const aspek = {};
  ASPEK_KEYS.forEach((k,i)=> { let v = Number(aspectInputs[i].value); if(isNaN(v)) v=0; aspek[k]=Math.max(0,Math.min(100,v)); });
  Object.assign(state[idx], {
    tahun: Number(inpTahun.value),
    guru: inpGuru.value.trim(),
    pencerapan: Number(inpPencerapan.value),
    mp: inpMP.value.trim(),
    kelas: inpKelas.value.trim(),
    jenis: inpJenis.value.trim(),
    tarikh: inpTarikh.value || "",
    aspek
  });
  editingId = null; saveState(); form.reset(); addBtn.disabled=false; updateBtn.disabled=true; refreshAll();
}

/* ---------- Charts ---------- */
function initCharts(){
  const barCtx = byId("barChart").getContext("2d");
  barChart = new Chart(barCtx, {
    type:'bar',
    data:{ labels: ASPEK_KEYS, datasets:[{ label:'Purata Skor', data: ASPEK_KEYS.map(_=>0), backgroundColor:'rgba(212,175,55,0.85)'}]},
    options:{ responsive:true, plugins:{legend:{display:false}}, scales:{ y:{ beginAtZero:true, max:100 }} }
  });

  const radarCtx = byId("radarChart").getContext("2d");
  radarChart = new Chart(radarCtx, {
    type:'radar',
    data:{ labels: ASPEK_KEYS, datasets:[{ label:'Profil', data: ASPEK_KEYS.map(_=>0), backgroundColor:'rgba(26,115,232,0.12)', borderColor:'#1a73e8', pointRadius:4 }]},
    options:{ responsive:true, scales:{ r:{ beginAtZero:true, suggestedMax:100 }}}
  });
}

function updateBar(){
  const data = getFilteredData();
  const sums = ASPEK_KEYS.map(_=>0);
  data.forEach(r=> ASPEK_KEYS.forEach((k,i)=> sums[i]+= Number(r.aspek[k] || 0) ));
  const denom = data.length || 1;
  const avg = sums.map(s => Math.round((s/denom)*100)/100);
  barChart.data.datasets[0].data = avg; barChart.update();
}

function updateRadar(){
  if(selectedRecordId){
    const rec = state.find(r=>r.id === selectedRecordId);
    if(rec){ radarChart.data.datasets[0].data = ASPEK_KEYS.map(k=> Number(rec.aspek[k]||0)); radarChart.update(); return; }
  }
  // else show average of filtered
  const data = getFilteredData();
  const sums = ASPEK_KEYS.map(_=>0);
  data.forEach(r=> ASPEK_KEYS.forEach((k,i)=> sums[i]+= Number(r.aspek[k]||0) ));
  const denom = data.length || 1;
  radarChart.data.datasets[0].data = sums.map(s => Math.round((s/denom)*100)/100);
  radarChart.update();
}

/* ---------- Summary ---------- */
function computeAverage(arr){ if(!arr||arr.length===0) return 0; const s=arr.reduce((a,b)=>a+Number(b||0),0); return Math.round((s/arr.length)*100)/100; }
function perfCat(avg){ if(avg>=80) return "Cemerlang (80–100)"; if(avg>=65) return "Baik (65–79)"; if(avg>=50) return "Sederhana (50–64)"; return "Lemah (0–49)"; }

function renderSummary(){
  if(selectedRecordId){
    const r = state.find(x=>x.id===selectedRecordId);
    if(!r){ summaryContent.innerHTML = "<p>Rekod tidak ditemui.</p>"; return; }
    const arr = ASPEK_KEYS.map(k=> ({k,v: Number(r.aspek[k]||0)}));
    const avg = computeAverage(arr.map(a=>a.v));
    const s = arr.slice().sort((a,b)=>b.v-a.v);
    summaryContent.innerHTML = `
      <p><strong>Jenis Penilaian:</strong> ${r.jenis || '-'}</p>
      <p><strong>Tarikh Pencerapan:</strong> ${r.tarikh || '-'}</p>
      <p><strong>Mata Pelajaran:</strong> ${r.mp || '-'}</p>
      <p><strong>Kelas:</strong> ${r.kelas || '-'}</p>
      <p><strong>Guru:</strong> ${r.guru} • <strong>Pencerapan:</strong> ${r.pencerapan} • <strong>Tahun:</strong> ${r.tahun}</p>
      <hr/>
      <p><strong>Purata Keseluruhan:</strong> ${avg} — ${perfCat(avg)}</p>
      <p><strong>Aspek Terkuat:</strong> ${s[0].k} (${s[0].v})</p>
      <p><strong>Aspek Perlu Perhatian:</strong> ${s[s.length-1].k} (${s[s.length-1].v})</p>
      <hr/>
      <strong>Senarai Skor:</strong><ul>${ASPEK_KEYS.map(k=>`<li>${k}: ${r.aspek[k] ?? 0}</li>`).join('')}</ul>
    `;
    return;
  }

  // aggregate
  const data = getFilteredData();
  if(data.length === 0){ summaryContent.innerHTML = "<p>Tiada rekod dalam penapis semasa.</p>"; return; }
  const sums = ASPEK_KEYS.map(_=>0);
  data.forEach(r=> ASPEK_KEYS.forEach((k,i)=> sums[i]+= Number(r.aspek[k]||0) ));
  const avg = sums.map(s=> Math.round((s/data.length)*100)/100);
  const overall = Math.round((avg.reduce((a,b)=>a+b,0)/avg.length)*100)/100;
  const pairs = ASPEK_KEYS.map((k,i)=>({k,v:avg[i]})).sort((a,b)=>b.v-a.v);
  summaryContent.innerHTML = `
    <p><strong>Bil rekod (penapis):</strong> ${data.length}</p>
    <p><strong>Purata Keseluruhan:</strong> ${overall} — ${perfCat(overall)}</p>
    <p><strong>Aspek Terkuat (purata):</strong> ${pairs[0].k} (${pairs[0].v})</p>
    <p><strong>Aspek Perlu Perhatian (purata):</strong> ${pairs[pairs.length-1].k} (${pairs[pairs.length-1].v})</p>
    <hr/>
    <strong>Purata Skor Aspek (penapis):</strong><ul>${pairs.map(p=>`<li>${p.k}: ${p.v}</li>`).join('')}</ul>
  `;
}

/* ---------- CSV export ---------- */
function exportCsv(){
  const hdr = ["id","tahun","guru","pencerapan","mp","kelas","jenis","tarikh",...ASPEK_KEYS,"purata"];
  const rows = state.map(r=>{
    const arr = [r.id,r.tahun,r.guru,r.pencerapan,r.mp||"",r.kelas||"",r.jenis||"",r.tarikh||""];
    ASPEK_KEYS.forEach(k=> arr.push(r.aspek[k] ?? ""));
    arr.push(computeAverage(ASPEK_KEYS.map(k=> Number(r.aspek[k]||0) )));
    return arr;
  });
  const csv = [hdr, ...rows].map(r=> r.map(v=>`"${String(v||"").replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "pencerapan_standard4_official.csv"; a.click(); URL.revokeObjectURL(url);
}

/* ---------- Save state ---------- */
function saveState(){ save(STORAGE_KEY, state); }

/* ---------- Helpers & refresh ---------- */
function refreshAll(){ populateDynamicFilters(); renderTable(); updateBar(); updateRadar(); renderSummary(); saveState(); }

function populateDynamicFilters(){
  // populate MP, Kelas, Jenis from state
  const mps = new Set(), kelasSet = new Set(), jenisSet = new Set();
  state.forEach(r=>{ if(r.mp) mps.add(r.mp); if(r.kelas) kelasSet.add(r.kelas); if(r.jenis) jenisSet.add(r.jenis); });
  fillSelect(selMP, mps, "Semua MP"); fillSelect(selKelas, kelasSet, "Semua Kelas"); fillSelect(selJenis, jenisSet, "Semua Jenis");
  // populate guru filter only with GURU_LIST (fixed)
}
function fillSelect(sel, set, placeholder){
  const cur = sel.value || "all"; sel.innerHTML = `<option value="all">${placeholder}</option>`;
  Array.from(set).sort().forEach(v=> { const o=document.createElement("option"); o.value=v; o.textContent=v; sel.appendChild(o); });
  sel.value = cur;
}

/* ---------- Logo ---------- */
function setLogo(dataUrl){
  schoolLogo.src = dataUrl;
  schoolLogo.style.objectFit = "cover";
}

/* ---------- Initial Chart setup ---------- */
function initCharts(){
  const barCtx = byId("barChart").getContext("2d");
  barChart = new Chart(barCtx, {
    type:'bar',
    data:{ labels: ASPEK_KEYS, datasets:[{ label:'Purata Skor', data: ASPEK_KEYS.map(_=>0), backgroundColor:'rgba(212,175,55,0.88)'}]},
    options:{ responsive:true, plugins:{legend:{display:false}}, scales:{ y:{ beginAtZero:true, max:100 } } }
  });
  const radarCtx = byId("radarChart").getContext("2d");
  radarChart = new Chart(radarCtx, {
    type:'radar',
    data:{ labels: ASPEK_KEYS, datasets:[{ label:'Profil', data: ASPEK_KEYS.map(_=>0), backgroundColor:'rgba(26,115,232,0.12)', borderColor:'#1a73e8', pointRadius:4 }]},
    options:{ responsive:true, scales:{ r:{ beginAtZero:true, suggestedMax:100 } } }
  });
}

/* ---------- Utility for average & chart updates ---------- */
function computeAverage(arr){ if(!arr||arr.length===0) return 0; const s=arr.reduce((a,b)=>a+Number(b||0),0); return Math.round((s/arr.length)*100)/100; }

function updateBar(){
  const data = getFilteredData();
  const sums = ASPEK_KEYS.map(_=>0);
  data.forEach(r=> ASPEK_KEYS.forEach((k,i)=> sums[i]+= Number(r.aspek[k]||0) ));
  const denom = data.length || 1;
  const avg = sums.map(s=> Math.round((s/denom)*100)/100 );
  barChart.data.datasets[0].data = avg; barChart.update();
}

function updateRadar(){
  if(selectedRecordId){
    const rec = state.find(r=>r.id===selectedRecordId);
    if(rec){ radarChart.data.datasets[0].data = ASPEK_KEYS.map(k=> Number(rec.aspek[k]||0)); radarChart.update(); return; }
  }
  const data = getFilteredData();
  const sums = ASPEK_KEYS.map(_=>0);
  data.forEach(r=> ASPEK_KEYS.forEach((k,i)=> sums[i]+= Number(r.aspek[k]||0) ));
  const denom = data.length || 1;
  radarChart.data.datasets[0].data = sums.map(s=> Math.round((s/denom)*100)/100 ); radarChart.update();
}

/* ---------- Init: populate filters (guru fixed) ---------- */
(function initFilters(){
  // populate guru filter (fixed list)
  selGuru.innerHTML = `<option value="all">Semua Guru</option>`;
  GURU_LIST.forEach(g => { const o = document.createElement("option"); o.value=g; o.textContent=g; selGuru.appendChild(o); });
})();

/* ---------- Start ---------- */
refreshAll();
