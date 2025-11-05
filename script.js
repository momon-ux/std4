// Senarai guru
const GURU_LIST = [
  "GURU BESAR", "GPK 1", "GPK HEM", "GPK KOKUM", 
  "Riduan Lahero","Sherly Lazurus","Mohammad Fikrey Abdul Gapar","Ramlah Lasupu",
  "Ahmat bin Lahawing","Nur Rafika Mohammad","Ustazah Izzati Hazirah binti Mohd",
  "Samseri Hamzah","Puan Linda Arellano","Marwi Chongo","Sanggetar Kaur A/P Jasbeer Singh",
  "Bibie Novyna binti Mohamad Tony Paton","Mohd Fikri Tamjehi","Saleha Sumunir","Nur Zahiah Binti Mabirin"
];

// Struktur pautan Google Drive per pencerapan & tahun
const DRIVE_LINKS = {
  kendiri: {
    "2023/2024": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2024/2025": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2025/2026": "https://drive.google.com/drive/folders/1uEzjoM3moYlaGORNeXRXvEeBHxuqt2y_?usp=drive_link",
    "2026/2027": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2027/2028": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2028/2029": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2029/2030": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd"
  },
  pertama: {
    "2023/2024": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2024/2025": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2025/2026": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2026/2027": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2027/2028": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2028/2029": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2029/2030": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd"
  },
  kedua: {
    "2023/2024": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2024/2025": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2025/2026": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2026/2027": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2027/2028": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2028/2029": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd",
    "2029/2030": "https://drive.google.com/drive/folders/1pRTzCyu8yb1rQ6vdTB6Gptg6q9PNJdCd"
  }
};

const driveLinksContainer = document.getElementById("drive-links");
const pencerapanSelect = document.getElementById("pencerapan-select");
const tahunSelect = document.getElementById("tahun-select");

// Render kad guru
function renderDriveLinks(){
  const pencerapan = pencerapanSelect.value;
  const tahun = tahunSelect.value;
  const link = DRIVE_LINKS[pencerapan][tahun];

  driveLinksContainer.innerHTML = "";
  GURU_LIST.forEach(g=>{
    const div = document.createElement("div");
    div.className="drive-card";

    const name = document.createElement("div");
    name.className="name"; 
    name.textContent=g;

    const actions = document.createElement("div"); 
    actions.className="actions";

    const viewBtn = document.createElement("button");
    viewBtn.className="drive-btn"; 
    viewBtn.textContent="Muat Naik";
    viewBtn.onclick = ()=> window.open(link,"_blank");

    const uploadBtn = document.createElement("button");
    uploadBtn.className="drive-edit"; 
    uploadBtn.textContent="View";
    uploadBtn.onclick = ()=> window.open(link,"_blank");

    actions.appendChild(viewBtn); 
    actions.appendChild(uploadBtn);
    div.appendChild(name); 
    div.appendChild(actions);
    driveLinksContainer.appendChild(div);
  });
}

// Event dropdown
pencerapanSelect.addEventListener("change", renderDriveLinks);
tahunSelect.addEventListener("change", renderDriveLinks);

// Logo sekolah
const schoolLogo = document.getElementById("school-logo");
const logoInput = document.getElementById("logo-input");
logoInput.addEventListener("change", e=>{
  const f = e.target.files[0]; if(!f) return;
  const reader = new FileReader();
  reader.onload = ev => {
    schoolLogo.src = ev.target.result;
    localStorage.setItem("school_logo", ev.target.result);
  };
  reader.readAsDataURL(f);
});
schoolLogo.addEventListener("click", ()=> logoInput.click());
const savedLogo = localStorage.getItem("school_logo");
if(savedLogo) schoolLogo.src = savedLogo;

// Init
renderDriveLinks();


