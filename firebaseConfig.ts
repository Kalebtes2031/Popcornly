// firebaseConfig.ts
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

/**
 * Export auth and firestore instances
 * No JS config or environment variables needed
 * Auth persistence is handled automatically by RNFirebase
 */

export { auth, firestore };
export { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  orderBy, 
  limit, 
  onSnapshot, 
  deleteDoc 
} from 'firebase/firestore';
