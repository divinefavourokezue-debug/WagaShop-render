import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function testInsert() {
  try {
    await addDoc(collection(db, 'products'), {
      category: 'Art & Artisanat',
      city: 'Ouagadougou',
      createdAt: new Date().toISOString()
    });
    console.log("Success inserting!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

testInsert();
