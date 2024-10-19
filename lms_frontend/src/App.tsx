import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from './components/login-form';
import LibrarianDashboard from './components/dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<LibrarianDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
