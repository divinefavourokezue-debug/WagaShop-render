import fs from 'fs';
let content = fs.readFileSync('src/pages/seller/Dashboard.tsx', 'utf-8');
content = content.replace(
  "fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];",
  "fetched = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) })) as Product[];\nfetched.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());"
);
content = content.replace(
  "fetched = JSON.parse(cached);",
  "fetched = JSON.parse(cached);\nfetched.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());"
);
fs.writeFileSync('src/pages/seller/Dashboard.tsx', content);
