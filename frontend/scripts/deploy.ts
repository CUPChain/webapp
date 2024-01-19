import { ethers } from "hardhat";

async function main() {
  const prescrTokens = await ethers.deployContract("PrescriptionTokens", []);
  await prescrTokens.waitForDeployment();

  console.log(
    `contract PrescriptionTokens successfully deployed to ${prescrTokens.target}`
  );

  const appTokens = await ethers.deployContract("AppointmentTokens", [prescrTokens.target]);
  await appTokens.waitForDeployment();

  console.log(
    `contract AppointmentTokens successfully deployed to ${appTokens.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
