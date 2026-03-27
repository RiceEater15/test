function getCourse() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("course");
  if (fromQuery) return fromQuery;
  const fromBody = document.body?.dataset?.course;
  if (fromBody) return fromBody;
  const page = window.location.pathname.split("/").pop()?.toLowerCase();
  const pageToCourse = {
    "aphug.html": "ap_human_geography",
    "geometry.html": "geometry"
  };
  return pageToCourse[page] || "ap_human_geography";
}
function getUnitLabel(title) {
  const match = title.match(/\bUnit\s+(\d+)\b/i);
  if (!match) return "Other";
  return `Unit ${match[1]}`;
}
function compareUnitLabels(a, b) {
  if (a === "Other") return 1;
  if (b === "Other") return -1;
  const aNum = Number(a.replace("Unit ", ""));
  const bNum = Number(b.replace("Unit ", ""));
  return aNum - bNum;
}
async function loadLessons() {
  const list = document.getElementById("lesson-list");
  const filter = document.getElementById("filter");
  if (!list || !filter) return;
  const course = getCourse();
  const res = await fetch("./lessoninfo.json");
  const data = await res.json();
  const lessons = data?.[course];
  if (!lessons) {
    list.innerHTML = "<li>No lessons found.</li>";
    return;
  }
  const entries = Object.entries(lessons).map(([unitKey, lesson]) => ({
    unitKey,
    title: lesson.title,
    unitLabel: getUnitLabel(lesson.title)
  }));
  const units = [...new Set(entries.map((entry) => entry.unitLabel))].sort(compareUnitLabels);
  units.forEach((unit) => {
    const option = document.createElement("option");
    option.value = unit;
    option.textContent = unit;
    filter.appendChild(option);
  });
  function renderLessons(selectedUnit) {
    list.innerHTML = "";
    const filtered =
      selectedUnit === "all"
        ? entries
        : entries.filter((entry) => entry.unitLabel === selectedUnit);
    if (filtered.length === 0) {
      list.innerHTML = "<li>No lessons in this unit.</li>";
      return;
    }
    filtered.forEach((entry) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `lesson.html?course=${course}&unit=${entry.unitKey}`;
      a.className = "btn";
      a.textContent = entry.title;
      li.appendChild(a);
      list.appendChild(li);
    });
  }
  renderLessons("all");
  filter.addEventListener("change", (event) => {
    renderLessons(event.target.value);
  });
}
loadLessons();
