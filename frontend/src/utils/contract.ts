import Addresses from './contract-addresses.json'
import Car from './abis/BorrowYourCar.json'
import Credit from './abis/Credits.json'

const Web3 = require('web3');

// @ts-ignore
// 创建web3实例
// 可以阅读获取更多信息https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3
let web3 = new Web3(window.web3.currentProvider)

// 修改地址为部署的合约地址
const CarAddress = Addresses.Car
const CarAbi = Car.abi
const CreditAdress = Addresses.Credit
const CreditAbi = Credit.abi

// 获取合约实例
const CarContract = new web3.eth.Contract(CarAbi, CarAddress);
const CreditContract = new web3.eth.Contract(CreditAbi, CreditAdress);

// 导出web3实例和其它部署的合约
export {web3, CarContract, CreditContract}