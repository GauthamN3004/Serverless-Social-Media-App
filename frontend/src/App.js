import './App.css';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './Routes/ProtectedRoutes';


import Homepage from './Pages/Homepage/Homepage';
import SignUpPage from './Pages/SignUp/SignUp';
import UserFeed from './Pages/UserFeed/UserFeed';
import Profile from './Pages/Profile/Profile';
import CreatePost from './Pages/CreatePost/CreatePost';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" exact element={<Homepage />} />
        <Route path="/signup" exact element={<SignUpPage />} />
        <Route element={<ProtectedRoute />}>
            <Route path="/feed" element={<UserFeed/>} exact/>
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/new-post" element={<CreatePost />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
