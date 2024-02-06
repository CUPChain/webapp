import { ethers } from "hardhat";
import { DEFAULT_DOCTOR } from "../src/constants.ts";

async function main() {
  const DEFAULT_HOSPITAL = "0x976EA74026E726554dB657fA54763abd0C3a0aa9"
  const DEFAULT_HOSPITAL_PRIVKEY = "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e"
  const MINTER_ROLE = ethers.id("MINTER_ROLE");

  // Deploy prescriptions contract
  const PrescrTokens = await ethers.deployContract("PrescriptionTokens", []);
  const prescrTokens = await PrescrTokens.waitForDeployment();

  console.log(
    `contract PrescriptionTokens successfully deployed to ${prescrTokens.target}`
  );
  // Give doctor role to default doctor
  await prescrTokens.grantRole(MINTER_ROLE, DEFAULT_DOCTOR);
  console.log(`Granted doctor role to ${DEFAULT_DOCTOR}`)

  // Deploy appointments contract
  const AppTokens = await ethers.deployContract("AppointmentTokens", []);
  const appTokens = await AppTokens.waitForDeployment();

  console.log(
    `contract AppointmentTokens successfully deployed to ${appTokens.target}`
  );
  // Give hospital role to default hospital
  await appTokens.grantRole(MINTER_ROLE, DEFAULT_HOSPITAL);
  console.log(`Granted hospital role to ${DEFAULT_HOSPITAL}`);

  // Set appointmentsContract address in prescriptions contract
  await prescrTokens.setAppointmentsAddress(appTokens.target);
  console.log("Set appointments contract address in prescriptions contract");

  // Set prescriptionsContract address in prescriptions contract
  await appTokens.setPrescriptionsAddress(prescrTokens.target);
  console.log("Set prescriptions contract address in appointments contract");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});