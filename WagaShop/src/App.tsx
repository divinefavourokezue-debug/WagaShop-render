import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { LanguageThemeProvider } from './context/LanguageThemeContext';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/SearchPage';
import SavedPage from './pages/SavedPage';
import PublicShopPage from './pages/PublicShopPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import SellerDashboard from './pages/seller/Dashboard';
import SellerLogin from './pages/seller/Login';
import AddProduct from './pages/seller/AddProduct';
import SellerSettings from './pages/seller/Settings';
import UserSettingsPage from './pages/UserSettingsPage';
import { Splash } from './components/Splash';
import { WelcomeGuard } from './components/WelcomeGuard';

export default function App() {
  return (
    <AuthProvider>
      <LanguageThemeProvider>
        <Splash>
          <BrowserRouter>
            <WelcomeGuard>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="product/:id" element={<ProductPage />} />
                  <Route path="shop/:id" element={<PublicShopPage />} />
                  <Route path="search" element={<SearchPage />} />
                  <Route path="saved" element={<SavedPage />} />
                  <Route path="settings" element={<UserSettingsPage />} />
                  <Route path="profile" element={<UserSettingsPage />} />
                  <Route path="privacy" element={<PrivacyPolicyPage />} />
                  
                  {/* Seller Routes */}
                  <Route path="seller" element={<SellerDashboard />} />
                  <Route path="seller/login" element={<SellerLogin initialIsLogin={true} />} />
                  <Route path="seller/signup" element={<SellerLogin initialIsLogin={false} />} />
                  <Route path="login" element={<SellerLogin initialIsLogin={true} />} />
                  <Route path="signup" element={<SellerLogin initialIsLogin={false} />} />
                  <Route path="seller/add" element={<AddProduct />} />
                  <Route path="seller/add-product" element={<AddProduct />} />
                  <Route path="seller/settings" element={<SellerSettings />} />
                </Route>
              </Routes>
            </WelcomeGuard>
          </BrowserRouter>
        </Splash>
      </LanguageThemeProvider>
    </AuthProvider>
  );
}

