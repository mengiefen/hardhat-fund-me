// SPDX-License-Identifier: MIT
// PRAGMA
pragma solidity ^0.8.8;

// IMPORTS
import './PriceConverter.sol';

// ERROR CODES

error FundMe__NotOwner();

// INTERFACES,LIBRARIES, or CONTRACT

/** @title a contract that allows people to send ETH to it and store it
 *  @author Mengstu Fentaw with Patrick Collins
 *  @notice you can use this contract for only the most basic simulation
 *  @dev All function calls are currently implement without side effects
 */

contract FundMe {
    // Type declarations
    using PriceConverter for uint256;

    // State variables
    uint256 public constant MINIMUM_USD = 50;
    address[] private s_funders;
    address private immutable i_owner;
    mapping(address => uint256) private s_addressToAmountFunded;

    AggregatorV3Interface private s_priceFeed;

    // Events

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // Functions
    // Constructor
    constructor(address priceFeedAddress) {
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_owner = msg.sender;
    }

    // // Receive function
    // receive() external payable {
    //     fund();
    // }

    // // Fallback function

    // fallback() external payable {
    //     fund();
    // }

    // External functions

    // Public functions
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Didn't send required amount of USD"
        );
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public payable onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }('');

        require(success, 'Failed to withdraw money to owner');
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders; // mappings can't be in memory
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

        (bool success, ) = i_owner.call{value: address(this).balance}('');

        require(success, 'Failed to withdraw money to owner');
    }

    // Internal functions
    function getVersion() internal view returns (uint256) {
        return s_priceFeed.version();
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
