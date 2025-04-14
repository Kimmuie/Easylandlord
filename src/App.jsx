import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import Navbar from "./components/Navbar";
import LoadingScreen from './components/LoadingScreen'
import Management from "./pages/Management";
import Financial from "./pages/Financial";
import Map from "./pages/Map";
import Account from "./pages/Account";
import RentalDetail from "./pages/RentalDetail";
import { ThemeProvider } from "./contexts/ThemeContext";

const AppContent = () => {
  const location = useLocation();
  const isRentalDetailPage = /^\/management\/[^/]+$/.test(location.pathname);
  
  return (
    <>
      <LoadingScreen />
      {!isRentalDetailPage && <Navbar />}
      <div className={!isRentalDetailPage ? "navbar-container" : ""}>
        <Routes>
          <Route path="/" element={<Management />} />
          <Route path="/management" element={<Management />} />
          <Route path="/management/:rentalId" element={<RentalDetail />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/map" element={<Map />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;