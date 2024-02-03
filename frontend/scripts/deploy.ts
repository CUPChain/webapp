import { ethers } from "hardhat";

async function main() {
  const DEFAULT_DOCTOR = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
  const DEFAULT_HOSPITAL = "0x976EA74026E726554dB657fA54763abd0C3a0aa9"
  const DEFAULT_HOSPITAL_PRIVKEY = "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e"

  // Deploy prescriptions contract
  const PrescrTokens = await ethers.deployContract("PrescriptionTokens", []);
  const prescrTokens = await PrescrTokens.waitForDeployment();

  console.log(
    `contract PrescriptionTokens successfully deployed to ${prescrTokens.target}`
  );
  // Give doctor role to default doctor
  await prescrTokens.grantRole(DEFAULT_DOCTOR);
  console.log(`Granted doctor role to ${DEFAULT_DOCTOR}`)

  // Deploy appointments contract
  const AppTokens = await ethers.deployContract("AppointmentTokens", [prescrTokens.target]);
  const appTokens = await AppTokens.waitForDeployment();

  console.log(
    `contract AppointmentTokens successfully deployed to ${appTokens.target}`
  );
  // Give hospital role to default hospital
  await appTokens.grantRole(DEFAULT_HOSPITAL);
  console.log(`Granted hospital role to ${DEFAULT_HOSPITAL}`)

  // Make default hospital approve appointments contract to exchange its prescriptions
  // and prescriptions contract to exchange its appointments
  const provider = new ethers.WebSocketProvider("ws://localhost:8545");
  const hospitalPrivKey = new ethers.SigningKey(DEFAULT_HOSPITAL_PRIVKEY);
  const hospitalWallet = new ethers.NonceManager(new ethers.BaseWallet(hospitalPrivKey, provider));

  const prescrContractWithHospitalSigner = new ethers.Contract(prescrTokens.target, prescrTokens.interface, hospitalWallet);
  await prescrContractWithHospitalSigner.setApprovalForAll(appTokens.target, true);
  console.log(`Hospital approved appointments contract ${appTokens.target} to handle its prescritpion tokens`);
  
  const apptContractWithHospitalSigner = new ethers.Contract(appTokens.target, appTokens.interface, hospitalWallet);
  await apptContractWithHospitalSigner.setApprovalForAll(prescrTokens.target, true);
  console.log(`Hospital approved prescriptions contract ${prescrTokens.target} to handle its appointment tokens`);
  provider.destroy();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
