const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestCoin", function () {
  let testcoin, owner, addr1, addr2;
  it("Should deploy testcoin", async function () {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    addr1 = accounts[1];
    addr2 = accounts[2];
    const TestCoin = await ethers.getContractFactory("TestCoin");
    testcoin = await TestCoin.deploy();
    await testcoin.deployed();

    expect(await testcoin.name()).to.equal("TestCoin");
  });

  it("should be mintable", async function () {
    const beforeMintBal = await testcoin.balanceOf(addr1.address);
    const mint = await testcoin
      .connect(owner)
      .mint(addr1.address, ethers.utils.parseEther("100"));
    await mint.wait();
    const afterMintBal = await testcoin.balanceOf(addr1.address);

    expect(Number(beforeMintBal.toString())).to.be.lessThan(
      Number(afterMintBal.toString())
    );
  });

  it("should return the max supply", async function () {
    const maxSupply = await testcoin.getMaxSupply();
    expect(maxSupply.toString()).to.equal("100000000000000000000000000000");
  });

  it("should transfer some testcoin from addr1 to addr 2", async function () {
    const trasnferAmount = ethers.utils.parseEther("10");
    const tx = await testcoin
      .connect(addr1)
      .transfer(addr2.address, trasnferAmount);
    const promise = await tx.wait();
    expect(promise.events[0].args.value).to.equal("10000000000000000000");
  });
  
});
