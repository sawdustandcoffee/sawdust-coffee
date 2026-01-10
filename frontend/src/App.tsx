import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerProtectedRoute from './components/CustomerProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import Products from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import Categories from './pages/admin/Categories';
import AdminGallery from './pages/admin/Gallery';
import Orders from './pages/admin/Orders';
import Quotes from './pages/admin/Quotes';
import AdminContact from './pages/admin/Contact';
import Content from './pages/admin/Content';
import ActivityLog from './pages/admin/ActivityLog';
import Users from './pages/admin/Users';
import EmailPreview from './pages/admin/EmailPreview';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import Reviews from './pages/admin/Reviews';
import DiscountCodes from './pages/admin/DiscountCodes';
import NewsletterSubscribers from './pages/admin/NewsletterSubscribers';
import StockNotifications from './pages/admin/StockNotifications';

// Public pages
import Home from './pages/public/Home';
import Shop from './pages/public/Shop';
import ProductDetail from './pages/public/ProductDetail';
import Gallery from './pages/public/Gallery';
import About from './pages/public/About';
import Services from './pages/public/Services';
import Contact from './pages/public/Contact';
import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import OrderSuccess from './pages/public/OrderSuccess';
import NewsletterConfirm from './pages/public/NewsletterConfirm';
import NewsletterUnsubscribe from './pages/public/NewsletterUnsubscribe';
import NotFound from './pages/NotFound';

// Customer pages
import CustomerRegister from './pages/customer/Register';
import CustomerLogin from './pages/customer/Login';
import ForgotPassword from './pages/customer/ForgotPassword';
import ResetPassword from './pages/customer/ResetPassword';
import CustomerDashboard from './pages/customer/Dashboard';
import OrderHistory from './pages/customer/OrderHistory';
import OrderDetail from './pages/customer/OrderDetail';
import AccountSettings from './pages/customer/AccountSettings';
import Wishlist from './pages/customer/Wishlist';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomerAuthProvider>
          <CartProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:slug" element={<ProductDetail />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/success" element={<OrderSuccess />} />
              <Route path="/newsletter/confirm/:token" element={<NewsletterConfirm />} />
              <Route path="/newsletter/unsubscribe/:token" element={<NewsletterUnsubscribe />} />

              {/* Admin Auth */}
              <Route path="/login" element={<LoginPage />} />

              {/* Customer Auth */}
              <Route path="/customer/register" element={<CustomerRegister />} />
              <Route path="/customer/login" element={<CustomerLogin />} />
              <Route path="/customer/forgot-password" element={<ForgotPassword />} />
              <Route path="/customer/reset-password" element={<ResetPassword />} />
              <Route
                path="/customer/dashboard"
                element={
                  <CustomerProtectedRoute>
                    <CustomerDashboard />
                  </CustomerProtectedRoute>
                }
              />
              <Route
                path="/customer/orders"
                element={
                  <CustomerProtectedRoute>
                    <OrderHistory />
                  </CustomerProtectedRoute>
                }
              />
              <Route
                path="/customer/orders/:id"
                element={
                  <CustomerProtectedRoute>
                    <OrderDetail />
                  </CustomerProtectedRoute>
                }
              />
              <Route
                path="/customer/settings"
                element={
                  <CustomerProtectedRoute>
                    <AccountSettings />
                  </CustomerProtectedRoute>
                }
              />
              <Route
                path="/customer/wishlist"
                element={
                  <CustomerProtectedRoute>
                    <Wishlist />
                  </CustomerProtectedRoute>
                }
              />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/create"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/:id/edit"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gallery"
            element={
              <ProtectedRoute>
                <AdminGallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/quotes"
            element={
              <ProtectedRoute>
                <Quotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contact"
            element={
              <ProtectedRoute>
                <AdminContact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <ProtectedRoute>
                <Content />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/activity"
            element={
              <ProtectedRoute>
                <ActivityLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/email-preview"
            element={
              <ProtectedRoute>
                <EmailPreview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute>
                <Reviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/discount-codes"
            element={
              <ProtectedRoute>
                <DiscountCodes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/newsletter-subscribers"
            element={
              <ProtectedRoute>
                <NewsletterSubscribers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stock-notifications"
            element={
              <ProtectedRoute>
                <StockNotifications />
              </ProtectedRoute>
            }
          />

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </CustomerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
