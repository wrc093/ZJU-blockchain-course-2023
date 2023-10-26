// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment the line to use openzeppelin/ERC721
// You can use this dependency directly because it has been installed by TA already
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract BorrowYourCar is ERC721 {

    // use a event if you want
    // to represent time you can choose block.timestamp
    event CarBorrowed(uint32 carTokenId, address borrower, uint256 startTime, uint256 duration);

    // maybe you need a struct to store car information
    struct Car {
        address owner;
        address borrower;
        uint256 borrowUntil;
    }

    mapping(uint256 => Car) public cars; // A map from car index to its information
    // ...
    // TODO add any variables if you want

    uint256[] carList;
    int carNum = 10;
    address public manager;

    constructor() ERC721("ZJUToken", "ZJUTokenSymbol") {
    }

    function helloworld() pure external returns(string memory) {
        return "hello world";
    }

    // ...
    // TODO add any logic if you want

    function mint(address to, uint256 token) public {
        _mint(to, token);
        cars[token] = Car(to, address(0), 0);
        carList.push(token);
    }

    function borrowCar(uint256 token, uint256 time) public {
        require(cars[token].borrower == address(0), "The car has been borrowed.");
        cars[token].borrower = msg.sender;
        cars[token].borrowUntil = time + block.timestamp;
    } 

    function returnCar(uint256 token) public {
        require(cars[token].borrower == msg.sender, "The returner should be the renter of this car.");
        require(cars[token].borrowUntil >= block.timestamp, "The return time is expired.");
        cars[token].borrower = address(0);
    }

    function getAllCars() public returns (uint256[] memory) {
        return carList;
    }

    uint256[] unborrowedCars;

    function getAllUnborrowedCars() public returns (uint256[] memory) {
        delete unborrowedCars;
        int index = 0;
        for(uint256 i = 0; i < carList.length; i++) {
            uint256 token = carList[i];
            if(cars[token].borrower == address(0)) 
                unborrowedCars.push(token);
        }
        return unborrowedCars;
    }

    function getOwner(uint256 token) public returns (address) {
        require(cars[token].owner != address(0), "The car has no owner or not exists");
        return cars[token].owner;
    }

    function getBorrower(uint256 token) public returns (address) {
        require(cars[token].owner != address(0), "The car has no owner or not exists");
        return cars[token].borrower;
    }
}