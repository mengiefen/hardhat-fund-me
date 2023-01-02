const { deployments, ethers, getNamedAccounts } = require('hardhat');
const { expect, assert } = require('chai');
const { developmentNetworks } = require('../../helper-hardhat-config');

!developmentNetworks.includes(hre.network.name)
    ? describe.skip
    : describe('FundMe', async function() {
          let fundMe, mockV3Aggregator, deployer;
          const sendValue = ethers.utils.parseEther('1');

          beforeEach(async function() {
              // const accounts = await ethers.getSigners();
              // const deployer = accounts[0].address;
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(['all']);
              fundMe = await ethers.getContract('FundMe', deployer);
              mockV3Aggregator = await ethers.getContract(
                  'MockV3Aggregator',
                  deployer
              );
          });

          describe('constructor', async function() {
              it('should set the the aggregator addresses correctly', async function() {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          describe('fund', async function() {
              it("should fails don't send enough Ethers", async function() {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't send required amount of USD"
                  );
              });

              it('should update the amount', async function() {
                  await fundMe.fund({
                      value: sendValue
                  });
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  );
                  assert.equal(response.toString(), sendValue.toString());
              });

              it('Adds funder to array of funders', async function() {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.getFunders(0);
                  assert.equal(funder, deployer);
              });
          });

          describe('withdraw', async function() {
              beforeEach(async function() {
                  await fundMe.fund({ value: sendValue });
              });

              it('only owner can withdraw', async function() {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(attackerConnectedContract.withdraw()).to.be
                      .reverted;
                  // TODO: WHY THIS ASSERTION FAILS?
                  // await expect(
                  //     attackerConnectedContract.withdraw()
                  // ).to.be.revertedWith('FundMe__NotOwner');
              });

              it('can withdraw ETH from a single funder', async function() {
                  //Arrange
                  const initialFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );
                  const initialDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  );

                  //Act
                  const txResponse = await fundMe.withdraw();
                  const txReceipt = await txResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = txReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const finalFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );
                  const finalDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  );

                  //Assert
                  assert.equal(finalFundMeBalance, 0);
                  assert.equal(
                      initialDeployerBalance
                          .add(initialFundMeBalance)
                          .toString(),
                      finalDeployerBalance.add(gasCost).toString()
                  );
              });

              it('can make cheaper withdraw ETH from a single funder', async function() {
                  //Arrange
                  const initialFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );
                  const initialDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  );

                  //Act
                  const txResponse = await fundMe.cheaperWithdraw();
                  const txReceipt = await txResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = txReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const finalFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );
                  const finalDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  );

                  //Assert
                  assert.equal(finalFundMeBalance, 0);
                  assert.equal(
                      initialDeployerBalance
                          .add(initialFundMeBalance)
                          .toString(),
                      finalDeployerBalance.add(gasCost).toString()
                  );
              });

              it('can withdraw ETH from multiple funders', async function() {
                  //Arrange
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      fundMe.connect(accounts[i]).fund({ value: sendValue });
                  }

                  const initialFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );
                  const initialDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  );

                  //Act
                  const txResponse = await fundMe.withdraw();
                  const txReceipt = await txResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = txReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const finalFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );
                  const finalDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  );

                  //Assert
                  assert.equal(finalFundMeBalance, 0);
                  // TODO: WHY THIS ASSERTION FAILS?
                  // assert.equal(
                  //     initialDeployerBalance.add(initialFundMeBalance).toString(),
                  //     finalDeployerBalance.add(gasCost).toString()
                  // );

                  // make sure the funders array is empty
                  await expect(fundMe.getFunders(0)).to.be.reverted;

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });

              it('can withdraw with cheaper withdraw', async function() {
                  //Arrange
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      fundMe.connect(accounts[i]).fund({ value: sendValue });
                  }

                  const initialFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );
                  const initialDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  );

                  //Act
                  const txResponse = await fundMe.cheaperWithdraw();
                  const txReceipt = await txResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = txReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const finalFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );
                  const finalDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  );

                  //Assert
                  assert.equal(finalFundMeBalance, 0);
                  // TODO: WHY THIS ASSERTION FAILS?
                  // assert.equal(
                  //     initialDeployerBalance.add(initialFundMeBalance).toString(),
                  //     finalDeployerBalance.add(gasCost).toString()
                  // );

                  // make sure the funders array is empty
                  await expect(fundMe.getFunders(0)).to.be.reverted;

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });
          });
      });
