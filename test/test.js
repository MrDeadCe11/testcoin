const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestCoin", function () {
  let testcoin, owner, addr1, addr2, blockNum;

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

  it("should transfer 10 testcoin from addr1 to addr 2", async function () {
    const transferAmount = ethers.utils.parseEther("10");
    const tx = await testcoin
      .connect(addr1)
      .transfer(addr2.address, transferAmount);
    const promise = await tx.wait();
    expect(promise.events[0].args.value).to.equal("10000000000000000000");
  });

  it("should take a snapshot", async function () {
    await expect(testcoin.connect(owner).snapshot()).to.emit(
      testcoin,
      "Snapshot"
    );
  });

  it("should get the supply of the snapshot", async function () {
    const tx = await testcoin.totalSupplyAt(1);
    expect(ethers.utils.formatEther(tx.toString())).to.equal("10000100.0");
  });

  it("should approve a spender for 10 eth and  the spender should spend", async function () {
    await testcoin
      .connect(owner)
      .approve(addr1.address, ethers.utils.parseEther("10"));

    const transfer = await testcoin
      .connect(addr1)
      .transferFrom(
        owner.address,
        addr1.address,
        ethers.utils.parseEther("10")
      );

    const promise = await transfer.wait();
    expect(promise.events[1].args.value).to.equal("10000000000000000000");
  });

  it("should delegate owner votes to owner", async function () {
    const delegate = await testcoin.delegate(owner.address);
    const promise = await delegate.wait();
    const votes = await testcoin.getVotes(owner.address);
    blockNum = await promise.blockNumber;
    expect(votes.toString()).to.equal("9999990000000000000000000");
  });

  it("mint 1000 testcoin to addr2", async function () {
    const beforeMint = await testcoin.balanceOf(addr2.address);
    const mint = await testcoin.mint(
      addr2.address,
      ethers.utils.parseEther("1000")
    );
    await mint.wait();
    const afterMint = await testcoin.balanceOf(addr2.address);
    expect(afterMint.sub(beforeMint)).to.equal(ethers.utils.parseEther("1000"));
  });

  it("should retreive voting power snapshot for owner at previous block", async function () {
    const tx = await testcoin.getPastVotes(owner.address, blockNum);
    expect(ethers.utils.formatEther(tx)).to.equal("9999990.0");
  });

  it("should transfer ownership to addr1", async function () {
    const tx = await testcoin.transferOwnership(addr1.address);
    const promise = await tx.wait();
    expect(promise.events[0].args.newOwner).to.equal(addr1.address);
  });
});
