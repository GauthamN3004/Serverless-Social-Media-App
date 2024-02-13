import './App.css';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './Routes/ProtectedRoutes';


import Homepage from './Pages/Homepage/Homepage';
import SignUpPage from './Pages/SignUp/SignUp';
import UserFeed from './Pages/UserFeed/UserFeed';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route element={<ProtectedRoute />}>
            <Route element={<UserFeed/>} path="/feed" exact/>
        </Route>
        {/* <Route path="/feed" element={<UserFeed />} /> */}
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
