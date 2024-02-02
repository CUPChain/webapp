import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import ConfirmAppointment from './screens/ConfirmAppointment';
import NewPrescription from './screens/NewPrescription';
import PrescriptionList from './screens/PrescriptionList';
import Profile from './screens/Profile';
import NotFound from './screens/NotFound';
import NewAppointment from './screens/NewAppointment';
import { isLoggedIn } from './utils';
import { AlertProvider } from './components/Alert';


const PrivateRoute = ({ element, requiredRole }: { element: JSX.Element; requiredRole?: string; }) => {
  // if not logged in, redirect to login
  if (!isLoggedIn()) {
    return <Navigate to="/login" />;
  }
  console.log("requiredRole: ", requiredRole, "localStorage.getItem('role'): ", localStorage.getItem('role'));
  if (requiredRole !== undefined && localStorage.getItem('role') !== requiredRole) {
    return <Navigate to="/" />;
  }
  return element;
};

const App = () => {
  const LoginRoute = () => {
    // if logged in, redirect to reservations
    if (isLoggedIn()) {
      return <Navigate to="/reservations" />;
    }
    return <Login />;
  };


  return (
    <AlertProvider>
      <div className='d-flex flex-column vh-100'>
        <CustomHeader />
        <main className='flex-grow-1'>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
              <Route path="/reservations" element={<PrivateRoute element={<Reservations />} requiredRole="patient" />} />
              <Route path="/prescriptions/:id" element={<PrivateRoute element={<Prescription />} requiredRole="patient" />} />
              <Route path="/prescriptions/:id/confirm-appointment" element={<PrivateRoute element={<ConfirmAppointment />} requiredRole="patient" />} />
              <Route path="/appointments/:id" element={<PrivateRoute element={<Appointment />} requiredRole="patient" />} />
              <Route path="/doctor" element={<PrivateRoute element={<PrescriptionList />} requiredRole="doctor" />} />
              <Route path="/doctor/new-prescription" element={<PrivateRoute element={<NewPrescription />} requiredRole="doctor" />} />
              <Route path="/hospital/new-appointment" element={<PrivateRoute element={<NewAppointment />} requiredRole="hospital" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </main>
        <Footer />
      </div>
    </AlertProvider>
  );
};

export default App;