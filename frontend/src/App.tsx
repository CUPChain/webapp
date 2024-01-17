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
import ConfirmAppointment from './screens/ConfirmAppointment';
import { useState } from 'react';
import { ethers } from "ethers";
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json'
import PrescriptionTokens from './artifacts/contracts/PrescriptionTokens.sol/PrescriptionTokens.json';
import AppointmentTokens from './artifacts/contracts/AppointmentTokens.sol/AppointmentTokens.json';
import { APPOINTMENTS_CONTRACT, PRESCRIPTIONS_CONTRACT } from './constants';

const greeterAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

const App = () => {
  const [greeting, setGreetingValue] = useState<string>()

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function fetchGreeting() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
      try {
        const data = await contract.greet()
        console.log("data: ", data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  async function setGreeting() {
    if (!greeting) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
      const transaction = await contract.setGreeting(greeting)
      await transaction.wait()
      fetchGreeting()
    }
  }

  // NFT

  const [prescrID, setPrescrID] = useState<string>()

  async function mintPrescription() {
    if (!prescrID) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer)
      // for now give token to caller
      const transaction = await contract.safeMint(signer.address, prescrID, "http://cringe.kek/"+prescrID)
      await transaction.wait()
    }
  }

  async function getOwnedPrescriptions() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer)
      try {
        const data = await contract.getMyTokens()
        console.log("data: ", data)
        console.log("Token name:", await contract.name())
        console.log("Token symbol:", await contract.symbol())
        for (var i=0; i<data[0].length;i++) {
          console.log(data[0][i], data[1][i])
        }
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  const [apptID, setApptID] = useState<string>()

  async function mintAppointment() {
    if (!apptID) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(APPOINTMENTS_CONTRACT, AppointmentTokens.abi, signer)
      const transaction = await contract.safeMint(apptID, "http://cringe.kek/appoints/"+apptID, 1)
      await transaction.wait()
    }
  }

  // just to try
  async function exchangePreAppt() {
    if (!apptID || !prescrID) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer)
      console.log("ciao")
      try {
        const transaction = await contract.makeAppointment(prescrID, APPOINTMENTS_CONTRACT, apptID, "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc")
        await transaction.wait()
      } catch (e) {
        console.log(e)
      }
    }
  }

  return (
    <>
      <CustomHeader/>
      <button onClick={fetchGreeting}>Fetch Greeting</button>
      <button onClick={setGreeting}>Set Greeting</button>
      <input onChange={e => setGreetingValue(e.target.value)} placeholder="Set greeting" />
      <button onClick={mintPrescription}>Mint prescription</button>
      <input onChange={e => setPrescrID(e.target.value)} placeholder="Set prescription token id" />
      <button onClick={getOwnedPrescriptions}>Get Prescriptions</button>
      <button onClick={mintAppointment}>Mint appointment</button>
      <input onChange={e => setApptID(e.target.value)} placeholder="Set appointment token id" />
      <button onClick={exchangePreAppt}>Exchange prescr appt</button>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/prescriptions/:id" element={<Prescription />} />
          <Route path="/prescriptions/:id/confirm-appointment" element={<ConfirmAppointment />} />
          <Route path="/appointments/:id" element={<Appointment />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  );
};

export default App;