import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// App's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBwyHTp2Cmk7hgSjA5cUJq12LIvnO54ddI',
  authDomain: 'chatter-d15b3.firebaseapp.com',
  projectId: 'chatter-d15b3',
  storageBucket: 'chatter-d15b3.firebasestorage.app',
  messagingSenderId: '469493975732',
  appId: '1:469493975732:web:875912b3183464626465e1',
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Provide AsyncStorage for Auth
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { app, auth, db };
