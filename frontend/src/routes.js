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
        <Route path="/course-page/:courseType/:courseId" element={<CourseLandingPage />} />
      </Route>
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
