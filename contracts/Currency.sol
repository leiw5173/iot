// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// This contract is for the currency used in the IOT system
// It is a ERC20 token with a fixed supply of 1000000000

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Currency is ERC20 {
    constructor() ERC20("IOT Currency", "IOTC") {
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }

    function decimals() public view virtual override returns (uint8) {
        return 10;
    }
}
