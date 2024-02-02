import { BytesLike, ethers, keccak256 } from "ethers";
import PrescriptionTokens from './artifacts/contracts/PrescriptionTokens.sol/PrescriptionTokens.json';
import AppointmentTokens from './artifacts/contracts/AppointmentTokens.sol/AppointmentTokens.json';
import { APPOINTMENTS_CONTRACT, BACKEND_URL, PRESCRIPTIONS_CONTRACT, Token } from './constants';
import { AppointmentType } from "./types";


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
const getTokenData = async (tokenID: number, tokenType: Token): Promise<[number, BytesLike]> => {
    const [, signer] = await loginMetamask();

    const contract = (tokenType === Token.Prescription)
        ? new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer)
        : new ethers.Contract(APPOINTMENTS_CONTRACT, AppointmentTokens.abi, signer);

    let category;
    let hash;

    try {
        [category, hash] = await contract.getToken(tokenID);
    } catch (err) {
        console.log(`Could not fetch token ${tokenID}: `, err);
        return [0, ""];
    }

    return [category, hash];
};


/** Retrieve all tokens (prescriptions or appointments) owned by the user,
 * along with their metadata hashes and visit categories
 * @parm {Token} tokenType - Token.Prescription or Token.Appointment
 * @returns {[number[], string[], number[]]} - [tokenIDs, metadata hashes, category ids]
 * @throws {Error} - If metamask is not installed or user is not logged in
 * @throws {Error} - If user is not logged in
**/
const getOwnedTokens = async (tokenType: Token): Promise<[number[], string[], number[]]> => {
    const [, signer] = await loginMetamask();

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
const exchangePrescriptionAppointment = async (prescrID: number, apptID: number) => {
    const [, signer] = await loginMetamask();

    const appointmentContract = new ethers.Contract(APPOINTMENTS_CONTRACT, AppointmentTokens.abi, signer);
    try {
        var hospital = await appointmentContract.ownerOf(apptID);
    } catch (e) {
        console.log("Can't get appointment token owner: ", e);
    }

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

/** Mint a prescription token
 * @param {string} patientAddr - Address of the recipient patient
 * @param {number} tokenID - ID of the token to be minted
 * @param {BytesLike} hash - Hash of the metadata residing in the database
 * @param {number} category - ID of the prescription category
 * @throws {Error} - If metamask is not installed or user is not logged in
 * @throws {Error} - If user is not logged in
**/
const mintPrescription = async (patientAddr: string, tokenID: number, hash: BytesLike, category: number) => {
    const [, signer] = await loginMetamask();

    const contract = new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer);
    const transaction = await contract.safeMint(patientAddr, tokenID, hash, category);
    await transaction.wait();
};

/** Mint an appointment token
 * @param {number} tokenID - ID of the token to be minted
 * @param {BytesLike} hash - Hash of the metadata residing in the database
 * @param {number} category - ID of the prescription category
 * @throws {Error} - If metamask is not installed or user is not logged in
 * @throws {Error} - If user is not logged in
**/
const mintAppointment = async (tokenID: number, hash: BytesLike, category: number) => {
    const [, signer] = await loginMetamask();

    const contract = new ethers.Contract(APPOINTMENTS_CONTRACT, AppointmentTokens.abi, signer);
    const transaction = await contract.safeMint(tokenID, hash, category);
    await transaction.wait();
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
    const computedHash = keccak256(ethers.toUtf8Bytes(dataToHash));
    // Compare hashes
    return computedHash === hash;
};

/** Verify that a token is owned by the user
 * @param {string} tokenID - token of which to verify ownership
 * @returns {boolean} - True if hash corresponds to data, false otherwise
**/
const isOwned = async (tokenID: number, tokenType: Token): Promise<boolean> => {
    const [, signer] = await loginMetamask();

    const contract = (tokenType === Token.Prescription)
        ? new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer)
        : new ethers.Contract(APPOINTMENTS_CONTRACT, AppointmentTokens.abi, signer);

    try {
        const address = await contract.ownerOf(tokenID);
        const signerAddress = await signer.getAddress();
        return address === signerAddress;
    } catch (err) {
        console.log(`Could not fetch ${tokenType.toString()} tokens: `, err);
        return false;
    }
};

/** Sign a string with metamask
 * @param {string} s - String to sign
 * @param {ethers.Signer} signer - Signer to use
 * @returns {ethers.BytesLike} - Signature of the string
**/
const signString = async (s: string, signer: ethers.Signer): Promise<ethers.BytesLike> => {
    const signature = await signer.signMessage(ethers.toUtf8Bytes(s));
    return signature;
};

/** Check if user is logged in
 * @returns {boolean} - True if user is logged in, false otherwise
**/
const isLoggedIn = (): boolean => {
    if (localStorage.getItem('auth')) {
        return true;
    }
    return false;
};


/** Redirect to login page if user is not logged in **/
const requireLogin = () => {
    // If jwt is not present, redirect to login
    if (!isLoggedIn()) {
        window.location.href = '/login';
    }
};

/** Logout user **/
const logout = async () => {
    const response = await fetch(`${BACKEND_URL}/api/v1/logout`, {
        method: 'GET',
        headers: {
            auth: localStorage.getItem('auth')!
        }
    });
    if (!response.ok) {
        console.log("Could not log out");
    }
    localStorage.removeItem('auth');
    window.location.href = '/login';
};

/** Get personal area path based on user role
 * @param {string} role - User role
 * @returns {string} - Path to personal area
**/
const getPersonalArea = (role: string) => {
    if (role === 'patient') {
        return '/reservations';
    } else if (role === 'doctor') {
        return '/doctor';
    } else if (role === 'hospital') {
        return '/hospital/new-appointment';
    }
    return '/';
};

const getDistanceFromLatLonInKm = (lat1: number,lon1: number,lat2: number,lon2: number): number => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}
  
const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180)
}

const getHospitalInfo = async (appointment: AppointmentType) => {
    const hospitalResp = await fetch(`${BACKEND_URL}/api/v1/hospitals/${appointment.id_hospital}`);
    if (!hospitalResp.ok) {
        console.log("error:", hospitalResp);
        return;
    }
    const hospital = await hospitalResp.json()
        .then(data => data.hospital as {
            id:number,
            address: string,
            name: string,
            cap: string,
            city: string,
            latitude: number,
            longitude: number
        });

    appointment.address = hospital.address;
    appointment.name = hospital.name;
    appointment.cap = hospital.cap;
    appointment.city = hospital.city;
    appointment.latitude = hospital.latitude;
    appointment.longitude = hospital.longitude;
}

export { getTokenData, getOwnedTokens, exchangePrescriptionAppointment, verifyHash, mintPrescription, isOwned, loginMetamask, signString, mintAppointment, requireLogin, isLoggedIn, logout, getPersonalArea, getDistanceFromLatLonInKm, getHospitalInfo };