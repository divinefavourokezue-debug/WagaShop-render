import fs from 'fs';

let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf-8');

// Replace in fetchData
content = content.replace(
  "let qBuilder: any[] = [collection(db, 'products')];",
  "let qBuilder: any[] = [];"
);
content = content.replace(
  "const q = query(...qBuilder);",
  "const q = query(collection(db, 'products'), ...(qBuilder as any[]));"
);

// We need to do it twice because there are two instances (one in loadMore)
content = content.replace(
  "let qBuilder: any[] = [collection(db, 'products')];",
  "let qBuilder: any[] = [];"
);
content = content.replace(
  "const q = query(...qBuilder);",
  "const q = query(collection(db, 'products'), ...(qBuilder as any[]));"
);

// Fix spread TS error ...doc.data()
// If doc.data() is DocumentData, we cast it to any or object to spread.
content = content.replace(
  /\.\.\.doc\.data\(\)/g,
  "...(doc.data() as object)"
);


fs.writeFileSync('src/pages/HomePage.tsx', content);
