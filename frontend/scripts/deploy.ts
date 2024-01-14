import { ethers } from "hardhat";

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  const lockedAmount = ethers.parseEther("0.001");

  const lock = await ethers.deployContract("Lock", [unlockTime], {
    value: lockedAmount,
  });

  await lock.waitForDeployment();

  console.log(
    `Lock with ${ethers.formatEther(
      lockedAmount
    )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.target}`
  );

  // ---
  const greeter = await ethers.deployContract("Greeter", ["Hello WOrld"]);
  await greeter.waitForDeployment();

  console.log(
    `contract greeter successfully deployed to ${greeter.target}`
  );

  // ---
  const prescrTokens = await ethers.deployContract("PrescriptionTokens", ["0x90F79bf6EB2c4f870365E785982E1f101E93b906"]);
  await prescrTokens.waitForDeployment();

  console.log(
    `contract PrescriptionTokens successfully deployed to ${prescrTokens.target}`
  );

  const appTokens = await ethers.deployContract("AppointmentTokens", ["0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"]);
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
