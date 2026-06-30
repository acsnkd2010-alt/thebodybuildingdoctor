/**
 * Add domains to Firebase Auth authorized domains (required for Google login on custom hosts).
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json node scripts/add-auth-domains.cjs
 *   GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json node scripts/add-auth-domains.cjs app.example.com
 */
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

const projectId = process.env.FIREBASE_PROJECT_ID || 'thebodybuildingdoctor';

const DEFAULT_DOMAINS = [
  'localhost',
  'thebodybuildingdoctor.firebaseapp.com',
  'thebodybuildingdoctor.web.app',
  'app.thebodybuildingdoctor.in',
  'thebodybuildingdoctor.in',
  'app.thrillpharma.de',
  'thrillpharma.de',
];

async function main() {
  const extra = process.argv.slice(2).map((d) => d.trim()).filter(Boolean);
  const domains = [...new Set([...DEFAULT_DOMAINS, ...extra])];

  const credPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(__dirname, '..', 'serviceAccountKey.json');

  if (!fs.existsSync(credPath)) {
    throw new Error(`Missing credentials at ${credPath}`);
  }

  const auth = new GoogleAuth({
    keyFile: credPath,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=authorizedDomains`;

  const res = await client.request({
    url,
    method: 'PATCH',
    data: { authorizedDomains: domains },
  });

  console.log('Authorized domains updated:');
  for (const domain of res.data.authorizedDomains || []) {
    console.log(`  - ${domain}`);
  }
}

main().catch((err) => {
  console.error(err.response?.data || err.message || err);
  process.exit(1);
});
