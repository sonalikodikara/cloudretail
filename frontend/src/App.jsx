// frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import CustomerDashboard from './components/CustomerDashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;