import admin from 'firebase-admin';

// Initialize Firebase Admin if it hasn't been initialized yet
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newlines from environment variables
        privateKey: process.env.FIREBASE_PRIVATE_KEY 
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
          : undefined,
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Missing title or body' });
    }

    const db = admin.firestore();
    
    // Fetch all user tokens from Firestore
    const tokensSnapshot = await db.collection('fcmTokens').get();
    const tokens = [];
    tokensSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.token) {
        tokens.push(data.token);
      }
    });

    if (tokens.length === 0) {
      return res.status(200).json({ success: true, message: 'No registered devices found.' });
    }

    // FCM sendEachForMulticast accepts maximum 500 tokens at a time
    const maxTokens = tokens.slice(0, 500);

    const payload = {
      notification: {
        title: title,
        body: body,
      },
      tokens: maxTokens,
    };

    // Send notifications to all devices
    const response = await admin.messaging().sendEachForMulticast(payload);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Notifications sent successfully!', 
      successCount: response.successCount,
      failureCount: response.failureCount 
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
}
