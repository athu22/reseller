import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateUser from './pages/CreateUser';
import Activation from './pages/Activation';
import WalletPage from './pages/WalletPage';
import MainLayout from './components/MainLayout';
import Profile from './pages/Profile';
import ResellerLandingPage from './pages/ResellerLandingPage';
import ViewResellerLandingPage from './pages/ViewResellerLandingPage';
import CourseLandingPage from './pages/CourseLandingPage';
import ViewCourseLandingPage from './pages/ViewCourseLandingPage';
import EnglishCourseLandingPage from './pages/course-landing-pages/EnglishCourseLandingPage';
import ComputerCourseLandingPage from './pages/course-landing-pages/ComputerCourseLandingPage';
import AndroidCourseLandingPage from './pages/course-landing-pages/AndroidCourseLandingPage';
import BasicComputerCourseLandingPage from './pages/course-landing-pages/BasicComputerCourseLandingPage';
import AddProduct from './pages/AddProduct';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductDetails from './pages/ProductDetails';
import AdminProductDetails from './pages/AdminProductDetails';
import AdminProducts from './pages/AdminProducts';

const AppRoutes = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/create-user/:softwareId" element={<CreateUser />} />
        <Route path="/activation/:userId/:softwareId" element={<Activation />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/product/:productId" element={<ProductDetails />} />
        <Route path="/admin-products" element={<AdminProducts />} />
        
        {/* Protected Routes */}
        <Route path="/wallet/:userId" element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/editable-page/:userId" element={
          <ProtectedRoute>
            <ResellerLandingPage />
          </ProtectedRoute>
        } />
        <Route path="/course-page/:courseType/:courseId" element={
          <ProtectedRoute>
            <CourseLandingPage />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/profile" element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/admin-product/:adminId/:productId" element={<AdminProductDetails />} />
      </Route>
      
      {/* View Routes */}
      <Route path="/view-landing/:userId" element={<ViewResellerLandingPage />} />
      <Route path="/view-course/:userId/:courseId" element={<ViewCourseLandingPage />} />
      <Route path="/view-english-course/:userId/:courseId" element={<EnglishCourseLandingPage />} />
      <Route path="/view-computer-course/:userId/:courseId" element={<ComputerCourseLandingPage />} />
      <Route path="/view-android-course/:userId/:courseId" element={<AndroidCourseLandingPage />} />
      <Route path="/view-basic-computer-course/:userId/:courseId" element={<BasicComputerCourseLandingPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
