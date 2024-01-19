import { ethers } from "ethers";
import PrescriptionTokens from './artifacts/contracts/PrescriptionTokens.sol/PrescriptionTokens.json';
import AppointmentTokens from './artifacts/contracts/AppointmentTokens.sol/AppointmentTokens.json';
import { APPOINTMENTS_CONTRACT, PRESCRIPTIONS_CONTRACT, Token } from './constants';

// Retrieve token metadata URI and metadata hash
//TODO: throwa errori quando fallisce?
async function getTokenData(tokenID: number, tokenType: Token): Promise<[string, string]> {
    if (typeof window.ethereum === 'undefined') {
        //TODO: Tell user to install metamask?
        return ["", ""]
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    let signer;
    try {
        signer = await provider.getSigner()
    } catch (err) { // User probably not logged in metamask
        // TODO: how to wait for user to log in?
        return ["", ""]
    }
    const contract = (tokenType === Token.Prescription)
        ? new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer)
        : new ethers.Contract(APPOINTMENTS_CONTRACT, AppointmentTokens.abi, signer)

    let tokenUri;
    let tokenHash;

    try {
        tokenUri = await contract.tokenURI(tokenID);
        console.log("tokenUri: ", tokenUri)
    } catch (err) {
        console.log(`Could not fetch token ${tokenID} uri: `, err)
        return ["", ""]
    }
    try {
        // TODO: implementare in token
        tokenHash = await contract.tokenHash(tokenID);
        console.log("tokenUri: ", tokenHash)
    } catch (err) {
        console.log(`Could not fetch token ${tokenID} hash: `, err)
        return ["", ""]
    }

    return [tokenUri, tokenHash]
}

async function getOwnedTokens(tokenType: Token): Promise<[number[], string[], number[]]> {
    if (typeof window.ethereum === 'undefined') {
        //TODO: Tell user to install metamask?
        return [[],[],[]]
    }
    await requestAccount()
    const provider = new ethers.BrowserProvider(window.ethereum);
    let signer;
    try {
        signer = await provider.getSigner()
    } catch (err) { // User probably not logged in metamask
        // TODO: how to wait for user to log in?
        return [[],[],[]]
    }
    const contract = (tokenType === Token.Prescription)
        ? new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer)
        : new ethers.Contract(APPOINTMENTS_CONTRACT, AppointmentTokens.abi, signer)

    try {
        const data = await contract.getMyTokens()
        console.log("data: ", data)
        return data
    } catch (err) {
        console.log(`Could not fetch ${tokenType.toString()} tokens: `, err)
        return [[],[],[]]
    }
}

async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
}

async function exchangePrescriptionApptointment(prescrID: number, apptID: number) {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer)
      console.log("ciao")
      try {
        const transaction = await contract.makeAppointment(prescrID, APPOINTMENTS_CONTRACT, apptID, "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc")
        console.log(transaction)
        await transaction.wait()
      } catch (e) {
        console.log(e)
      }
    }
  }

export { getTokenData, getOwnedTokens, exchangePrescriptionApptointment }