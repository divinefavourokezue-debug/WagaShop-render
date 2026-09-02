const fs = require('fs');
let content = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

// Fix duplicate className
const imgRegex = /className="cursor-zoom-in object-contain w-full h-full"([\s\S]*?)className="w-full h-full object-contain cursor-grab active:cursor-grabbing"/;
content = content.replace(imgRegex, 'className="w-full h-full object-contain cursor-grab active:cursor-grabbing cursor-zoom-in"$1');

// Fix whatsappUrl
// Let's add it at the beginning of the return statement.
const returnRegex = /return \(\s*<div className="grid/;
const whatsappLogic = `  const phone = (product?.whatsappNumber || '22666317245').replace(/[^0-9]/g, '');
  const message = encodeURIComponent(\`Bonjour, je suis intéressé par votre annonce sur WAGA SHOP: \${product?.name} (\${product ? formatPrice(product.price) : ''})\`);
  const whatsappUrl = \`https://wa.me/\${phone}?text=\${message}\`;

  return (
    <div className="grid`;

content = content.replace(returnRegex, whatsappLogic);

fs.writeFileSync('src/pages/ProductPage.tsx', content, 'utf8');
