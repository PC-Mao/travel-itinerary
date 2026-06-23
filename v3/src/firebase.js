import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA6O8C1z_Pl_0rupd1QD9fl2pFNkNZc4zg",
  authDomain: "stellarvoyage-aad4c.firebaseapp.com",
  projectId: "stellarvoyage-aad4c",
  storageBucket: "stellarvoyage-aad4c.firebasestorage.app",
  messagingSenderId: "352074733674",
  appId: "1:352074733674:web:d0170acfd6b54990791213",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)

// v3.1 uses a separate Firestore collection to isolate data from v3
export const USERS_COL = 'v3.1_users'
