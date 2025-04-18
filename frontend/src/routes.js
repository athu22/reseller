import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateUser from './pages/CreateUser';
import Activation from './pages/Activation';
import WalletPage from './pages/WalletPage';
import MainLayout from './components/MainLayout';
import Profile from './pages/Profile';
import ResellerLandingPage from './pages/ResellerLandingPage';
import ViewResellerLandingPage from './pages/ViewResellerLandingPage';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/create-user/:softwareId" element={<CreateUser />} />
      <Route path="/activation/:userId/:softwareId" element={<Activation />} />
      <Route path="/wallet/:userId" element={<WalletPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/editable-page/:userId" element={<ResellerLandingPage />} />
     

      </Route>
      <Route path="/view-landing/:userId" element={<ViewResellerLandingPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
