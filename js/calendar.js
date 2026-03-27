import { auth, app } from "./firebase.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
const db = getFirestore(app);
const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const calendarGrid = document.getElementById("calendarGrid");
const calendarDays = document.querySelector(".calendar-days");
const monthTitle = document.getElementById("monthTitle");
const userNameEl = document.getElementById("userName");
const bookBtn = document.getElementById("bookBtn");
const mySessions = document.getElementById("mySessions");
const allSessionsEl = document.getElementById("allSessions");
let selectedDate = null;
let currentDate = new Date();
function buildCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  monthTitle.textContent = `${monthNames[month]} ${year}`;
  calendarGrid.innerHTML = "";
  calendarDays.innerHTML = "";
  dayNames.forEach(day => {
    const d = document.createElement("div");
    d.textContent = day;
    calendarDays.appendChild(d);
  });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.classList.add("disabled");
    calendarGrid.appendChild(empty);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.textContent = d;
    cell.addEventListener("click", () => {
      document
        .querySelectorAll(".calendar-grid div")
        .forEach(el => el.classList.remove("selected"));
      cell.classList.add("selected");
      selectedDate = `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    });
    calendarGrid.appendChild(cell);
  }
}
document.getElementById("prevMonth")?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  buildCalendar(currentDate);
});
document.getElementById("nextMonth")?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  buildCalendar(currentDate);
});
bookBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Sign in first");
  if (!selectedDate) return alert("Select a date");
  const start = document.getElementById("timeInput").value;
  const duration = Number(document.getElementById("duration").value);
  if (!start) return alert("Select a time");
  const [h, m] = start.split(":").map(Number);
  const endMinutes = h * 60 + m + duration;
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2,"0")}:${String(endMinutes % 60).padStart(2,"0")}`;
  const q = query(collection(db,"sessions"), where("date","==",selectedDate));
  const snap = await getDocs(q);
  for (const doc of snap.docs) {
    const s = doc.data();
    if (!(endTime <= s.startTime || start >= s.endTime)) {
      return alert("Time slot already booked");
    }
  }
  await addDoc(collection(db,"sessions"), {
    date: selectedDate,
    monthName: monthNames[currentDate.getMonth()],
    startTime: start,
    endTime,
    duration,
    studentId: user.uid,
    studentName: user.displayName || "Anonymous User",
    createdAt: serverTimestamp()
  });
  loadMySessions();
  loadAllSessions();
});
async function loadMySessions() {
  mySessions.innerHTML = "";
  const user = auth.currentUser;
  if (!user) return;
  userNameEl.textContent = `Welcome, ${user.displayName || user.email}`;
  const q = query(collection(db,"sessions"), where("studentId","==",user.uid));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    const s = doc.data();
    const li = document.createElement("li");
    li.textContent = `${s.monthName} ${s.date.split("-")[2]} • ${s.startTime}-${s.endTime}`;
    mySessions.appendChild(li);
  });
}
async function loadAllSessions() {
  if (!allSessionsEl) return;
  allSessionsEl.innerHTML = "";
  const snap = await getDocs(collection(db,"sessions"));
  const sessions = snap.docs
    .map(doc => doc.data())
    .sort((a, b) =>
      a.date === b.date
        ? a.startTime.localeCompare(b.startTime)
        : a.date.localeCompare(b.date)
    );
  sessions.forEach(s => {
    const li = document.createElement("li");
    const name = s.studentName ? s.studentName : "Anonymous Student";
    li.textContent = `${name} • ${s.monthName} ${s.date.split("-")[2]} • ${s.startTime}-${s.endTime}`;
    allSessionsEl.appendChild(li);
  });
}
auth.onAuthStateChanged(() => {
  buildCalendar(currentDate);
  loadMySessions();
  loadAllSessions();
});
