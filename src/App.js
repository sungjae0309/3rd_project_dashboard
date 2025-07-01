import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import RegisterNext from "./pages/RegisterNext";
import Logout from "./components/logout";
import Login from "./components/login";
import Aijob from "./components/aijob";
import NaverCallback from "./components/navercallback";
import GuestDashboard from "./components/guestdashboard";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/registernext" element={<RegisterNext/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/logout" element={<Logout/>} />
        <Route path="/aijob" element={<Aijob />} />
        <Route path="/navercallback" element={<NaverCallback />} />
        <Route path="/guestdashboard" element={<GuestDashboard /> } />
        
    
      </Routes>
    </Router>
  );
}