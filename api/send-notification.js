import crypto from 'crypto';

// --- Google OAuth2 Token Generation (no firebase-admin needed) ---
async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
    if (privateKey.startsWith("'") && privateKey.endsWith("'")) privateKey = privateKey.slice(1, -1);
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: process.env.FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsigned = `${encode(header)}.${encode(payload)}`;
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsigned);
  const signature = sign.sign(privateKey, 'base64url');
  
  const jwt = `${unsigned}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error('Failed to get access token: ' + JSON.stringify(tokenData));
  }
  return tokenData.access_token;
}

// --- Firestore REST API ---
async function getTokensFromFirestore(accessToken, projectId) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/fcmTokens?pageSize=500`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  
  const tokens = [];
  if (data.documents) {
    data.documents.forEach(doc => {
      const tokenField = doc.fields?.token?.stringValue;
      if (tokenField) tokens.push(tokenField);
    });
  }
  return tokens;
}

async function storeNotificationHistory(accessToken, projectId, title, body, type) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/notifications`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          title: { stringValue: title },
          body: { stringValue: body },
          type: { stringValue: type || 'General' },
          timestamp: { stringValue: new Date().toISOString() },
        },
      }),
    });
  } catch (e) {
    console.warn('Failed to store notification history:', e);
  }
}

// --- FCM v1 API ---
async function sendFCMNotification(accessToken, projectId, token, notification, webpush, data) {
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        token,
        notification,
        webpush,
        data,
      },
    }),
  });
  return res.ok;
}

// --- Main Handler ---
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { title, body, type, link } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Missing title or body' });
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      return res.status(500).json({ success: false, message: 'Missing Firebase environment variables' });
    }

    // Step 1: Get OAuth2 access token
    const accessToken = await getAccessToken();

    // Step 2: Store notification in Firestore history
    await storeNotificationHistory(accessToken, projectId, title, body, type);

    // Step 3: Get all FCM tokens from Firestore
    const tokens = await getTokensFromFirestore(accessToken, projectId);

    if (tokens.length === 0) {
      return res.status(200).json({ success: true, message: 'No registered devices found.' });
    }

    const origin = req.headers.origin || 'https://' + req.headers.host;

    const notification = {
      title: title.length > 100 ? title.substring(0, 97) + '...' : title,
      body: body,
      image: `${origin}/logo192.png` // Using image field for FCM v1 native display
    };

    const webpush = {
      notification: {
        icon: `${origin}/logo192.png`,
        badge: `${origin}/logo192.png`,
        image: `${origin}/logo192.png`,
        requireInteraction: true,
      },
      fcm_options: {
        link: link || `${origin}/`,
      },
    };

    const data = {
      link: link || `${origin}/`,
      icon: `${origin}/logo192.png` // Included in data payload for SW interception
    };

    // Step 4: Send to each token (FCM v1 API requires one-at-a-time)
    let successCount = 0;
    let failureCount = 0;

    const sendPromises = tokens.map(async (token) => {
      try {
        const ok = await sendFCMNotification(accessToken, projectId, token, notification, webpush, data);
        if (ok) successCount++;
        else failureCount++;
      } catch {
        failureCount++;
      }
    });

    await Promise.all(sendPromises);

    return res.status(200).json({
      success: true,
      message: 'Notifications sent successfully!',
      successCount,
      failureCount,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
