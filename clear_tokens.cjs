require('dotenv').config();
const admin = require('firebase-admin');

const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  })
});

const db = admin.firestore();

async function clearTokens() {
  console.log('Clearing old tokens...');
  const snapshot = await db.collection('fcmTokens').get();
  
  if (snapshot.empty) {
    console.log('No tokens found.');
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Successfully deleted ${snapshot.size} old tokens.`);
  process.exit(0);
}

clearTokens().catch(console.error);
