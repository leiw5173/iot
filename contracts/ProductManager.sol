// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProductManager {
    struct Product {
        uint id;
        string name;
        uint price;
        address seller;
        bool purchased;
    }

    mapping(uint256 => Product) public products;
    uint256 internal productCount = 0;

    event ProductCreated(
        uint id,
        string name,
        uint price,
        address seller,
        bool purchased
    );
    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address seller,
        bool purchased
    );

    function createProduct(string memory _name, uint _price) public {
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(_price > 0, "Product price cannot be zero");
        productCount++;
        products[productCount] = Product(
            productCount,
            _name,
            _price,
            msg.sender,
            false
        );
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    function getProduct(
        uint _id
    )
        public
        view
        returns (
            uint id,
            string memory name,
            uint price,
            address seller,
            bool purchased
        )
    {
        require(_id > 0 && _id <= productCount, "Invalid product id");
        Product memory product = products[_id];
        return (
            product.id,
            product.name,
            product.price,
            product.seller,
            product.purchased
        );
    }

    function purchaseProduct(uint _id) public {
        require(_id > 0 && _id <= productCount, "Invalid product id");
        Product memory product = products[_id];
        require(!product.purchased, "Product already purchased");
        require(
            product.seller != msg.sender,
            "Cannot purchase your own product"
        );
        product.purchased = true;
        products[_id] = product;

        emit ProductPurchased(
            product.id,
            product.name,
            product.price,
            product.seller,
            product.purchased
        );
    }

    function updateProduct(uint _id, string memory _name, uint _price) public {
        require(_id > 0 && _id <= productCount, "Invalid product id");
        Product memory product = products[_id];
        require(product.seller == msg.sender, "Only seller can update product");
        require(!product.purchased, "Cannot update purchased product");
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(_price > 0, "Product price cannot be zero");
        product.name = _name;
        product.price = _price;
        products[_id] = product;
        emit ProductCreated(
            product.id,
            product.name,
            product.price,
            product.seller,
            product.purchased
        );
    }

    function deleteProduct(uint _id) public {
        require(_id > 0 && _id <= productCount, "Invalid product id");
        Product memory product = products[_id];
        require(product.seller == msg.sender, "Only seller can delete product");
        require(!product.purchased, "Cannot delete purchased product");
        delete products[_id];
    }
}
