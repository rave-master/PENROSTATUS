import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBjYPyVv9qC88JGD8N1tnDZLT0hh1sZUtQ",
  authDomain: "locator-66521.firebaseapp.com",
  projectId: "locator-66521",
  storageBucket: "locator-66521.appspot.com",
  messagingSenderId: "322028471975",
  appId: "1:322028471975:web:ee77430c76935588187d82",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Register
window.register = function () {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Registered successfully!"))
    .catch((err) => alert(err.message));
};

// Login
window.login = function () {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Logged in successfully!"))
    .catch((err) => alert(err.message));
};

// Logout
window.logout = function () {
  signOut(auth).then(() => location.reload());
};

// Auth State
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("profile-form").classList.remove("hidden");
    document.getElementById("status-form").classList.remove("hidden");
    document.getElementById("go-dashboard").classList.remove("hidden");
  }
});

// Submit Profile
window.submitProfile = async function () {
  const name = document.getElementById("name").value.trim();
  const designation = document.getElementById("designation").value.trim();
  const photo = document.getElementById("photo").files[0];
  const user = auth.currentUser;
  if (!user) return alert("Please log in first.");
  if (!name || !designation) return alert("All fields are required.");

  let photoURL = "";
  try {
    if (photo) {
      if (!photo.type.startsWith("image/")) return alert("Only image files are allowed.");
      if (photo.size > 5 * 1024 * 1024) return alert("Max file size is 5MB.");
      const photoRef = ref(storage, `photos/${user.uid}`);
      await uploadBytes(photoRef, photo);
      photoURL = await getDownloadURL(photoRef);
    }

    await setDoc(doc(db, "users", user.uid), {
      name,
      designation,
      photoURL,
      status: {
        Monday: "",
        Tuesday: "",
        Wednesday: "",
        Thursday: "",
        Friday: "",
      },
    });

    alert("Profile saved successfully!");
  } catch (err) {
    console.error("Profile error:", err);
    alert("Failed to submit profile.");
  }
};

// Update Weekly Status
window.updateStatus = async function () {
  const user = auth.currentUser;
  if (!user) return alert("Please log in first.");
  const status = {
    Monday: document.getElementById("monday-status").value,
    Tuesday: document.getElementById("tuesday-status").value,
    Wednesday: document.getElementById("wednesday-status").value,
    Thursday: document.getElementById("thursday-status").value,
    Friday: document.getElementById("friday-status").value,
  };

  try {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { status });
    alert("Status updated!");
  } catch (err) {
    console.error("Status update failed:", err);
    alert("Failed to update status.");
  }
};
