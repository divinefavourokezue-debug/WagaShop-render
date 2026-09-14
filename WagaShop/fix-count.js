import fs from 'fs';

let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf-8');

// Add getCountFromServer to imports
content = content.replace(
  "startAfter, DocumentData } from 'firebase/firestore';",
  "startAfter, DocumentData, getCountFromServer } from 'firebase/firestore';"
);

// Add state for totalCount
content = content.replace(
  "const [loadingMore, setLoadingMore] = useState(false);",
  "const [loadingMore, setLoadingMore] = useState(false);\n  const [totalCount, setTotalCount] = useState<number | null>(null);"
);

// Update fetchData to fetch count
const fetchOld = `      qBuilder.push(orderBy('createdAt', 'desc'));
      qBuilder.push(limit(24));
      
      const q = query(collection(db, 'products'), ...(qBuilder as any[]));`;

const fetchNew = `      qBuilder.push(orderBy('createdAt', 'desc'));
      
      // Get exact count for this query
      try {
        const countQuery = query(collection(db, 'products'), ...(qBuilder as any[]));
        const countSnap = await getCountFromServer(countQuery);
        setTotalCount(countSnap.data().count);
      } catch (e) {
        console.warn("Could not get count", e);
      }

      qBuilder.push(limit(24));
      const q = query(collection(db, 'products'), ...(qBuilder as any[]));`;

content = content.replace(fetchOld, fetchNew);

// Update UI to show totalCount instead of filteredProducts.length
const uiOld = `{filteredProducts.length} {t('articles')}`;
const uiNew = `{searchTerm ? filteredProducts.length : (totalCount !== null ? totalCount : filteredProducts.length)} {t('articles')}`;

content = content.replace(uiOld, uiNew);

fs.writeFileSync('src/pages/HomePage.tsx', content);
