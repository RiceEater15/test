import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
const COURSES = {
  ap_human_geography: 14,
  geometry: 10
};
function updateDashboardProgress(userData) {
  const progress = userData.progress || {};
  let totalCompleted = 0;
  let totalUnits = 0;
  Object.keys(COURSES).forEach(courseId => {
    const totalUnitsCourse = COURSES[courseId];
    const completed =
      progress?.[courseId]?.completedUnits || [];
    const percent =
      totalUnitsCourse === 0
        ? 0
        : Math.round((completed.length / totalUnitsCourse) * 100);
    const card = document.querySelector(
      `.card[data-course="${courseId}"]`
    );
    if (!card) return;
    const bar = card.querySelector(".progress");
    const text = card.querySelector(`#${courseId.replace("_","-")}-percent`) ||
                 card.querySelector("p");
    if (bar) {
      bar.style.width = percent + "%";
      bar.style.transition = "width 0.5s ease";
    }
    if (text) {
      text.textContent =
        `${completed.length} of ${totalUnitsCourse} lessons complete`;
    }
    totalCompleted += completed.length;
    totalUnits += totalUnitsCourse;
  });
  const overallPercent =
    totalUnits === 0
      ? 0
      : Math.round((totalCompleted / totalUnits) * 100);
  const overallBar =
    document.querySelector(".container .progress");
  const overallText =
    document.querySelector(".container section p");
  if (overallBar) {
    overallBar.style.width = overallPercent + "%";
    overallBar.style.transition = "width 0.5s ease";
  }
  if (overallText) {
    overallText.textContent =
      `${overallPercent}% of assigned activities completed`;
  }
}
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/account.html";
    return;
  }
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;
    updateDashboardProgress(snap.data());
  } catch (error) {
    console.error(error);
  }
});
