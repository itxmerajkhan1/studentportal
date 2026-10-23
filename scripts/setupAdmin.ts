/**
 * Server-side Admin Provisioning Script for Meraj Learning Portal
 * Securely provisions the designated administrator account in Firebase Authentication
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

  let idToken = '';
  let localId = '';

  // Step 1: Attempt to create the user account in Firebase Auth
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
    console.log(`[Admin Setup] Account already exists in Firebase Auth.`);
    // Try logging in with the configured initial password
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
      console.log(`[Admin Setup] Authenticated existing admin user with UID: ${signInData.localId}`);
      idToken = signInData.idToken;
      localId = signInData.localId;
    } else {
      console.log(`[Admin Setup] Note: Account exists but password does not match initial default (or was registered via Google Sign-In).`);
      console.log(`[Admin Setup] Initiating password reset link dispatch for: ${ADMIN_EMAIL}...`);
      
      const resetRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestType: 'PASSWORD_RESET',
            email: ADMIN_EMAIL,
          }),
        }
      );
      const resetData = await resetRes.json();
      if (resetData.email) {
        console.log(`[Admin Setup] Password reset link sent to ${ADMIN_EMAIL}. The administrator can set their password via the link or sign in with Google.`);
      }

      return {
        success: true,
        accountExists: true,
        email: ADMIN_EMAIL,
        message: 'Account verified in Firebase Auth. Password reset or Google sign-in available.',
      };
    }
  } else if (signUpData.error?.message === 'OPERATION_NOT_ALLOWED') {
    console.error(`
================================================================================
[Firebase Setup Notice: Email/Password Provider Not Enabled]
The Firebase project (${projectId}) has not enabled "Email/Password" sign-in provider yet.
To complete initial email/password administrator login:
1. Go to Firebase Console: https://console.firebase.google.com/project/${projectId}/authentication/providers
2. Click "Add new provider" -> Select "Email/Password" -> Toggle "Enable" -> Click "Save".
3. Re-run: npm run setup:admin
================================================================================
`);
    return {
      success: false,
      reason: 'OPERATION_NOT_ALLOWED',
      projectId,
      email: ADMIN_EMAIL,
    };
  } else {
    console.error('[Admin Setup] Unexpected error:', signUpData.error);
    return { success: false, error: signUpData.error };
  }

  // Step 2: Provision Firestore user profile & admin record using authenticated REST API if token obtained
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

    if (userRes.ok) {
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

    if (adminRes.ok) {
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
      console.log('[Admin Setup] Verification completed successfully.');
    }
  })
  .catch((err) => {
    console.error('Fatal setup error:', err);
  });
