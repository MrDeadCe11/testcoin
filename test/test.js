const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestCoin", function () {
  let testcoin, owner, addr1, addr2;
  it("Should deploy testcoin", async function () {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    addr1 = accounts[1];
    addr2 = accounts[2];
    console.log(owner.address, addr1.address, addr2.address);
    const TestCoin = await ethers.getContractFactory("TestCoin");
    testcoin = await TestCoin.deploy();
    await testcoin.deployed();

    expect(await testcoin.name()).to.equal("TestCoin");
  });
  it("should be mintable", async function () {
    const beforeMintBal = await testcoin.balanceOf(addr1.address);
    console.log(addr1.address, owner.address);
    const mint = await testcoin
      .connect(owner)
      .mint(addr1.address, ethers.utils.parseEther("1"));
    await mint.wait();
    const afterMintBal = await testcoin.balanceOf(addr1.address);

    expect(Number(beforeMintBal.toString())).to.be.lessThan(
      Number(afterMintBal.toString())
    );
  });
});
