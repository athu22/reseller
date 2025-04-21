import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
  <>
  
  <Toaster position="top-right" />
  <AppRoutes />
  <ToastContainer
        position="top-center"
        autoClose={3000}
        toastClassName="toast-custom"
      />



  </>
  );
}

export default App;
