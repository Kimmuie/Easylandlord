import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoadingScreen from './components/LoadingScreen'
import Management from "./pages/Management";
import Financial from "./pages/Financial";
import Rental from "./pages/Rental";
import Account from "./pages/Account";

function App() {
    return (
        <Router>
            <LoadingScreen></LoadingScreen>
            <Navbar />
            <Routes>
                <Route path="/" element={<Management />} />
                <Route path="/management" element={<Management />} />
                <Route path="/financial" element={<Financial />} />
                <Route path="/rental" element={<Rental />} />
                <Route path="/account" element={<Account />} />
            </Routes>
        </Router>
    );
}

export default App;
