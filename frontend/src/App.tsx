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
import { ethers, keccak256 } from "ethers";
import PrescriptionTokens from './artifacts/contracts/PrescriptionTokens.sol/PrescriptionTokens.json';
import AppointmentTokens from './artifacts/contracts/AppointmentTokens.sol/AppointmentTokens.json';
import { APPOINTMENTS_CONTRACT, PRESCRIPTIONS_CONTRACT } from './constants';
import NewAppointment from './screens/NewAppointment';
import { isLoggedIn } from './utils';
import NotFound from './screens/NotFound';

const App = () => {
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  const [prescrID, setPrescrID] = useState<string>();

  async function mintPrescription() {
    if (!prescrID) return;
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer);
      // for now give token to caller
      const transaction = await contract.safeMint(signer.address, prescrID, keccak256(ethers.randomBytes(32)), 1);
      await transaction.wait();
    }
  }

  async function getOwnedPrescriptions() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer);
      try {
        const data = await contract.getMyTokens();
        console.log("data: ", data);
        console.log("Token name:", await contract.name());
        console.log("Token symbol:", await contract.symbol());
        for (var i = 0; i < data[0].length; i++) {
          console.log(data[0][i], data[1][i]);
        }
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  const [apptID, setApptID] = useState<string>();

  async function mintAppointment() {
    if (!apptID) return;
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(APPOINTMENTS_CONTRACT, AppointmentTokens.abi, signer);
      const transaction = await contract.safeMint(apptID, keccak256(ethers.randomBytes(32)), 1);
      await transaction.wait();
    }
  }

  // just to try
  async function exchangePreAppt() {
    if (!apptID || !prescrID) return;
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer);
      console.log("ciao");
      try {
        const transaction = await contract.makeAppointment(prescrID, APPOINTMENTS_CONTRACT, apptID, "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc");
        console.log(transaction);
        await transaction.wait();
        console.log(transaction);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async function grantRoleAppt() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(APPOINTMENTS_CONTRACT, AppointmentTokens.abi, signer);
      const transaction = await contract.grantRole(signer.address);
      await transaction.wait();
    }
  }
  async function grantRolePre() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer);
      const transaction = await contract.grantRole(signer.address);
      await transaction.wait();
    }
  }

  const LoginRoute = () => {
    // if logged in, redirect to reservations
    if (isLoggedIn()) {
      return <Navigate to="/reservations" />;
    }
    return <Login />;
  };

  const PrivateRoute = ({ element, requiredRole }: { element: JSX.Element; requiredRole: string; } = { element: <></>, requiredRole: 'patient' }) => {
    // if not logged in, redirect to login
    if (!isLoggedIn()) {
      return <Navigate to="/login" />;
    }
    if (localStorage.getItem('role') !== requiredRole) {
      return <Navigate to="/" />;
    }
    return element;
  };


  return (
    <div className='d-flex flex-column vh-100'>
      <CustomHeader />
      <div className='d-flex flex-row'>
        <button onClick={mintPrescription}>Mint prescription</button>
        <input onChange={e => setPrescrID(e.target.value)} placeholder="Set prescription token id" />
        <button onClick={getOwnedPrescriptions}>Get Prescriptions</button>
        <button onClick={mintAppointment}>Mint appointment</button>
        <input onChange={e => setApptID(e.target.value)} placeholder="Set appointment token id" />
        <button onClick={exchangePreAppt}>Exchange prescr appt</button>
        <button onClick={grantRoleAppt}>Grant role appt</button>
        <button onClick={grantRolePre}>Grant role prescr</button>
      </div>
      <main className='flex-grow-1'>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginRoute />} />
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
  );
};

export default App;