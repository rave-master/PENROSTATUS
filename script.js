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
  collection,
  getDocs,
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
  measurementId: "G-S87YVN1RX4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

window.register = function () {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Registered successfully!"))
    .catch((err) => alert(err.message));
};

window.login = function () {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => alert("Logged in successfully!"))
    .catch((err) => alert(err.message));
};

window.logout = function () {
  signOut(auth)
    .then(() => location.reload())
    .catch((err) => alert(err.message));
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("profile-form").classList.remove("hidden");
    document.getElementById("status-form").classList.remove("hidden");
    document.getElementById("go-dashboard").classList.remove("hidden");
  }
});

window.submitProfile = async function () {
  const name = document.getElementById("name").value.trim();
  const designation = document.getElementById("designation").value.trim();
  const photo = document.getElementById("photo").files[0];
  const user = auth.currentUser;

  if (!user) return alert("Please log in first.");
  if (!name || !designation) return alert("Name and Designation are required.");

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
  } catch (error) {
    console.error("Error saving profile:", error);
    alert("Error submitting profile. Please try again.");
  }
};

window.updateStatus = async function () {
  const day = document.getElementById("day").value;
  const status = document.getElementById("status").value;
  const user = auth.currentUser;

  if (!user) return alert("Please log in first.");

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return alert("User profile not found.");

    const userData = userSnap.data();
    const updatedStatus = {
      ...userData.status,
      [day]: status,
    };

    await updateDoc(userRef, { status: updatedStatus });

    alert("Status updated!");
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Failed to update status.");
  }
};
