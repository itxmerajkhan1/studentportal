/**
 * Server-side Admin Provisioning Script for Meraj Learning Portal
 * Securely provisions the initial administrator account in Firebase Authentication
 * and registers their admin role in Cloud Firestore.
 */

import fs from 'fs';
import path from 'path';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  console.error('Error: firebase-applet-config.json not found.');
  process.exit(1);
}

const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const apiKey = firebaseConfig.apiKey;
const firestoreDbId = firebaseConfig.firestoreDatabaseId;
const projectId = firebaseConfig.projectId;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'itxmerajkhan3109@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || 'MK123456MK';

async function setupAdministrator() {
  console.log(`[Admin Setup] Initializing administrator account for: ${ADMIN_EMAIL}`);

  // Step 1: Attempt to create the user account in Firebase Auth
  let idToken = '';
  let localId = '';

  const signUpRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        returnSecureToken: true,
      }),
    }
  );

  const signUpData = await signUpRes.json();

  if (signUpData.localId) {
    console.log(`[Admin Setup] Successfully created Firebase Auth user with UID: ${signUpData.localId}`);
    idToken = signUpData.idToken;
    localId = signUpData.localId;
  } else if (signUpData.error?.message === 'EMAIL_EXISTS') {
    console.log(`[Admin Setup] Account already exists in Firebase Auth. Signing in to retrieve credentials...`);
    const signInRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          returnSecureToken: true,
        }),
      }
    );
    const signInData = await signInRes.json();
    if (signInData.localId) {
      console.log(`[Admin Setup] Authenticated existing user with UID: ${signInData.localId}`);
      idToken = signInData.idToken;
      localId = signInData.localId;
    } else {
      console.error('[Admin Setup] Failed to authenticate existing user:', signInData.error?.message);
      process.exit(1);
    }
  } else if (signUpData.error?.message === 'OPERATION_NOT_ALLOWED') {
    console.error(`
================================================================================
[Firebase Setup Notice: Email/Password Provider Not Enabled]
The Firebase project (${projectId}) has not enabled "Email/Password" sign-in provider yet.
To complete initial email/password administrator login:
1. Go to Firebase Console: https://console.firebase.google.com/project/${projectId}/authentication/providers
2. Click "Add new provider" -> Select "Email/Password" -> Toggle "Enable" -> Click "Save".
3. Re-run: npx tsx scripts/setupAdmin.ts
Alternatively, signing in with Google using ${ADMIN_EMAIL} is already active.
================================================================================
`);
    return {
      success: false,
      reason: 'OPERATION_NOT_ALLOWED',
      projectId,
      email: ADMIN_EMAIL,
    };
  } else {
    console.error('[Admin Setup] Unexpected error creating user:', signUpData.error);
    process.exit(1);
  }

  // Step 2: Provision Firestore user profile & admin record using authenticated REST API
  if (localId && idToken) {
    const firestoreBase = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDbId}/documents`;

    const userDocPayload = {
      fields: {
        uid: { stringValue: localId },
        fullName: { stringValue: 'Meraj Khan (Administrator)' },
        email: { stringValue: ADMIN_EMAIL },
        phoneNumber: { stringValue: '+92 300 1234567' },
        academicLevel: { stringValue: 'Super Administrator' },
        role: { stringValue: 'admin' },
        status: { stringValue: 'approved' },
        registeredAt: { stringValue: new Date().toISOString() },
        updatedAt: { stringValue: new Date().toISOString() },
      },
    };

    const adminDocPayload = {
      fields: {
        uid: { stringValue: localId },
        email: { stringValue: ADMIN_EMAIL },
        role: { stringValue: 'admin' },
        createdAt: { stringValue: new Date().toISOString() },
      },
    };

    // Write to /users/{localId}
    const userRes = await fetch(`${firestoreBase}/users/${localId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(userDocPayload),
    });

    if (!userRes.ok) {
      console.warn('[Admin Setup] Notice writing user document:', await userRes.text());
    } else {
      console.log(`[Admin Setup] Registered /users/${localId} as role: "admin", status: "approved"`);
    }

    // Write to /admins/{localId}
    const adminRes = await fetch(`${firestoreBase}/admins/${localId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(adminDocPayload),
    });

    if (!adminRes.ok) {
      console.warn('[Admin Setup] Notice writing admin document:', await adminRes.text());
    } else {
      console.log(`[Admin Setup] Registered /admins/${localId} record in Firestore.`);
    }

    console.log(`[Admin Setup] Administrator account successfully provisioned and verified!`);
    return {
      success: true,
      uid: localId,
      email: ADMIN_EMAIL,
    };
  }
}

setupAdministrator()
  .then((res) => {
    if (res && res.success) {
      console.log('Setup finished with success.');
    }
  })
  .catch((err) => {
    console.error('Fatal setup error:', err);
  });
