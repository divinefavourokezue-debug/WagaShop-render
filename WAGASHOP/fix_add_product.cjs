const fs = require('fs');
let content = fs.readFileSync('src/pages/seller/AddProduct.tsx', 'utf8');

const regex = /try \{\s*await Promise\.race\(\[savePromise, timeoutPromise\]\);\s*\} catch \(saveErr\) \{/;
const replacement = `let docRefId = null;
      try {
        const result = await Promise.race([savePromise, timeoutPromise]) as any;
        docRefId = result?.id;
      } catch (saveErr) {`;

content = content.replace(regex, replacement);

const docRefRegex = /const productParam = docRef \? `&productId=\$\{docRef\.id\}` : '';/;
const docRefReplacement = `const productParam = docRefId ? \`&productId=\${docRefId}\` : '';`;

content = content.replace(docRefRegex, docRefReplacement);

fs.writeFileSync('src/pages/seller/AddProduct.tsx', content, 'utf8');
