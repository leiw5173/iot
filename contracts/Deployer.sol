// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract Proxy {
   address public proxyAdminAddress;
   address public proxyAddress;

   function deploy(address _implementation) public {
      ProxyAdmin proxyAdmin = new ProxyAdmin(msg.sender);
      proxyAdminAddress = address(proxyAdmin);

      TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
         _implementation,
         proxyAdminAddress,
         ""
      );
      proxyAddress = address(proxy);
   }
}