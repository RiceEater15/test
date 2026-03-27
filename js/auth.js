import { auth, googleProvider } from './firebase.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  signInWithPopup,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const logoutBtn = document.getElementById('logout-btn');
const toggleAuth = document.getElementById('toggle-auth');
const toggleText = document.getElementById('toggle-text');
const navSign = document.getElementById('nav-sign');
const googleBtn = document.getElementById('google-btn');
const displayNameInput = document.getElementById('displayNameInput');
const saveNameBtn = document.getElementById('saveNameBtn');
const currentName = document.getElementById('currentName');
let isSignUp = true;
if (toggleAuth) {
  toggleAuth.addEventListener('click', () => {
    isSignUp = !isSignUp;
    submitBtn.textContent = isSignUp ? "Sign Up" : "Sign In";
    toggleText.innerHTML = isSignUp
      ? 'Already have an account? <span class="span" id="toggle-auth">Sign In</span>'
      : 'Don\'t have an account? <span class="span" id="toggle-auth">Sign Up</span>';
  });
}
const authForm = document.getElementById('auth-form');
if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Signed in!");
      }
      emailInput.value = '';
      passwordInput.value = '';
    } catch (err) {
      alert(err.message);
    }
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    alert("Logged out!");
  });
}
if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      alert(`Signed in as ${result.user.email}`);
    } catch (err) {
      alert(err.message);
    }
  });
}
onAuthStateChanged(auth, user => {
  if (user) {
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (navSign) navSign.textContent = 'Account';
    if (currentName) {
      currentName.textContent =
        "Current Name: " + (user.displayName || user.email);
    }
    if (saveNameBtn) {
      saveNameBtn.onclick = async () => {
        const newName = displayNameInput.value.trim();
        if (!newName) {
          alert("Name cannot be empty.");
          return;
        }
        try {
          await updateProfile(user, {
            displayName: newName
          });
          currentName.textContent =
            "Current Name: " + newName;
          displayNameInput.value = '';
          saveNameBtn.textContent = "âœ…";
          setTimeout(() => {
            saveNameBtn.textContent = "Save Name";
          }, 2000);
        } catch (err) {
          alert(err.message);
        }
      };
    }
  } else {
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (navSign) navSign.textContent = 'Account';
  }
});
