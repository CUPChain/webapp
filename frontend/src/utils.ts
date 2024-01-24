import { ethers, keccak256 } from "ethers";
import PrescriptionTokens from './artifacts/contracts/PrescriptionTokens.sol/PrescriptionTokens.json';
import AppointmentTokens from './artifacts/contracts/AppointmentTokens.sol/AppointmentTokens.json';
import { APPOINTMENTS_CONTRACT, PRESCRIPTIONS_CONTRACT, Token } from './constants';


/** Log in to metamask and return provider and signer
 * @returns {[ethers.Provider, ethers.Signer]} - [provider, signer]
 * @throws {Error} - If metamask is not installed or user is not logged in
 * @throws {Error} - If user is not logged in
**/
const loginMetamask = async (): Promise<[ethers.Provider, ethers.Signer]> => {
    //TODO: throwa errori quando fallisce?
    if (typeof window.ethereum === 'undefined') {
        throw new Error("Metamask not installed");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    let signer;
    try {
        signer = await provider.getSigner();
    } catch (err) { // User probably not logged in metamask
        // TODO: how to wait for user to log in?
        throw new Error("User not logged in");
    }
    return [provider, signer];
};

/** Retrieve token metadata URI and metadata hash
 * @param {number} tokenID - ID of the token
 * @param {Token} tokenType - Token.Prescription or Token.Appointment
 * @returns {[string, string]} - [tokenURI, tokenHash]
 * @throws {Error} - If metamask is not installed or user is not logged in
 * @throws {Error} - If user is not logged in
**/
const getTokenData = async (tokenID: number, tokenType: Token): Promise<[string, string]> => {
    const [provider, signer] = await loginMetamask();

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
};


/** Retrieve all tokens (prescriptions or appointments) owned by the user,
 * along with their metadata hashes and visit categories
 * @parm {Token} tokenType - Token.Prescription or Token.Appointment
 * @returns {[number[], string[], number[]]} - [tokenIDs, metadata hashes, category ids]
 * @throws {Error} - If metamask is not installed or user is not logged in
 * @throws {Error} - If user is not logged in
**/
const getOwnedTokens = async (tokenType: Token): Promise<[number[], string[], number[]]> => {
    const [provider, signer] = await loginMetamask();

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
};

/** Request user to connect to metamask
**/
const requestAccount = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log(accounts);
};

/** Exchange a prescription for an appointment
 * @param {number} prescrID - ID of the prescription token
 * @param {number} apptID - ID of the appointment token
 * @param {string} hospital - Address of the hospital contract
 * @throws {Error} - If metamask is not installed or user is not logged in
 * @throws {Error} - If user is not logged in
**/
const exchangePrescriptionAppointment = async (prescrID: number, apptID: number, hospital: string) => {
    const [provider, signer] = await loginMetamask();

    const contract = new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer);
    console.log("ciao");
    try {
        const transaction = await contract.makeAppointment(prescrID, APPOINTMENTS_CONTRACT, apptID, hospital);
        console.log(transaction);
        await transaction.wait();
    } catch (e) {
        console.log(e);
    }
};

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
    const computedHash = keccak256(dataToHash);
    // Compare hashes
    return computedHash === hash;
};

/** Sign a string with metamask
 * @param {number} tokenID - ID of the token
 * @param {Token} tokenType - Token.Prescription or Token.Appointment
 * @returns {[ethers.BytesLike]} - [signature]
 * @throws {Error} - If metamask is not installed or user is not logged in
 * @throws {Error} - If user is not logged in
**/
const signString = async (s: string): Promise<ethers.BytesLike> => {
    const [provider, signer] = await loginMetamask();
    
    const signature = await signer.signMessage(s);
    return signature;
};

export { getTokenData, getOwnedTokens, exchangePrescriptionAppointment, verifyHash };