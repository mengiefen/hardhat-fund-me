const { getNamedAccounts, ethers } = require('hardhat');
const { developmentNetworks } = require('../../helper-hardhat-config');
const { assert } = require('chai');

developmentNetworks.includes(hre.network.name)
    ? describe.skip
    : describe('FundMe', async function() {
          let fundMe, deployer, sendValue;
          beforeEach(async function() {
              deployer = (await getNamedAccounts()).deployer; // this is accessible in all tests
              fundMe = await ethers.getContract('FundMe', deployer);
              sendValue = ethers.utils.parseEther('0.2');
          });

          it('allows people to send fund and withdraw', async function() {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();
              const finalBalance = await ethers.provider.getBalance(
                  fundMe.address
              );
              assert.equal(finalBalance.toString(), '0');
          });
      });
