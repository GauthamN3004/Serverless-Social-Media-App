import './App.css';
import { Outlet, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import bg_image from './bg_image.jpg';

import Homepage from './Pages/Homepage/Homepage';
import SignUpPage from './Pages/SignUp/SignUp';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
