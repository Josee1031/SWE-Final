import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from './components/login-form';
import LibrarianDashboard from './components/dashboard';
import UserSettingsFormComponent from './components/src-components-user-settings-form';
import CustomerHomePage from './components/customer-homepage';
import StaffHomePage from './components/staff-homepage';
import CataloguePage from './components/src-components-catalogue-page';
import BookReservationPage from './components/src-components-book-reservation-page';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<LibrarianDashboard />} />
        <Route path="/settings" element={<UserSettingsFormComponent />} />
        <Route path="/customer" element={<CustomerHomePage />} />
        <Route path="/staff" element={<StaffHomePage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/book-reservation/:bookId" element={<BookReservationPage />} />

      </Routes>
    </Router>
  );
}

export default App;
