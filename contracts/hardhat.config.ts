import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://127.0.0.1:7545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x67c85d315efa2fe7083ec9e5eaa8b339d90d5a7cfa165d0214f6d2d7f0a1b13b'
      ]
    },
  },
};

export default config;
