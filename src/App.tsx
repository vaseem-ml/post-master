import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import UpdateElectron from '@/components/update';

import HomePage from './pages/Home';

import Master from './pages/Master';
import MasterTablePage from './pages/MasterTable';

import Delivery from './pages/Delivery';
import DeliveryTable from './pages/DeliveryTable';

import './index.css';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white-600">
          <ul className="flex space-x-4 p-4 text-white list-none ">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/delivery">Upload Delivery Data</Link></li>
            <li><Link to="/delivery-table">Delivery Data</Link></li>
            <li><Link to="/master">Upload Master Data</Link></li>
            <li><Link to="/master-table">Master Data</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/delivery-table" element={<DeliveryTable />} />
          <Route path="/master" element={<Master />} />
          <Route path="/master-table" element={<MasterTablePage />} />
          {/* {/* <Route path="/about" element={<AboutPage />} /> */}
        </Routes>
      </div>

    </Router>
  );
};

export default App;
