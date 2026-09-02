import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (reg) => {
        console.log('WAGA SHOP ServiceWorker registered: ', reg.scope);
        // Periodic check for new assets/updates when online
        if (reg.update) {
          setInterval(() => {
            if (navigator.onLine) {
              reg.update().catch(() => {});
            }
          }, 1000 * 60 * 30); // 30 minutes
        }
      },
      (err) => console.log('ServiceWorker registration failed: ', err)
    );
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

