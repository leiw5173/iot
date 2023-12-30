// Test the Exchange smart contract

const { assert, expect } = require("chai");
const { ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Exchange", async () => {
      let exchange, deployer, alice, bob;
      let currency;
      beforeEach(async () => {
        [deployer, alice, bob] = await ethers.getSigners();

        const Currency = await ethers.getContractFactory("Currency", deployer);
        currency = await Currency.deploy();
        const Exchange = await ethers.getContractFactory("Exchange", deployer);
        exchange = await Exchange.deploy(currency.getAddress());

        await currency.transfer(alice.getAddress(), 1000);
      });
      describe("Constructor", async () => {
        it("Should set the currency address", async () => {
          assert.equal(await exchange.currency(), await currency.getAddress());
        });
      });
      describe("Set Price and Goods", function () {
        it("Should set the price and goods", async function () {
          await exchange.connect(alice).setPriceAndGoods(1, 100);
          const [buyer, seller, price, amount, status] =
            await exchange.getOrder(0);
          assert.equal(await exchange.orderNumber(), 1);
          assert.equal(seller, await alice.getAddress());
          assert.equal(price, 1);
          assert.equal(amount, 100);
          assert.equal(status, 0);
        });
        it("Should emit OrderCreated event", async function () {
          await expect(exchange.connect(alice).setPriceAndGoods(1, 100))
            .to.emit(exchange, "OrderCreated")
            .withArgs(0);
        });
        it("Should revert if price is not greater than zero", async function () {
          await expect(
            exchange.connect(alice).setPriceAndGoods(0, 100)
          ).to.be.revertedWith("The price should be greater than 0");
        });
        it("Should revert if amount is not greater than zero", async function () {
          await expect(
            exchange.connect(alice).setPriceAndGoods(1, 0)
          ).to.be.revertedWith("The amount should be greater than 0");
        });
        it("Order Number should be 1", async function () {
          await exchange.connect(alice).setPriceAndGoods(1, 100);
          assert.equal(await exchange.orderNumber(), 1);
        });
      });
      describe("Deposit Currency", function () {
        describe("Bob don't have enough currency", function () {
          beforeEach(async () => {
            await exchange.connect(alice).setPriceAndGoods(1, 100);
          });
          it("Should revert if order does not exist", async function () {
            await expect(exchange.connect(bob).depositCurrency(1)).to.be
              .reverted;
          });
          it("Should revert if bob don't have enough currency", async function () {
            await expect(
              exchange.connect(bob).depositCurrency(0)
            ).to.be.revertedWith("The buyer does not have enough currency");
          });
        });
        describe("Deposit Currency", function () {
          beforeEach(async () => {
            await exchange.connect(alice).setPriceAndGoods(1, 100);
            await currency.connect(deployer).transfer(bob.getAddress(), 1000);
            await currency.connect(bob).approve(exchange, 1000);
          });
          it("Should set bob as buyer and change status to 1 after deposit currency", async function () {
            await exchange.connect(bob).depositCurrency(0);
            const [buyer, seller, price, amount, status] =
              await exchange.getOrder(0);
            assert.equal(buyer, await bob.getAddress());
            assert.equal(status, 1);
          });
          it("Should emit OrderPaid event", async function () {
            await expect(exchange.connect(bob).depositCurrency(0))
              .to.emit(exchange, "OrderDeposited")
              .withArgs(0);
          });
          it("Should send 1 IOT token to exchange contract", async function () {
            const balanceOfBobBefore = await currency.balanceOf(bob.address);
            await exchange.connect(bob).depositCurrency(0);
            const balanceOfBobAfter = await currency.balanceOf(bob.address);
            assert.equal(await currency.balanceOf(exchange.getAddress()), 1);
            assert.equal(balanceOfBobBefore - balanceOfBobAfter, 1);
          });
        });
        describe("Receive Goods", function () {
          beforeEach(async () => {
            await exchange.connect(alice).setPriceAndGoods(1, 100);
            await currency.connect(deployer).transfer(bob.getAddress(), 1000);
            await currency.connect(bob).approve(exchange, 1000);
            await exchange.connect(bob).depositCurrency(0);
          });
          it("Should revert if order does not exist", async function () {
            await expect(exchange.connect(alice).receiveGoods(1)).to.be
              .reverted;
          });
          it("Should revert if sender is not buyer", async function () {
            await expect(
              exchange.connect(alice).receiveGoods(0)
            ).to.be.revertedWith("Only the buyer can receive the goods");
          });
          it("Should emit OrderFinished event", async function () {
            await expect(exchange.connect(bob).receiveGoods(0))
              .to.emit(exchange, "OrderFinished")
              .withArgs(0);
          });
          it("Should send 1 IOT token to seller", async function () {
            const balanceOfAliceBeore = await currency.balanceOf(
              alice.getAddress()
            );
            await exchange.connect(bob).receiveGoods(0);
            const balanceOfAliceAfter = await currency.balanceOf(
              alice.getAddress()
            );
            assert.equal(await currency.balanceOf(exchange.getAddress()), 0);
            assert.equal(balanceOfAliceAfter - balanceOfAliceBeore, 1);
          });
        });
      });
    });
