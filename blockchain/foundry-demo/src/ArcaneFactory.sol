// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ArcaneAMM.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract AMMFactory is Pausable, Ownable {
    address[] public allPairs;
    address public _owner;

    mapping(address => mapping(address => address)) public getPair;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);
    
    constructor(address initialOwner) Ownable(initialOwner) {
        _owner = initialOwner;
    }
    
    function createPair(address token0, address token1, string memory lpTokenName, string memory lpTokenSymbol) public onlyOwner returns (address pair) {
        require(token0 != token1, "Identical addresses");
        require(token0 != address(0) && token1 != address(0), "Zero address");
        require(getPair[token0][token1] == address(0), "Pair already exists");

        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        ArcaneAMM newPair = new ArcaneAMM{salt: salt}(_owner, token0, token1, lpTokenName, lpTokenSymbol);

        getPair[token0][token1] = address(newPair);
        getPair[token1][token0] = address(newPair);
        allPairs.push(address(newPair));

        emit PairCreated(token0, token1, address(newPair), allPairs.length);
        return address(newPair);
    }

    function getAllPairs() external view returns (address[] memory) {
        return allPairs;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
