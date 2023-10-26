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

    //uint256[] carList;
    address public manager;
    mapping(address => uint256[]) public carList;

    modifier onlyManager {
        require(msg.sender == manager, "Only system manager");
        _;
    }

    constructor() ERC721("ZJUToken", "ZJUTokenSymbol") {
        manager = msg.sender;
    }

    function helloworld() pure external returns(string memory) {
        return "hello world";
    }

    // ...
    // TODO add any logic if you want

    function mint(address to) onlyManager public {
        uint256 token = uint256(keccak256(abi.encode(block.timestamp, msg.sender))) ;
        _mint(to, token);
        cars[token] = Car(to, address(0), 0);
        carList[to].push(token);
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

    function getAllCars() view public returns (uint256[] memory) {
        return carList[msg.sender];
    }

    function getAllUnborrowedCars() view public returns (uint256[] memory) {
        uint256 sum = 0;
        uint256 index = 0;
        for(uint256 i = 0; i < carList[msg.sender].length; i++) {
            uint256 token = carList[msg.sender][i];
            if(cars[token].borrower == address(0)) 
                sum++;
        }
        uint256[] memory tmp = new uint256[](sum);
        for(uint256 i = 0; i < carList[msg.sender].length; i++) {
            uint256 token = carList[msg.sender][i];
            if(cars[token].borrower == address(0)) 
                tmp[index++] = token;
        }
        return tmp;
    }

    function getOwner(uint256 token) view public returns (address) {
        require(cars[token].owner != address(0), "The car has no owner or not exists");
        return cars[token].owner;
    }

    function getBorrower(uint256 token) view public returns (address) {
        require(cars[token].owner != address(0), "The car has no owner or not exists");
        return cars[token].borrower;
    }
}