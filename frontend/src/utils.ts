import { ethers, keccak256 } from "ethers";
import PrescriptionTokens from './artifacts/contracts/PrescriptionTokens.sol/PrescriptionTokens.json';
import AppointmentTokens from './artifacts/contracts/AppointmentTokens.sol/AppointmentTokens.json';
import { APPOINTMENTS_CONTRACT, PRESCRIPTIONS_CONTRACT, Token } from './constants';

/** Retrieve token metadata URI and metadata hash
* @param {number} tokenID - ID of the token
* @param {Token} tokenType - Token.Prescription or Token.Appointment
* @returns {[string, string]} - [tokenURI, tokenHash]
**/
async function getTokenData(tokenID: number, tokenType: Token): Promise<[string, string]> {
    //TODO: throwa errori quando fallisce?
    if (typeof window.ethereum === 'undefined') {
        //TODO: Tell user to install metamask?
        return ["", ""];
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    let signer;
    try {
        signer = await provider.getSigner();
    } catch (err) { // User probably not logged in metamask
        // TODO: how to wait for user to log in?
        return ["", ""];
    }
    const contract = (tokenType === Token.Prescription)
        ? new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer)
        : new ethers.Contract(APPOINTMENTS_CONTRACT, AppointmentTokens.abi, signer);

    let tokenUri;
    let tokenHash;

    try {
        tokenUri = await contract.tokenURI(tokenID);
        console.log("tokenUri: ", tokenUri);
    } catch (err) {
        console.log(`Could not fetch token ${tokenID} uri: `, err);
        return ["", ""];
    }
    try {
        // TODO: implementare in token
        tokenHash = await contract.tokenHash(tokenID);
        console.log("tokenUri: ", tokenHash);
    } catch (err) {
        console.log(`Could not fetch token ${tokenID} hash: `, err);
        return ["", ""];
    }

    return [tokenUri, tokenHash];
}


/** Retrieve all tokens (prescriptions or appointments) owned by the user,
 * along with their metadata hashes and visit categories
 * @parm {Token} tokenType - Token.Prescription or Token.Appointment
 * @returns {[number[], string[], number[]]} - [tokenIDs, metadata hashes, category ids]
**/
async function getOwnedTokens(tokenType: Token): Promise<[number[], string[], number[]]> {
    if (typeof window.ethereum === 'undefined') {
        //TODO: Tell user to install metamask?
        return [[], [], []];
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    let signer;
    try {
        signer = await provider.getSigner();
    } catch (err) { // User probably not logged in metamask
        // TODO: how to wait for user to log in?
        return [[], [], []];
    }
    const contract = (tokenType === Token.Prescription)
        ? new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer)
        : new ethers.Contract(APPOINTMENTS_CONTRACT, AppointmentTokens.abi, signer);

    try {
        const data = await contract.getMyTokens();
        console.log("data: ", data);
        return data;
    } catch (err) {
        console.log(`Could not fetch ${tokenType.toString()} tokens: `, err);
        return [[], [], []];
    }
}

async function requestAccount() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log(accounts);
}

async function exchangePrescriptionAppointment(prescrID: number, apptID: number, hospital: string) {
    if (typeof window.ethereum === 'undefined') {
        return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer);
    console.log("ciao");
    try {
        const transaction = await contract.makeAppointment(prescrID, APPOINTMENTS_CONTRACT, apptID, hospital);
        console.log(transaction);
        await transaction.wait();
    } catch (e) {
        console.log(e);
    }
}

/** Verify that a hash corresponds to a given data object
 * @param {string} hash - Hash to verify
 * @param {object} data - Data to verify
 * @returns {boolean} - True if hash corresponds to data, false otherwise
**/
const verifyHash = async (hash: string, data: any): Promise<boolean> => {
    // Hash data using ordered keys (to avoid hash mismatch due to different key order)
    let dataToHash = "";
    Object.keys(data).sort().forEach((key: string) => {
        // Get value of key and add it to dataToHash
        let value = data[key];
        dataToHash += `${key}:${value};`;
    });
    // Compute hash of data
    const computedHash = keccak256(ethers.toUtf8Bytes(dataToHash));
    // Compare hashes
    return computedHash === hash;
};

export { getTokenData, getOwnedTokens, exchangePrescriptionAppointment, verifyHash };