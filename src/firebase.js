import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCGtQq6fWqFcbtBf7JyokMtSDjdk6S974s",
  authDomain: "reseller-d8519.firebaseapp.com",
  databaseURL: "https://reseller-d8519-default-rtdb.firebaseio.com",
  projectId: "reseller-d8519",
  storageBucket: "reseller-d8519.appspot.com",
  messagingSenderId: "480688957188",
  appId: "1:480688957188:web:64ea5895fc5b90e43ad251",
  measurementId: "G-ESRXCMSCS5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database, ref, set, get, update, onValue };
