import { ethers } from "hardhat";

async function main() {
  const DEFAULT_DOCTOR = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
  const DEFAULT_HOSPITAL = "0x976EA74026E726554dB657fA54763abd0C3a0aa9"

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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
