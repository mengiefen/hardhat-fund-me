// function deployFunc() {}
const {
    networkConfig,
    developmentNetworks
} = require('../helper-hardhat-config');
const { network } = require('hardhat');
const { verify } = require('../utils/verify');

// module.exports.default = deployFunc;

module.exports = async hre => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // What happens when we want to deploy to multiple networks?
    // const ethUsdTokenAddress = networkConfig[chainId].ethUSDPriceFeed;
    let ethUsdPriceFeedAddress;

    if (developmentNetworks.includes(network.name)) {
        const ethUsdAggregator = await deployments.get('MockV3Aggregator');
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUSDPriceFeed;
    }

    // if the contract doesn't exist,  we deploy the minimal version of it for local testing

    // When going for a localhost or hardhat network,we want to deploy the mock contract
    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy('FundMe', {
        from: deployer,
        args: args, // put price feed address here
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    });

    if (
        !developmentNetworks.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args);
    }

    log('---------------------------------------------------------');
};

module.exports.tags = ['all', 'fund-me'];
