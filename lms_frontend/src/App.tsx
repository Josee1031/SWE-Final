import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from './components/login-form';
import ReservationsPage from "./components/reservations";
import CustomerHomePage from './components/customer-homepage';
import StaffHomePage from './components/staff-homepage';
import CataloguePage from './components/src-components-catalogue-page';
import BookReservationPage from './components/src-components-book-reservation-page';
import UserCataloguePage from "./components/ui/src-user-catalogue";
import UsersPage from "./components/user-page";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/reservations" element={<ReservationsPage/>} />
        
        <Route path="/customer" element={<CustomerHomePage />} />
        <Route path="/staff" element={<StaffHomePage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/book-reservation/:bookId" element={<BookReservationPage />} />
        <Route path="/user-catalogue" element={<UserCataloguePage />} />
        <Route path="/users" element={<UsersPage />} />

      </Routes>
    </Router>
  );
}

export default App;
