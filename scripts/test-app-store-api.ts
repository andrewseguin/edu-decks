import * as fs from 'fs';
import * as path from 'path';
import jwt from 'jsonwebtoken';

const keyPath = path.join(process.cwd(), 'AuthKey_KFTN8X27Y8.p8');
const privateKey = fs.readFileSync(keyPath, 'utf8');

const issuerId = '77f3dd98-3102-488d-bc3c-9208c423bed1';
const keyId = 'KFTN8X27Y8';

function generateToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: issuerId,
    iat: now,
    exp: now + 1200, // 20 minutes
    aud: 'appstoreconnect-v1',
  };

  return jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      kid: keyId,
      typ: 'JWT',
    },
  });
}

async function testConnection() {
  const token = generateToken();
  console.log("🔑 Generated JWT Token for App Store Connect API");

  const res = await fetch("https://api.appstoreconnect.apple.com/v1/apps", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(`❌ Connection failed with status ${res.status}:`, await res.text());
    process.exit(1);
  }

  const data = await res.json();
  console.log("✅ Connection Successful! Found Apps:");
  data.data.forEach((app: any) => {
    console.log(`  📱 App ID: ${app.id} | Name: ${app.attributes.name} | Bundle ID: ${app.attributes.bundleId}`);
  });
}

testConnection().catch(console.error);
