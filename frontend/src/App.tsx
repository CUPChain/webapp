import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Home from './screens/Home';
import Login from './screens/Login';
import Footer from './components/Footer';
import CustomHeader from './components/Header';
import Reservations from './screens/Reservations';
import Prescription from './screens/Prescription';
import Appointment from './screens/Appointment';

const App = () => {
  return (
    <>
      <CustomHeader/>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/prescriptions/:id" element={<Prescription />} />
          <Route path="/appointments/:id" element={<Appointment />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  );
};

export default App;