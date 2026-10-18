// Server-side Firebase Admin SDK setup
import * as admin from 'firebase-admin';

export function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (projectId && clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }

  // Fallback for local emulator or development without admin certs
  return admin.initializeApp({
    projectId: projectId || 'mama-thes-store',
  });
}

export const getAdminAuth = () => getFirebaseAdmin().auth();
export const getAdminFirestore = () => getFirebaseAdmin().firestore();
export const getAdminStorage = () => getFirebaseAdmin().storage();
