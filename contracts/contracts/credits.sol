// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "hardhat/console.sol";

contract Credits is ERC20 {
    
    mapping(address => bool) claimedList;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function creditsMint(address to) public {
        require(claimedList[to] == false, "This user has claimed airdrop already");
        _mint(to, 1024);
        claimedList[to] = true;
    }

    function transferCredits(address from, address to, uint256 amount) public {
        _transfer(from, to, amount);
    }
}