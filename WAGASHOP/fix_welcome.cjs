const fs = require('fs');
let content = fs.readFileSync('src/components/WelcomeGuard.tsx', 'utf8');

// If the current path is /promo, we should skip the welcome screen completely
const effectStr = `
  useEffect(() => {
    if (window.location.pathname === '/promo') {
      setHasSeenWelcome(true);
      localStorage.setItem('waga_welcome_v2', 'true');
    }
  }, []);
`;

content = content.replace(
  "const navigate = useNavigate();",
  "const navigate = useNavigate();" + effectStr
);

fs.writeFileSync('src/components/WelcomeGuard.tsx', content);
