import fs from 'fs';

let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf-8');

// 1. We need to update fetchData and loadMore to use selectedCategory and selectedLocation
// To do this, we modify the query building part.

const fetchOld = `    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(24));`;

const fetchNew = `    try {
      let qBuilder = [collection(db, 'products')];
      if (selectedCategory) {
        // Special case for 'Services Digitaux' mapping
        const catValue = selectedCategory === 'Services Digitaux' ? 'services-digitaux' : selectedCategory;
        qBuilder.push(where('category', 'in', [catValue, selectedCategory]));
      }
      if (selectedLocation && selectedLocation !== 'Toutes') {
        qBuilder.push(where('city', '==', selectedLocation));
      }
      
      qBuilder.push(orderBy('createdAt', 'desc'));
      qBuilder.push(limit(24));
      
      const q = query(...qBuilder);`;

content = content.replace(fetchOld, fetchNew);

// Add 'where' to imports if not present
if (!content.includes("where,")) {
  content = content.replace("orderBy, limit,", "orderBy, limit, where,");
}

// 2. Do the same for loadMore
const loadMoreOld = `      const q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(24)
      );`;

const loadMoreNew = `      let qBuilder = [collection(db, 'products')];
      if (selectedCategory) {
        const catValue = selectedCategory === 'Services Digitaux' ? 'services-digitaux' : selectedCategory;
        qBuilder.push(where('category', 'in', [catValue, selectedCategory]));
      }
      if (selectedLocation && selectedLocation !== 'Toutes') {
        qBuilder.push(where('city', '==', selectedLocation));
      }
      qBuilder.push(orderBy('createdAt', 'desc'));
      qBuilder.push(startAfter(lastVisible));
      qBuilder.push(limit(24));
      
      const q = query(...qBuilder);`;

content = content.replace(loadMoreOld, loadMoreNew);

// 3. We need to trigger fetchData whenever selectedCategory or selectedLocation changes.
// Currently we have:
//   useEffect(() => {
//     setRecentProducts(getRecentlyViewed());
//     fetchData();
//   }, []);
// We want to change it to depend on selectedCategory and selectedLocation

const useEffOld = `  useEffect(() => {
    setRecentProducts(getRecentlyViewed());
    fetchData();
  }, []);`;

const useEffNew = `  // Fetch data on mount AND when category/location filters change
  useEffect(() => {
    setRecentProducts(getRecentlyViewed());
    setProducts([]); // Clear existing to show loading state for new category
    setLoading(true);
    fetchData(false);
  }, [selectedCategory, selectedLocation]);`;

content = content.replace(useEffOld, useEffNew);

fs.writeFileSync('src/pages/HomePage.tsx', content);
