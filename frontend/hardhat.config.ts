import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337
    }
  }
};

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  const provider = hre.ethers.provider;

  const config_accounts = hre.network.config.accounts
  var index = 0

  for (const account of accounts) {
    //printa solo la key del primo address :( non so come modificare il provider per printare anche le altre
    const privKey = hre.ethers.Wallet.fromPhrase((config_accounts as any).mnemonic, provider).privateKey;

    console.log(
      "%s {%s} (%i ETH)",
      account.address,
      privKey,
      hre.ethers.formatEther(await provider.getBalance(account.address))
    )
    
    index++
  }
});

export default config;
