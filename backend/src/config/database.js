import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const { COGNODB_URI, COGNODB_USERNAME, COGNODB_PASSWORD } = process.env;

let driver = null;
let connectivityVerified = false;

export function getDriver() {
  if (!COGNODB_URI || !COGNODB_PASSWORD) {
    throw new Error('Missing CognoDB configuration. Set COGNODB_URI and COGNODB_PASSWORD in backend/.env');
  }

  if (!driver) {
    driver = neo4j.driver(
      COGNODB_URI,
      neo4j.auth.basic(COGNODB_USERNAME || 'cognodb', COGNODB_PASSWORD),
      {
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 30000,
      }
    );
  }

  return driver;
}

export async function verifyConnectivity() {
  const d = getDriver();
  await d.verifyConnectivity();
  connectivityVerified = true;
  return true;
}

export function isConnected() {
  return connectivityVerified;
}

export function getSession(mode = neo4j.session.READ) {
  return getDriver().session({ defaultAccessMode: mode });
}

export async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
    connectivityVerified = false;
  }
}

export async function runQuery(cypher, params = {}, mode = neo4j.session.READ) {
  const session = getSession(mode);
  try {
    const result = await session.run(cypher, params);
    return result;
  } finally {
    await session.close();
  }
}

export default { getDriver, verifyConnectivity, isConnected, getSession, closeDriver, runQuery };
