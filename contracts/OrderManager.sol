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
import "./Interfaces/IProductManager.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract Exchange is Initializable {
    // The owner of the contract
    address private  owner;

    // Smart contract for product management and currency
    ERC20 public  currency;
    IProductManager public  productManager;

    // Order number
    uint256 public orderNumber;

    // Order Status enum
    enum OrderStatus {
        Created,
        Deposited,
        Finished,
        Updated,
        Cancelled
    }

    // The order of the exchange
    struct Order {
        uint256 orderId;
        address seller;
        address buyer;
        OrderStatus status;
    }
    mapping(uint256 => Order) public orders;

    struct OrderInfo {
    uint256 orderId;
    address buyer;
    address seller;
    uint256 price;
    string name;
    OrderStatus status;
}

    // Events
    event OrderCreated(uint256 orderNumber);
    event OrderDeposited(uint256 orderNumber);
    event OrderFinished(uint256 orderNumber);
    event OrderCanceled(uint256 orderNumber);
    event OrderUpdated(uint256 orderNumber);

    function initialize(ERC20 _currency, address _productManager) public initializer {
        owner = msg.sender;
        currency = _currency;
        productManager = IProductManager(_productManager);
        orderNumber = 0;
    }

    // The seller set the price of the goods and the amount of goods
    function setPriceAndGoods(string memory _name, uint256 _price) public {
        productManager.createProduct(_name, _price);
        orderNumber++;
        orders[orderNumber] = Order(orderNumber,msg.sender, address(0), OrderStatus.Created);

        emit OrderCreated(orderNumber);
    }

    // The seller updates the order
    function updateOrder(
        uint256 _orderNumber,
        string memory _name,
        uint256 _price
    ) public {
        require(orders[_orderNumber].seller == msg.sender, "Only the seller can update the order");
        require(
            orders[_orderNumber].status == OrderStatus.Created || orders[_orderNumber].status == OrderStatus.Updated,
            "Order status is not Created or Updated or has been deposited"
        );
        require(_price > 0, "The price should be greater than 0");
        require(bytes(_name).length > 0, "The name should not be empty");

        productManager.updateProduct(_orderNumber, _name, _price);
        orders[_orderNumber].status = OrderStatus.Updated;
        emit OrderUpdated(_orderNumber);
    }

    // The seller cancels the order
    function cancelOrderBySeller(uint256 _orderNumber) public {
        require(orders[_orderNumber].seller == msg.sender, "Only the seller can cancel the order");
        require(
            orders[_orderNumber].status == OrderStatus.Created || orders[_orderNumber].status == OrderStatus.Updated,
            "Order status is not Created or has been deposited"
        );
        productManager.deleteProduct(_orderNumber);
        orders[_orderNumber].status = OrderStatus.Cancelled;
        emit OrderCanceled(_orderNumber);
    }

    // The buyer deposits the currency into the exchange
    // The buyer should be approved by the owner
    // The depositted currency should link to the order
    function depositCurrency(uint256 _orderNumber) public {
        (, , uint256 price , ) = productManager.getProduct(_orderNumber);
        require(
            orders[_orderNumber].status == OrderStatus.Created ||
                orders[_orderNumber].status == OrderStatus.Updated,
            "The order status should be created or updated"
        );
        require(
            currency.balanceOf(msg.sender) >= price,
            "The buyer does not have enough currency"
        );
        require( orders[_orderNumber].seller != msg.sender, "The seller cannot deposit currency" );
        
        orders[_orderNumber].buyer = msg.sender;

        currency.transferFrom(msg.sender, address(this), price);
        emit OrderDeposited(_orderNumber);

        orders[_orderNumber].status = OrderStatus.Deposited;
    }

    // Receive the goods and transfer the currency to the seller
    function receiveGoods(uint256 _orderNumber) public {
        (, , uint256 price,  ) = productManager.getProduct(
            _orderNumber
        );
        require(
            currency.balanceOf(address(this)) >= price,
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
        currency.transfer(orders[_orderNumber].seller, price);
        orders[_orderNumber].status = OrderStatus.Finished;
        emit OrderFinished(_orderNumber);
    }

    // The buyer cancels the order and gets the currency back

    function getOrder(
        uint256 _orderNumber
    )
        public
        view
        returns (OrderInfo memory)
    {
        (, string memory name, uint256 price,  ) = productManager
            .getProduct(_orderNumber);
        Order memory order = orders[_orderNumber];
        return OrderInfo({
        orderId: order.orderId,
        buyer: order.buyer,
        seller: orders[_orderNumber].seller,
        price: price,
        name: name,
        status: order.status
    });
    }

    function getOrders() public view returns (OrderInfo[] memory) {
        OrderInfo[] memory _orders = new OrderInfo[](orderNumber);
        for (uint256 i = 0; i < orderNumber; i++) {
            _orders[i] = getOrder(i + 1);
        }
        return _orders;
    }
}
