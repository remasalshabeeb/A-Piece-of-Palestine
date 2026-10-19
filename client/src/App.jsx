import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ContentManagerDashboard from "./pages/ContentManagerDashboard";
import StageGame from './pages/StageGame';
import StageIntro from './pages/StageIntro';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute allowedRoles={['user']} />}>

          <Route
            path="/user/dashboard"
            element={<UserDashboard />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
        <Route
             path="/user/dashboard"
             element={<UserDashboard />}
           />
           <Route
        path="/user/stages/:stageId/intro"
        element={<StageIntro />}
      />
           <Route
              path="/user/stages/:stageId"
              element={<StageGame />}
          />
          </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['contentManager']} />}>
  <Route
    path="/content/dashboard"
    element={<ContentManagerDashboard />}
  />
</Route>
        
        

      </Routes>
    </Router>
  );
}

export default App;