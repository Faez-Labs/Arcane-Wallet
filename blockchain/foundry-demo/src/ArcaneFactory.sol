// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ArcaneAMM.sol";

contract AMMFactory {
    address[] public allPairs;
    mapping(address => mapping(address => address)) public getPair;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function createPair(address token0, address token1, string memory lpTokenName, string memory lpTokenSymbol) public returns (address pair) {
        require(token0 != token1, "Identical addresses");
        require(token0 != address(0) && token1 != address(0), "Zero address");
        require(getPair[token0][token1] == address(0), "Pair already exists");

        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        ArcaneAMM newPair = new ArcaneAMM{salt: salt}(token0, token1, lpTokenName, lpTokenSymbol);

        getPair[token0][token1] = address(newPair);
        getPair[token1][token0] = address(newPair);
        allPairs.push(address(newPair));

        emit PairCreated(token0, token1, address(newPair), allPairs.length);
        return address(newPair);
    }

    function getAllPairs() external view returns (address[] memory) {
        return allPairs;
    }
}
