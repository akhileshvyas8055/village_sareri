import fetch from 'node-fetch';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
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
    if (!tokenData.access_token) throw new Error('Token generation failed');
    const accessToken = tokenData.access_token;
    console.log('Got access token');
    
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    
    const reqBody = {
      message: {
        topic: 'test', // sending to dummy topic to see if payload is accepted
        notification: {
          title: 'Test',
          body: 'Test body'
        },
        webpush: {
          notification: {
            requireInteraction: true
          }
        }
      }
    };
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqBody),
    });
    
    const json = await res.json();
    console.log('Response:', json);
  } catch (e) {
    console.error(e);
  }
}
test();
