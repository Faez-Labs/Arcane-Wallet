// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;


import "./ArcLPToken.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Contract to swap tokens from CrossFI to Solana
contract ArcaneAMMCC is Pausable, Ownable {
    IERC20 public token0;
    uint256 public reserve0;
    ArcLPToken public lpToken;

    event Swap(address indexed sender, string receiver, uint256 amount);
    event AddLiquidity(address indexed provider, uint256 amount0, uint256 liquidity);
    event RemoveLiquidity(address indexed provider, uint256 amount0, uint256 liquidity);

    constructor(
        address initialOwner,
        address _token0,
        string memory lpTokenName,
        string memory lpTokenSymbol
    ) Ownable(initialOwner) {
        token0 = IERC20(_token0);
        lpToken = new ArcLPToken(lpTokenName, lpTokenSymbol);
    }

    function addLiquidity(uint256 amount0) external {
        require(amount0 > 0, "Invalid amount");
        // Transfer tokens from the provider to the contract
        require(token0.allowance(msg.sender, address(this)) >= amount0, "Allowance not set");

        bool success = token0.transferFrom(msg.sender, address(this), amount0);
        require(success, "Token transfer failed");
        // Calculate how much liquidity tokens to mint
        
        uint256 liquidity;

        if (reserve0 == 0) {
            liquidity = sqrt(amount0);
        } else {
            liquidity = (amount0 * lpToken.totalSupply()) / reserve0;
        }

        require(liquidity > 0, "Insufficient liquidity minted");

        // Update the reserve
        reserve0 += amount0;

        // Mint LP tokens to the provider
        lpToken.mint(msg.sender, liquidity);

        emit AddLiquidity(msg.sender, amount0, liquidity);
    }

    function checkAllowance(address owner, address spender) public view returns (uint256) {
        return token0.allowance(owner, spender);
    }

    function removeLiquidity(uint256 liquidity) public {
        require(liquidity > 0, "Invalid liquidity amount");

        // Calculate the amount of tokens to return to the provider
        uint256 amount0 = (liquidity * reserve0) / lpToken.totalSupply();

        require(amount0 <= reserve0, "Insufficient liquidity");

        reserve0 -= amount0;

        // Burn the provider's LP tokens
        lpToken.burn(msg.sender, liquidity);

        emit RemoveLiquidity(msg.sender, amount0, liquidity);
    }

    function swap(uint256 amountIn, string memory receiver) external returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid amount");
        
        require(token0.allowance(msg.sender, address(this)) >= amountIn, "Allowance not set");

        bool success = token0.transferFrom(msg.sender, address(this), amountIn);
        require(success, "Token transfer failed");

        // Transfer output tokens to the receiver
        //success = token0.transfer(msg.sender, amountOut);
        //require(success, "Token transfer failed");

        // Emit the Swap event
        emit Swap(msg.sender, receiver, amountIn);

        return amountOut;
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

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
