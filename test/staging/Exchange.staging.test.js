// Test the smart contract Exchange for correct behavior on NeoX testnet

const { expect, assert } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");
const { ethers, network, getNamedAccounts } = require("hardhat");
require("dotenv").config();

// Start test block
developmentChains.includes(network.name)
  ? describe.skip
  : describe("Exchange Contract", function () {
      let exchange, currency, deployer, alice, bob;

      const IOT_CONTRACT_ADDR = process.env.IOT_CONTRACT_ADDR;
      const EXCHANGE_CONTRACT_ADDR = process.env.EXCHANGE_CONTRACT_ADDR;
      const NEOX_RPC_URL = process.env.NEOX_RPC_URL;

      beforeEach(async () => {
        const accounts = await getNamedAccounts();
        const provider = new ethers.JsonRpcProvider(NEOX_RPC_URL);
        deployer = provider.getSigner(accounts.deployer);
        alice = provider.getSigner(accounts.alice);
        bob = provider.getSigner(accounts.bob);
        currency = await ethers.getContractAt("Currency", IOT_CONTRACT_ADDR);
        exchange = await ethers.getContractAt(
          "Exchange",
          EXCHANGE_CONTRACT_ADDR
        );
      });
      describe("Constructor", async () => {
        it("Should set the right currency address", async () => {
          expect(await exchange.currency()).to.equal(
            await currency.getAddress()
          );
        });
      });
      describe("Set price and goods", async () => {
        it("Should revert if price is not greater than 0", async () => {
          await expect(
            exchange.connect(alice).setPriceAndGoods(0, 100)
          ).to.be.revertedWith("The price should be greater than 0");
        });
        it("Should revert if amount is not greater than 0", async () => {
          await expect(
            exchange.connect(alice).setPriceAndGoods(1, 0)
          ).to.be.revertedWith("The amount should be greater than 0");
        });
        it("Should set the right price and goods ", async () => {
          await expect(exchange.connect(alice).setPriceAndGoods(1, 100))
            .to.emit(exchange, "OrderCreated")
            .withArgs(0);
          const { buyer, seller, price, amount, status } =
            await exchange.getOrders(0);
          assert.equal(await exchange.orderNumber(), 1);
          assert.equal(seller, await alice.getAddress());
          assert.equal(price, 1);
          assert.equal(amount, 100);
          assert.equal(status, 0);
        });
      });
      describe("Deposite currency", function () {
        let balanceOfBobBefore, balanceOfBobAfter;
        beforeEach(async () => {
          await currency.connect(bob).approve(exchange, 1);
          balanceOfBobBefore = await currency.balanceOf(bob.address);
        });
        it("Should set bob as buyer and status as 1", async () => {
          await expect(exchange.connect(bob).depositCurrency(0))
            .to.emit(exchange, "OrderDeposited")
            .withArgs(0);
          const [buyer, seller, price, amount, status] =
            await exchange.getOrder(0);
          assert.equal(buyer, await bob.getAddress());
          assert.equal(status, 1);
        });
        it("Should send 1 IOTC to the contract", async () => {
          balanceOfBobAfter = await currency.balanceOf(bob.address);
          assert.equal(balanceOfBobBefore - balanceOfBobAfter, 1);
          assert.equal(await currency.balanceOf(exchange.getAddress()), 1);
        });
      });
      describe("Receive goods", function () {
        let balanceOfAliceBefore, balanceOfAliceAfter;
        beforeEach(async () => {
          balanceOfAliceBefore = await currency.balanceOf(alice.address);
        });
        it("Should revert if the order is not deposited", async () => {
          await expect(exchange.connect(bob).receiveGoods(1)).to.be.reverted;
        });
        it("Should revert if sender is not buyer", async () => {
          await expect(
            exchange.connect(alice).receiveGoods(0)
          ).to.be.revertedWith("Only the buyer can receive the goods");
        });
        it("Should send 1 IOTC to the seller", async () => {
          await expect(exchange.connect(bob).receiveGoods(0))
            .to.emit(exchange, "OrderFinished")
            .withArgs(0);
          balanceOfAliceAfter = await currency.balanceOf(alice.address);
          assert.equal(balanceOfAliceAfter - balanceOfAliceBefore, 1);
          assert.equal(await currency.balanceOf(exchange.getAddress()), 0);
        });
      });
    });
