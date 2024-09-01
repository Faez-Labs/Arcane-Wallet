// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ArcLPToken is ERC20 {
    address public ammInstance;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        ammInstance = msg.sender;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == ammInstance, "Only AMM instance can mint");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == ammInstance, "Only AMM instance can burn");
        _burn(from, amount);
    }
}
