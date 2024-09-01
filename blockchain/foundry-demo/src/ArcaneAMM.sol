// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;


import "./ArcLPToken.sol";

contract ArcaneAMM {
    address public token0;
    address public token1;
    uint256 public reserve0;
    uint256 public reserve1;
    ArcLPToken public lpToken;

    event Swap(address indexed sender, uint256 amountIn, uint256 amountOut, address indexed tokenIn, address indexed tokenOut);
    event AddLiquidity(address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidity);
    event RemoveLiquidity(address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidity);

    constructor(address _token0, address _token1, string memory lpTokenName, string memory lpTokenSymbol) {
        token0 = _token0;
        token1 = _token1;
        lpToken = new ArcLPToken(lpTokenName, lpTokenSymbol);
    }

    function addLiquidity(uint256 amount0, uint256 amount1) public {
        // Calculate how much liquidity tokens to mint
        uint256 liquidity;
        if (reserve0 == 0 && reserve1 == 0) {
            liquidity = sqrt(amount0 * amount1);
        } else {
            liquidity = min((amount0 * lpToken.totalSupply()) / reserve0, (amount1 * lpToken.totalSupply()) / reserve1);
        }

        require(liquidity > 0, "Insufficient liquidity minted");

        reserve0 += amount0;
        reserve1 += amount1;

        // Mint LP tokens to the provider
        lpToken.mint(msg.sender, liquidity);

        emit AddLiquidity(msg.sender, amount0, amount1, liquidity);
    }

    function removeLiquidity(uint256 liquidity) public {
        require(liquidity > 0, "Invalid liquidity amount");

        // Calculate the amount of tokens to return to the provider
        uint256 amount0 = (liquidity * reserve0) / lpToken.totalSupply();
        uint256 amount1 = (liquidity * reserve1) / lpToken.totalSupply();

        require(amount0 <= reserve0 && amount1 <= reserve1, "Insufficient liquidity");

        reserve0 -= amount0;
        reserve1 -= amount1;

        // Burn the provider's LP tokens
        lpToken.burn(msg.sender, liquidity);

        emit RemoveLiquidity(msg.sender, amount0, amount1, liquidity);
    }

    function swap(uint256 amountIn, bool isToken0) public returns (uint256 amountOut) {
        if (isToken0) {
            amountOut = getAmountOut(amountIn, reserve0, reserve1);
            require(amountOut <= reserve1, "Insufficient liquidity");
            reserve0 += amountIn;
            reserve1 -= amountOut;
        } else {
            amountOut = getAmountOut(amountIn, reserve1, reserve0);
            require(amountOut <= reserve0, "Insufficient liquidity");
            reserve1 += amountIn;
            reserve0 -= amountOut;
        }
        emit Swap(msg.sender, amountIn, amountOut, isToken0 ? token0 : token1, isToken0 ? token1 : token0);
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * 1000 + amountInWithFee;

        return numerator / denominator;
    }

    // Utility
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function min(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = x < y ? x : y;
    }
}
