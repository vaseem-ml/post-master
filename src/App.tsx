import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUpload, faTable, faAddressBook, faEnvelope } from '@fortawesome/free-solid-svg-icons';

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
      <div className="min-h-screen flex">
        <nav className="w-[200px] bg-gray-800 text-white flex flex-col">
          <ul className="space-y-4 p-4 list-none">
            <li>
              <Link to="/" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
                <FontAwesomeIcon icon={faHome} className="text-white" />
                <span className="text-white text-sm">Home</span>
              </Link>
            </li>
            <li>
              <Link to="/delivery" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
                <FontAwesomeIcon className="text-white" icon={faUpload} />
                <span className="text-white text-sm">Upload Delivery Data</span>
              </Link>
            </li>
            <li>
              <Link to="/delivery-table" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
                <FontAwesomeIcon className="text-white" icon={faTable} />
                <span className="text-white text-sm">Delivery Data</span>
              </Link>
            </li>
            <li>
              <Link to="/master" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
                <FontAwesomeIcon className="text-white" icon={faUpload} />
                <span className="text-white text-sm">Upload Master Data</span>
              </Link>
            </li>
            <li>
              <Link to="/master-table" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
                <FontAwesomeIcon className="text-white" icon={faTable} />
                <span className="text-white text-sm">Master Data</span>
              </Link>
            </li>
            {/* <li>
              <Link to="/contact" className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>Contact</span>
              </Link>
            </li> */}
          </ul>
        </nav>

        <div className="flex-1 bg-gray-100 p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/delivery-table" element={<DeliveryTable />} />
            <Route path="/master" element={<Master />} />
            <Route path="/master-table" element={<MasterTablePage />} />
            {/* <Route path="/contact" element={<Contact />} /> */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
