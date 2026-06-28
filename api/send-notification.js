import admin from './_adminInit.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { title, body, type, link } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Missing title or body' });
    }

    const db = admin.firestore();
    
    // Store the notification in Firestore for history
    try {
      await db.collection('notifications').add({
        title,
        body,
        type: type || 'General',
        timestamp: new Date().toISOString()
      });
    } catch (dbErr) {
      console.warn('Failed to store notification history:', dbErr);
      // Continue anyway, sending push is more important
    }
    
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

    const origin = req.headers.origin || 'https://' + req.headers.host;
    
    const payload = {
      notification: {
        title: title.length > 100 ? title.substring(0, 97) + '...' : title,
        body: body,
        image: `${origin}/photos/About.jpeg`,
      },
      webpush: {
        notification: {
          icon: `${origin}/photos/About.jpeg`,
          badge: `${origin}/photos/About.jpeg`,
          image: `${origin}/photos/About.jpeg`,
          requireInteraction: true
        },
        fcm_options: {
          link: link || `${origin}/`
        }
      },
      data: {
        link: link || `${origin}/`
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
