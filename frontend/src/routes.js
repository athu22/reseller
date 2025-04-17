import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateUser from './pages/CreateUser';
import Activation from './pages/Activation';
import WalletPage from './pages/WalletPage';
// import SoftwareRegistration from './pages/SoftwareRegistration';
import MainLayout from './components/MainLayout';
import Profile from './pages/Profile';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/create-user/:softwareId" element={<CreateUser />} />
      <Route path="/activation/:userId/:softwareId" element={<Activation />} />
      <Route path="/wallet/:userId" element={<WalletPage />} />
      {/* <Route path="/register/:softwareId" element={<SoftwareRegistration />} /> */}
      <Route path="/profile" element={<Profile />} />

      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
