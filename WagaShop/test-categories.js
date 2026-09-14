import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function testQuery() {
  const snapshot = await getDocs(collection(db, 'products'));
  const cats = new Set();
  snapshot.docs.forEach(d => cats.add(d.data().category));
  console.log("Categories:", Array.from(cats));
  process.exit(0);
}
testQuery();
