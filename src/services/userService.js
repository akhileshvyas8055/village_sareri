import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/** Keep the Firestore directory in sync for every authenticated app user. */
export async function syncAuthenticatedUser(user) {
  if (!user?.uid) return;

  const now = new Date().toISOString();
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    creationTime: user.metadata?.creationTime || now,
    lastSignInTime: user.metadata?.lastSignInTime || now,
  }, { merge: true });
}
