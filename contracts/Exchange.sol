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

    // Order number
    uint256 public orderNumber = 0;

    // Order Status enum
    enum OrderStatus {
        Created,
        Deposited,
        Finished,
        Cancelled
    }

    // The order of the exchange
    struct Order {
        address buyer;
        address seller;
        uint256 price;
        uint256 amount;
        OrderStatus status;
    }
    Order[] public orders;

    // Events
    event OrderCreated(uint256 orderNumber);
    event OrderDeposited(uint256 orderNumber);
    event OrderFinished(uint256 orderNumber);

    constructor(ERC20 _currency) {
        owner = msg.sender;
        currency = _currency;
    }

    // The seller set the price of the goods and the amount of goods
    function setPriceAndGoods(uint256 _price, uint256 _amount) public {
        require(_price > 0, "The price should be greater than 0");
        require(_amount > 0, "The amount should be greater than 0");
        orders.push(
            Order(address(0), msg.sender, _price, _amount, OrderStatus.Created)
        );

        emit OrderCreated(orderNumber);
        orderNumber++;
    }

    // The buyer deposits the currency into the exchange
    // The buyer should be approved by the owner
    // The depositted currency should link to the order
    function depositCurrency(uint256 _orderNumber) public {
        require(orders[_orderNumber].price != 0, "The order does not exist");
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
        emit OrderDeposited(_orderNumber);

        orders[_orderNumber].status = OrderStatus.Deposited;
    }

    // The buyer recieves the goods and releases the currency to the seller
    // need to check
    function receiveGoods(uint256 _orderNumber) public {
        require(
            currency.balanceOf(address(this)) >= orders[_orderNumber].price,
            "The exchange does not have enough currency"
        );
        require(
            orders[_orderNumber].buyer == msg.sender,
            "Only the buyer can receive the goods"
        );
        require(
            orders[_orderNumber].status == OrderStatus.Deposited,
            "Order status is not Deposited"
        );
        currency.transfer(
            orders[_orderNumber].seller,
            orders[_orderNumber].price
        );
        orders[_orderNumber].status = OrderStatus.Finished;
        emit OrderFinished(_orderNumber);
    }

    function getOrder(
        uint256 _orderNumber
    ) public view returns (address, address, uint256, uint256, OrderStatus) {
        Order memory order = orders[_orderNumber];
        return (
            order.buyer,
            order.seller,
            order.price,
            order.amount,
            order.status
        );
    }
}
