// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IProductManager {
    function createProduct(string memory _name, uint256 _price) external;

    function getProduct(
        uint256 _id
    ) external view returns (uint256, string memory, uint256, address, bool);

    function purchaseProduct(uint256 _id) external;

    function updateProduct(
        uint256 _id,
        string memory _name,
        uint256 _price
    ) external;

    function deleteProduct(uint256 _id) external;
}
