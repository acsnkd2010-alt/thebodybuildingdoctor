#!/usr/bin/env node
/**
 * Set password and administrator role on a Firebase Auth user.
 * Usage: node scripts/set-admin-user.cjs <email> <password>
 */
const { readFileSync } = require('fs');
const { resolve } = require('path');
const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx);
      const value = trimmed.slice(idx + 1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

async function main() {
  loadEnvLocal();

  const email = process.argv[2]?.trim();
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node scripts/set-admin-user.cjs <email> <password>');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('Password must be at least 6 characters.');
    process.exit(1);
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath) {
    console.error('GOOGLE_APPLICATION_CREDENTIALS missing in web/.env.local');
    process.exit(1);
  }

  const serviceAccount = JSON.parse(
    readFileSync(resolve(__dirname, '..', credPath), 'utf-8'),
  );

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  }

  const auth = getAuth();
  const user = await auth.getUserByEmail(email);
  const existingClaims = user.customClaims ?? {};
  const roles = ['administrator', 'media_channel'];

  await auth.updateUser(user.uid, { password });
  await auth.setCustomUserClaims(user.uid, { ...existingClaims, roles });

  const updated = await auth.getUser(user.uid);
  console.log('User updated successfully');
  console.log('  Email:', updated.email);
  console.log('  UID:', updated.uid);
  console.log('  Roles:', roles.join(', '));
  console.log('  Password: changed (sign out and sign in again to refresh token claims)');
}

main().catch((error) => {
  console.error('Failed:', error.message);
  process.exit(1);
});
