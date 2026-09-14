import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function testQuery() {
  const snapshot = await getDocs(collection(db, 'products'), limit(10));
  snapshot.docs.forEach(doc => console.log(doc.data().city, doc.data().location));
  process.exit(0);
}
testQuery();
