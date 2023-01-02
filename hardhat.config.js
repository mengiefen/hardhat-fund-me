require('@nomicfoundation/hardhat-chai-matchers');
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-etherscan');
require('dotenv/config');
require('hardhat-gas-reporter');
require('solidity-coverage');
require('@typechain/hardhat');
require('hardhat-deploy');

const RPC_URL = process.env.GOERLI_RPC_URL;
const PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

module.exports = {
    // solidity: '0.8.17',
    solidity: {
        compilers: [{ version: '0.8.17' }, { version: '0.6.6' }]
    },

    defaultNetwork: 'hardhat',
    networks: {
        goerli: {
            url: RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6
        },

        // the localhost alternative for ganache
        // CMD Command: yarn hardhat node
        localhost: {
            url: 'http://127.0.0.1:8545/',
            chainId: 31337
        }
    },

    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },

    namedAccounts: {
        deployer: {
            default: 0
        }
    },

    gasReporter: {
        enabled: true,
        currency: 'MATIC',
        outputFile: 'gas-report.txt',
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: 'ETH'
    }
};
