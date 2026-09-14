const fs = require('fs');
let content = fs.readFileSync('src/components/WelcomeGuard.tsx', 'utf8');

// The issue is the initial state evaluation before the useEffect runs.
const stateStr = `
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/promo') {
      return true;
    }
    return localStorage.getItem('waga_welcome_v2') === 'true';
  });
`;

content = content.replace(
  /  const \[hasSeenWelcome, setHasSeenWelcome\] = useState<boolean>\(\(\) => \{\n    return localStorage.getItem\('waga_welcome_v2'\) === 'true';\n  \}\);/g,
  stateStr
);

fs.writeFileSync('src/components/WelcomeGuard.tsx', content);
