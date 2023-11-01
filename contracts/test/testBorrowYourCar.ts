import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Test", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, user0, user1] = await ethers.getSigners();

    const BorrowYourCar = await ethers.getContractFactory("BorrowYourCar");
    const borrowYourCar = await BorrowYourCar.deploy();

    return { borrowYourCar, owner, user0, user1 };
  }

  describe("Deployment", function () {
    it("Should return hello world", async function () {
      const { borrowYourCar} = await loadFixture(deployFixture);
      expect(await borrowYourCar.helloworld()).to.equal("hello world");
    });
  });

  describe("Test mintCar",async function () {
    it("test mintCar", async function () {

      const { borrowYourCar, owner, user0, user1 } = await loadFixture(deployFixture);
      await borrowYourCar.connect(owner).mintCar(user0.address);
      const carList_user0 = await borrowYourCar.connect(user0.address).getAllCars();
      const carList_user1 = await borrowYourCar.connect(user1.address).getAllCars();
      expect(carList_user0.length).to.equal(1);
      expect(await borrowYourCar.getOwner(carList_user0[0])).to.equal(user0.address);
      expect(await borrowYourCar.getBorrower(carList_user0[0])).to.equal('0x0000000000000000000000000000000000000000');
      expect(carList_user1.length).to.equal(0);
    });
  });
/*
  describe("Test borrow and return",async function () {
    it("test borrow and return", async function () {

      const { borrowYourCar, owner, user0, user1 } = await loadFixture(deployFixture);
      await borrowYourCar.connect(owner).mintCar(user0.address);
      const carList_user0 = await borrowYourCar.connect(user0.address).getAllCars();
      var ubCars = await borrowYourCar.connect(user0).getAllUnborrowedCars();
      expect(ubCars.length).to.equal(1)
      //borrow
      await borrowYourCar.connect(user1).borrowCar(carList_user0[0], 1e6);
      expect(await borrowYourCar.getOwner(carList_user0[0])).to.equal(user0.address);
      expect(await borrowYourCar.getBorrower(carList_user0[0])).to.equal(user1.address);
      ubCars = await borrowYourCar.connect(user0).getAllUnborrowedCars();
      expect(ubCars.length).to.equal(0)
      //return
      await borrowYourCar.connect(user1).returnCar(carList_user0[0]);
      expect(await borrowYourCar.getOwner(carList_user0[0])).to.equal(user0.address);
      expect(await borrowYourCar.getBorrower(carList_user0[0])).to.equal('0x0000000000000000000000000000000000000000');
      ubCars = await borrowYourCar.connect(user0).getAllUnborrowedCars();
      expect(ubCars.length).to.equal(1);
    });
  });
*/
  describe("Test borrow with credits", async function () {
    it("test borrow with credits", async function () {
      const { borrowYourCar, owner, user0, user1 } = await loadFixture(deployFixture);
      await borrowYourCar.connect(owner).mintCar(user0.address);
      expect(await borrowYourCar.connect(user0).getBalance()).to.equal(0);
      const carList_user0 = await borrowYourCar.connect(user0.address).getAllCars();
      await borrowYourCar.connect(user0).mintCredits();
      await borrowYourCar.connect(user1).mintCredits();
      expect(await borrowYourCar.connect(user0).getBalance()).to.equal(1024);
      expect(await borrowYourCar.connect(user1).getBalance()).to.equal(1024);

      //borrow with credits
      await borrowYourCar.connect(user1).borrowCar(carList_user0[0], 3600);
      expect(await borrowYourCar.connect(user1).getBalance()).to.equal(1024 - 36);
      expect(await borrowYourCar.connect(user0).getBalance()).to.equal(1024 + 36);

      console.log(borrowYourCar.address);
      console.log(borrowYourCar.credits)
    })
  })


});