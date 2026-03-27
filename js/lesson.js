import { auth, db } from "./firebase.js";
import {
  doc,
  setDoc,
  getDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
const params = new URLSearchParams(window.location.search);
const course = params.get("course");
const unit = params.get("unit");
if (!course || !unit) {
  document.body.innerHTML = "Lesson not found.";
}
async function loadLesson() {
  const res = await fetch("./lessoninfo.json");
  const data = await res.json();
  const lesson = data?.[course]?.[unit];
  if (!lesson) {
    document.body.innerHTML = "Lesson not found.";
    return;
  }
  document.getElementById("lesson-title").textContent =
    lesson.title;
  document.getElementById("lesson-video").src =
    lesson.video;
}
loadLesson();
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("markCompleteBtn");
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const completed =
      snap.data()?.progress?.[course]?.completedUnits || [];
    if (completed.includes(unit)) {
      btn.textContent = "Completed";
      btn.disabled = true;
    }
    btn.onclick = async () => {
      await setDoc(userRef, {
        progress: {
          [course]: {
            completedUnits: arrayUnion(unit)
          }
        }
      }, { merge: true });
      btn.textContent = "Completed";
      btn.disabled = true;
    };
  });
});
