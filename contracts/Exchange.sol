// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// This is the main contract for the exchange of goods and currency
// between users. It is the main contract that will be deployed to the
// blockchain.

// The whole scenario is that 2 traders, Alice and Bob, want to exchange.
// Alice wants to sell her goods for Bob's currency. So Bob deposits his
// currency into the exchange and when Bob receives Alice's goods, the
// exchange will transfer the currency to Alice.

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange {
    // The owner of the contract
    address public owner;

    // The currency that is used in the exchange
    ERC20 public currency;

    // The list of approved sellers
    address[] public approvedSellers;

    // The list of approved buyers
    address[] public approvedBuyers;

    // Order number
    uint8 public orderNumber = 0;

    // The order of the exchange
    struct Order {
        address buyer;
        address seller;
        uint256 price;
        uint256 amount;
    }
    Order[] public orders;

    constructor(ERC20 _currency) {
        owner = msg.sender;
        currency = _currency;
    }

    // Start the exchange
    function startExchange() public returns (uint256) {
        require(
            isAddressInArray(msg.sender, approvedSellers) ||
                isAddressInArray(msg.sender, approvedBuyers),
            "Only the Approved Seller or Buyer can start the exchange"
        );
        orderNumber++;
        return orderNumber;
    }

    // The seller set the price of the goods and the amount of goods
    function setPriceAndGoods(
        uint256 _price,
        uint256 _amount,
        uint8 _orderNumber
    ) public {
        require(
            isAddressInArray(msg.sender, approvedSellers),
            "Only the Approved Seller can set the price"
        );
        orders[_orderNumber].price = _price;
        orders[_orderNumber].amount = _amount;
        orders[_orderNumber].seller = msg.sender;
    }

    // The buyer deposits the currency into the exchange
    // The buyer should be approved by the owner
    // The depositted currency should link to the order
    function depositCurrency(uint8 _orderNumber) public {
        require(orders[_orderNumber].price != 0, "The price is not set yet");
        require(
            isAddressInArray(msg.sender, approvedBuyers),
            "Only the Approved Buyer can deposit the currency"
        );
        require(
            currency.balanceOf(msg.sender) >= orders[_orderNumber].price,
            "The buyer does not have enough currency"
        );
        orders[_orderNumber].buyer = msg.sender;
        currency.transferFrom(
            msg.sender,
            address(this),
            orders[_orderNumber].price
        );
    }

    // The buyer recieves the goods and releases the currency to the seller
    // need to check
    function receiveGoods(uint8 _orderNumber) public {
        require(
            currency.balanceOf(address(this)) >= orders[_orderNumber].price,
            "The exchange does not have enough currency"
        );
        require(
            orders[_orderNumber].buyer == msg.sender,
            "Only the buyer can receive the goods"
        );
        require(
            orders[_orderNumber].amount > 0,
            "The amount of goods is not set yet"
        );
        require(
            orders[_orderNumber].seller != address(0),
            "The seller is not set yet"
        );
        currency.transfer(
            orders[_orderNumber].seller,
            orders[_orderNumber].price
        );
    }

    // The owner set the list the approved seller
    function setApprovedSeller(address _seller) public {
        require(
            msg.sender == owner,
            "Only the owner can set the approved seller"
        );
        approvedSellers.push(_seller);
    }

    // The owner remove the approved seller
    function removeApprovedSeller(address _seller) public {
        require(
            msg.sender == owner,
            "Only the owner can remove the approved seller"
        );
        for (uint256 i = 0; i < approvedSellers.length; i++) {
            if (approvedSellers[i] == _seller) {
                delete approvedSellers[i];
            }
        }
    }

    // The owner set the approved buyer
    function setApprovedBuyer(address _buyer) public {
        require(
            msg.sender == owner,
            "Only the owner can set the approved buyer"
        );
        approvedBuyers.push(_buyer);
    }

    // The owner remove the approved buyer
    function removeApprovedBuyer(address _buyer) public {
        require(
            msg.sender == owner,
            "Only the owner can remove the approved buyer"
        );
        for (uint256 i = 0; i < approvedBuyers.length; i++) {
            if (approvedBuyers[i] == _buyer) {
                delete approvedBuyers[i];
            }
        }
    }

    // Check the address is in the approved list
    function isAddressInArray(
        address _address,
        address[] memory _array
    ) public pure returns (bool) {
        for (uint256 i = 0; i < _array.length; i++) {
            if (_array[i] == _address) {
                return true;
            }
        }
        return false;
    }
}
