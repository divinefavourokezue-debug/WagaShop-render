import fs from 'fs';

let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf-8');

// Add startAfter and DocumentData
content = content.replace(
  "import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';",
  "import { collection, query, orderBy, limit, getDocs, startAfter, DocumentData } from 'firebase/firestore';"
);

// Add state variables for pagination
content = content.replace(
  "  const [loading, setLoading] = useState(() => getInitialProductsSync().length === 0);",
  "  const [loading, setLoading] = useState(() => getInitialProductsSync().length === 0);\n  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);\n  const [hasMore, setHasMore] = useState(true);\n  const [loadingMore, setLoadingMore] = useState(false);"
);

// Update limit to 24 in the initial query
content = content.replace(
  "const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(100));",
  "const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(24));"
);

// Update the snapshot processing to set lastVisible
const snapshotOld = `        const snapshot = await getDocs(q);
        fetchedProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        fetchSucceeded = true;`;

const snapshotNew = `        const snapshot = await getDocs(q);
        fetchedProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        if (snapshot.docs.length > 0) {
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          setHasMore(snapshot.docs.length === 24);
        } else {
          setHasMore(false);
        }
        fetchSucceeded = true;`;

content = content.replace(snapshotOld, snapshotNew);

// Define loadMore function
const loadMoreFn = `
  const loadMore = async () => {
    if (!lastVisible || loadingMore) return;
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(24)
      );
      
      const snapshot = await getDocs(q);
      const newProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setProducts(prev => {
          const combined = [...prev, ...newProducts];
          // deduplicate by id just in case
          const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
          saveProductsCache(unique);
          return unique;
        });
        setHasMore(snapshot.docs.length === 24);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setLoadingMore(false);
    }
  };
`;

// Insert loadMore function after fetchData
content = content.replace(
  "  useEffect(() => {",
  loadMoreFn + "\n  useEffect(() => {"
);

fs.writeFileSync('src/pages/HomePage.tsx', content);
