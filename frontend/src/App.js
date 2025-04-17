import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
  <>
  
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
