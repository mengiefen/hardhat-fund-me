const networkConfig = {
    5: {
        name: 'goerli',
        ethUSDPriceFeed: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e'
    },

    137: {
        name: 'polygon',
        ethUSDPriceFeed: '0xF9680D99D6C9589e2a93a78A04A279e509205945'
    },
    31337: {
        name: 'localhost',
        ethUSDPriceFeed: ''
    },
    localhost: {},
    hardhat: {}
};

const developmentNetworks = ['localhost', 'hardhat'];

const DECIMALS = 8;
const INITIAL_ANSWER = 20000000000;

module.exports = {
    networkConfig,
    developmentNetworks,
    DECIMALS,
    INITIAL_ANSWER
};
