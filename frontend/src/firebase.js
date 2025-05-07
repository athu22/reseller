import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, onValue, push, query, orderByChild, equalTo, remove, connectDatabaseEmulator } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-hot-toast';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Add connection state monitoring
const connectedRef = ref(database, '.info/connected');
onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    console.log('Connected to Firebase');
    toast.success('Connected to database');
  } else {
    console.log('Disconnected from Firebase');
    toast.error('Lost connection to database. Attempting to reconnect...');
  }
});

// Add error handling for database operations
const handleDatabaseError = (error) => {
  console.error('Firebase Database Error:', error);
  
  // Show appropriate error message based on error type
  if (error.code === 'PERMISSION_DENIED') {
    toast.error('You do not have permission to perform this action');
  } else if (error.code === 'NETWORK_ERROR') {
    toast.error('Network error. Please check your internet connection');
  } else if (error.code === 'DATABASE_ERROR') {
    toast.error('Database error. Please try again later');
  } else {
    toast.error('An error occurred. Please try again');
  }
};

// Wrap database operations with error handling
const safeDatabaseOperation = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    handleDatabaseError(error);
    throw error;
  }
};

// Create wrapped database functions
const safeSet = (ref, data) => safeDatabaseOperation(() => set(ref, data));
const safeGet = (ref) => safeDatabaseOperation(() => get(ref));
const safeUpdate = (ref, data) => safeDatabaseOperation(() => update(ref, data));
const safeRemove = (ref) => safeDatabaseOperation(() => remove(ref));

// Export all functions
export {
  auth,
  database,
  ref,
  safeSet as set,
  safeGet as get,
  safeUpdate as update,
  onValue,
  push,
  query,
  orderByChild,
  equalTo,
  safeRemove as remove
};
