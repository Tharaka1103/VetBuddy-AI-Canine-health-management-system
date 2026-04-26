import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCMObmUJgaVw5Hmq5LpbA1nMe23IAqgwa0",
  authDomain: "dog-belt-6b92d.firebaseapp.com",
  databaseURL: "https://dog-belt-6b92d-default-rtdb.firebaseio.com",
  projectId: "dog-belt-6b92d",
};

console.log("[Firebase] Initializing with config:", firebaseConfig);

let app: FirebaseApp;
let db: Database;

if (typeof window !== "undefined") {
  try {
    if (!getApps().length) {
      console.log("[Firebase] No existing app, initializing new Firebase app");
      app = initializeApp(firebaseConfig);
      console.log("[Firebase] Firebase app initialized successfully");
    } else {
      console.log("[Firebase] Using existing Firebase app");
      app = getApps()[0];
    }
    db = getDatabase(app);
    console.log("[Firebase] Database instance created:", db);
  } catch (error) {
    console.error("[Firebase] Error initializing Firebase:", error);
  }
} else {
  console.log("[Firebase] Running on server, skipping Firebase initialization");
}

export { db };
