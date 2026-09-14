import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function testQuery() {
  try {
    let qBuilder = [collection(db, 'products')];
    qBuilder.push(where('category', 'in', ['Art & Artisanat']));
    qBuilder.push(where('city', '==', 'Ouagadougou'));
    qBuilder.push(orderBy('createdAt', 'desc'));
    qBuilder.push(limit(5));
    
    const q = query(...qBuilder);
    const snapshot = await getDocs(q);
    console.log("Success! size:", snapshot.size);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

testQuery();
