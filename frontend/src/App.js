import './App.css';
import { Outlet, Route, Routes } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import bg_image from './bg_image.jpg';

import Homepage from './Pages/Homepage/Homepage';
import SignUpPage from './Pages/SignUp/SignUp';
import UserFeed from './Pages/UserFeed/UserFeed';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/feed" element={<UserFeed />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
