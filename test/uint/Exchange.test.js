// Test the Exchange smart contract

const { assert, expect } = require("chai");
const { ethers, network, upgrades } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { encodeBytes32String } = require("ethers");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Exchange", async () => {
      const mutipler = 10 ** 10;
      let exchange, deployer, alice, bob;
      let currency, product, proxy;
      beforeEach(async () => {
        [deployer, alice, bob] = await ethers.getSigners();

        const Currency = await ethers.getContractFactory("Currency", deployer);
        currency = await Currency.deploy();
        const Product = await ethers.getContractFactory(
          "ProductManager",
          deployer
        );
        product = await Product.deploy();
        const Exchange = await ethers.getContractFactory("Exchange", deployer);
        proxy = await upgrades.deployProxy(
          Exchange,
          [await currency.getAddress(), await product.getAddress()],
          { initializer: "initialize" }
        );

        await currency.transfer(alice.getAddress(), 1000);
      });
      describe("Constructor", async () => {
        it("Should set the currency address", async () => {
          assert.equal(await proxy.currency(), await currency.getAddress());
        });
        it("Should set the product address", async () => {
          assert.equal(
            await proxy.productManager(),
            await product.getAddress()
          );
        });
      });
      describe("Set Price and Goods", function () {
        it("Should set the price and goods", async function () {
          await proxy.connect(alice).setPriceAndGoods("100 Stones", 1);
          const [orderId, buyer, seller, price, name, status] =
            await proxy.getOrder(1);
          assert.equal(orderId, 1);
          assert.equal(await proxy.orderNumber(), 1);
          assert.equal(buyer, ethers.ZeroAddress);
          assert.equal(seller, await alice.getAddress());
          assert.equal(price, 1);
          assert.equal(name, "100 Stones");
          assert.equal(status, 0);
        });
        it("Should emit OrderCreated event", async function () {
          await expect(proxy.connect(alice).setPriceAndGoods("100 Stones", 1))
            .to.emit(proxy, "OrderCreated")
            .withArgs(1);
        });
        it("Should revert if price is not greater than zero", async function () {
          await expect(
            proxy.connect(alice).setPriceAndGoods("100 Stones", 0)
          ).to.be.revertedWith("Product price cannot be zero");
        });
        it("Should revert if the name is empty", async function () {
          await expect(
            proxy.connect(alice).setPriceAndGoods("", 1)
          ).to.be.revertedWith("Product name cannot be empty");
        });
      });
      describe("Update order", function () {
        beforeEach(async () => {
          await proxy.connect(alice).setPriceAndGoods("100 Stones", 1);
        });
        it("Should revert if order does not exist", async function () {
          await expect(proxy.connect(alice).updateOrder(2, "100 Stones", 200))
            .to.be.reverted;
        });
        it("Should revert if sender is not seller", async function () {
          await expect(
            proxy.connect(bob).updateOrder(1, "100 Stones", 200)
          ).to.be.revertedWith("Only the seller can update the order");
        });
        it("Should revert if status is not 0", async function () {
          await currency.connect(deployer).transfer(bob.getAddress(), 1000);
          await currency.connect(bob).approve(proxy, 1000);
          await proxy.connect(bob).depositCurrency(1);
          await expect(
            proxy.connect(alice).updateOrder(1, "100 Stones", 200)
          ).to.be.revertedWith("Order status is not Created");
        });
        it("Should emit OrderUpdated event", async function () {
          await expect(proxy.connect(alice).updateOrder(1, "100 Stones", 200))
            .to.emit(proxy, "OrderUpdated")
            .withArgs(1);
        });
        it("Should update price, amount, and status", async function () {
          await proxy.connect(alice).updateOrder(1, "200 Stones", 200);
          const [orderId, buyer, seller, price, name, status] =
            await proxy.getOrder(1);
          assert.equal(price, 200);
          assert.equal(name, "200 Stones");
          assert.equal(status, 3);
        });
      });
      describe("Cancel Order by Seller", function () {
        beforeEach(async () => {
          await proxy.connect(alice).setPriceAndGoods("100 Stones", 1);
        });
        it("Should revert if order does not exist", async function () {
          await expect(proxy.connect(alice).cancelOrderBySeller(2)).to.be
            .reverted;
        });
        it("Should revert if sender is not seller", async function () {
          await expect(
            proxy.connect(bob).cancelOrderBySeller(1)
          ).to.be.revertedWith("Only the seller can cancel the order");
        });
        it("Should revert if status is not 'Created' or 'Updated'", async function () {
          await currency.connect(deployer).transfer(bob.getAddress(), 1000);
          await currency.connect(bob).approve(proxy, 1000);
          await proxy.connect(bob).depositCurrency(1);
          await expect(
            proxy.connect(alice).cancelOrderBySeller(1)
          ).to.be.revertedWith(
            "Order status is not Created or has been deposited"
          );
        });
        it("Should emit OrderCanceled event", async function () {
          await expect(proxy.connect(alice).cancelOrderBySeller(1))
            .to.emit(proxy, "OrderCanceled")
            .withArgs(1);
        });
        it("Should set status to 'Canceled'", async function () {
          await proxy.connect(alice).cancelOrderBySeller(1);
          const [orderId, buyer, seller, price, amount, status] =
            await proxy.getOrder(1);
          assert.equal(status, 4);
        });
      });
      describe("Deposit Currency", function () {
        describe("Bob don't have enough currency", function () {
          beforeEach(async () => {
            await proxy.connect(alice).setPriceAndGoods("100 Stones", 1);
          });
          it("Should revert if order does not exist", async function () {
            await expect(proxy.connect(bob).depositCurrency(2)).to.be.reverted;
          });
          it("Should revert if bob don't have enough currency", async function () {
            await expect(
              proxy.connect(bob).depositCurrency(1)
            ).to.be.revertedWith("The buyer does not have enough currency");
          });
        });
        describe("Deposit Currency after Bob has enough currency", function () {
          beforeEach(async () => {
            await proxy.connect(alice).setPriceAndGoods("100 Stones", 1);
            await currency.connect(deployer).transfer(bob.getAddress(), 1000);
            await currency.connect(bob).approve(proxy, 1000);
          });
          it("Should set bob as buyer and change status to 1 after deposit currency", async function () {
            await proxy.connect(bob).depositCurrency(1);
            const [, buyer, , , , status] = await proxy.getOrder(1);
            assert.equal(buyer, await bob.getAddress());
            assert.equal(status, 1);
          });
          it("Should emit OrderPaid event", async function () {
            await expect(proxy.connect(bob).depositCurrency(1))
              .to.emit(proxy, "OrderDeposited")
              .withArgs(1);
          });
          it("Should send 1 IOT token to proxy contract", async function () {
            const balanceOfBobBefore = await currency.balanceOf(bob.address);
            await proxy.connect(bob).depositCurrency(1);
            const balanceOfBobAfter = await currency.balanceOf(bob.address);
            assert.equal(await currency.balanceOf(proxy.getAddress()), 1);
            assert.equal(balanceOfBobBefore - balanceOfBobAfter, 1);
          });
        });
      });
      describe("Receive Goods", function () {
        beforeEach(async () => {
          await proxy.connect(alice).setPriceAndGoods("100 Stones", 1);
          await currency.connect(deployer).transfer(bob.getAddress(), 1000);
          await currency.connect(bob).approve(proxy, 1000);
          await proxy.connect(bob).depositCurrency(1);
        });
        it("Should revert if order does not exist", async function () {
          await expect(proxy.connect(alice).receiveGoods(2)).to.be.reverted;
        });
        it("Should revert if sender is not buyer", async function () {
          await expect(proxy.connect(alice).receiveGoods(1)).to.be.revertedWith(
            "Only the buyer can receive the goods"
          );
        });
        it("Should emit OrderFinished event", async function () {
          await expect(proxy.connect(bob).receiveGoods(1))
            .to.emit(proxy, "OrderFinished")
            .withArgs(1);
        });
        it("Should send 1 IOT token to seller", async function () {
          const balanceOfAliceBeore = await currency.balanceOf(
            alice.getAddress()
          );
          await proxy.connect(bob).receiveGoods(1);
          const balanceOfAliceAfter = await currency.balanceOf(
            alice.getAddress()
          );
          assert.equal(await currency.balanceOf(proxy.getAddress()), 0);
          assert.equal(balanceOfAliceAfter - balanceOfAliceBeore, 1);
        });
      });
    });
