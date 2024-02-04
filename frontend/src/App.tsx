import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationManager, notify } from 'design-react-kit';
import './App.css';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Home from './screens/Home';
import Login from './screens/Login';
import Footer from './components/Footer';
import Notification from './components/Notification';
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
import { getPersonalArea, isLoggedIn, loginMetamask } from './utils';
import { ethers } from 'ethers';
import { APPOINTMENTS_CONTRACT, PRESCRIPTIONS_CONTRACT } from './constants';
import PrescriptionTokens from './artifacts/contracts/PrescriptionTokens.sol/PrescriptionTokens.json';
import AppointmentTokens from './artifacts/contracts/AppointmentTokens.sol/AppointmentTokens.json';


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
    const role = localStorage.getItem('role') || "";
    if (isLoggedIn()) {
      return <Navigate to={getPersonalArea(role)} />;
    }
    return <Login />;
  };

  useEffect(() => {
    // Initialize event listeners, they need contracts with provider as runner, instead of signer
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const prescrContract = new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, provider);
    const apptContract = new ethers.Contract(APPOINTMENTS_CONTRACT, AppointmentTokens.abi, provider);

    prescrContract.on("Transfer", async (from, to, tokenID, event) => {
      console.log(event);
      let message = ""
      const [, signer] = await loginMetamask();
      const address = await signer.getAddress();

      if (from === ethers.ZeroAddress) {
        message = `Creato token prescrizione n. ${tokenID}`;
      } else if (to === address) {
        message = `Ricevuto Token prescrizione n. ${tokenID}`;
      } else if (from === address) {
        message = `Spedito Token prescrizione n. ${tokenID}`;
      }
      notify("",
        <Notification type="success" text={message} />,
      )
    });
    apptContract.on("Transfer", async (from, to, tokenID, event) => {
      console.log(event);
      let message = ""
      const [, signer] = await loginMetamask();
      const address = await signer.getAddress();

      if (from === ethers.ZeroAddress) {
        message = `Creato token appuntamento n. ${tokenID}`;
      } else if (to === address) {
        message = `Ricevuto Token appuntamento n. ${tokenID}`;
      } else if (from === address) {
        message = `Spedito Token appuntamento n. ${tokenID}`;
      }
      notify("",
        <Notification type="success" text={message} />,
      )
    });
    console.log("Prescription contract", prescrContract);
    console.log("Appointment contract", apptContract);

  }, []);

  return (
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
        <NotificationManager containerId='alerts' />
      </main>
      <Footer />
    </div>
  );
};

export default App;