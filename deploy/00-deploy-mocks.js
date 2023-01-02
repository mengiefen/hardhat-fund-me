const { network } = require('hardhat');
const {
    DECIMALS,
    INITIAL_ANSWER,
    developmentNetworks
} = require('../helper-hardhat-config');
module.exports = async hre => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentNetworks.includes(network.name)) {
        log('---------------------------------------------------------');
        log('Deploying Mocks');
        await deploy('MockV3Aggregator', {
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true
        });

        log('Mocks deployed');
        log('---------------------------------------------------------');
    }
};

module.exports.tags = ['all', 'mocks'];
