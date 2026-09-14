import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function fixDB() {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    let updated = 0;
    for (const d of snapshot.docs) {
      const data = d.data();
      if (!data.city) {
        await updateDoc(doc(db, 'products', d.id), {
          city: data.location || 'Ouagadougou'
        });
        updated++;
      }
    }
    console.log(`Updated ${updated} products.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fixDB();
